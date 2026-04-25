"""
Document extraction module.

Routing:
- PDF  → pdfplumber extracts text → Cerebras parses fields
- Image (JPG, PNG, WebP, etc.) → Mistral OCR extracts text → Mistral parses fields
- TXT  → passed directly to Cerebras

Edge cases handled:
- Empty files
- Scanned PDFs (no text layer) — raises ValueError with clear message
- Malformed / non-JSON LLM responses
- Missing or invalid fields (null coalescing + format validation)
- Missing API keys
"""

from __future__ import annotations

import base64
import io
import json
import logging
import os
import re

import pdfplumber
from cerebras.cloud.sdk import Cerebras
from mistralai import Mistral

logger = logging.getLogger(__name__)

MAX_CHARS = 8_000

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

CEREBRAS_SYSTEM_PROMPT = """You are an expert at reading official documents.
From the document text provided, extract the following fields and return ONLY a valid JSON object:
- first_name (string or null)
- last_name (string or null)
- date_of_birth (string in YYYY-MM-DD format, or null)
- nationality (ISO 3166-1 alpha-2 country code e.g. "FR", "DE", "GB", or null)
- document_type (one of: "passport", "id_card", "lease", "payslip", "bank_statement", "other", or null)

Rules:
- Return ONLY valid JSON. No prose, no markdown, no code fences.
- If a field is not clearly identifiable, set it to null. Never guess.
- Dates must be strictly in YYYY-MM-DD format.
- Nationality must be a 2-letter ISO 3166-1 alpha-2 code in uppercase."""

MISTRAL_EXTRACTION_PROMPT = """You are a passport and ID document reader.
The text above was extracted from a passport or ID document via OCR.
Extract the following fields and return ONLY a valid JSON object:
- first_name (string or null)
- last_name (string or null)
- date_of_birth (string in YYYY-MM-DD format, or null)
- nationality (ISO 3166-1 alpha-2 country code e.g. "FR", "DE", "GB", or null)
- document_type (one of: "passport", "id_card", "other", or null)

Rules:
- Return ONLY valid JSON. No prose, no markdown, no code fences.
- If a field is not clearly identifiable, set it to null. Never guess.
- Dates must be strictly in YYYY-MM-DD format."""


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _empty_extraction() -> dict:
    return {
        "first_name": None,
        "last_name": None,
        "date_of_birth": None,
        "nationality": None,
        "document_type": None,
    }


def _parse_llm_json(raw: str) -> dict:
    if "```" in raw:
        raw = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*?\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    logger.warning("Could not parse LLM response as JSON: %r", raw[:300])
    return {}


def _validate_and_clean(data: dict) -> dict:
    result = _empty_extraction()
    for field in ("first_name", "last_name", "document_type"):
        val = data.get(field)
        if isinstance(val, str) and val.strip():
            result[field] = val.strip()
    dob = data.get("date_of_birth")
    if isinstance(dob, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", dob.strip()):
        result["date_of_birth"] = dob.strip()
    nat = data.get("nationality")
    if isinstance(nat, str) and re.fullmatch(r"[A-Za-z]{2}", nat.strip()):
        result["nationality"] = nat.strip().upper()
    return result


# ---------------------------------------------------------------------------
# PDF path: pdfplumber → Cerebras
# ---------------------------------------------------------------------------

def extract_from_pdf(file_bytes: bytes) -> dict:
    """PDF → text via pdfplumber → structured fields via Cerebras."""
    if not file_bytes:
        raise ValueError("Empty file. Please upload a non-empty PDF.")

    try:
        text_parts: list[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            if not pdf.pages:
                raise ValueError("The PDF contains no pages.")
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Could not read PDF file: {e}") from e

    full_text = "\n".join(text_parts).strip()
    if not full_text:
        raise ValueError(
            "No text could be extracted from this PDF. "
            "It may be a scanned image — please upload an image file (JPG/PNG) instead."
        )

    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        raise RuntimeError("CEREBRAS_API_KEY is not configured.")

    client = Cerebras(api_key=api_key)
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": CEREBRAS_SYSTEM_PROMPT},
            {"role": "user", "content": f"Document text:\n\n{full_text[:MAX_CHARS]}"},
        ],
        temperature=0.1,
        max_tokens=300,
    )
    raw = response.choices[0].message.content.strip()
    return _validate_and_clean(_parse_llm_json(raw))


# ---------------------------------------------------------------------------
# Image path: Mistral OCR → Mistral chat
# ---------------------------------------------------------------------------

def extract_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """Image → OCR text via Mistral → structured fields via Mistral chat."""
    api_key = os.environ.get("MISTRAL_API_KEY")
    if not api_key:
        raise RuntimeError("MISTRAL_API_KEY is not configured.")

    client = Mistral(api_key=api_key)

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "image_url",
            "image_url": f"data:{mime_type};base64,{b64}",
        },
    )
    ocr_text = "\n".join(page.markdown for page in ocr_response.pages)

    chat_response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {"role": "user", "content": f"{ocr_text}\n\n{MISTRAL_EXTRACTION_PROMPT}"},
        ],
    )
    raw = chat_response.choices[0].message.content.strip()
    return _validate_and_clean(_parse_llm_json(raw))


# ---------------------------------------------------------------------------
# Plain text path
# ---------------------------------------------------------------------------

def extract_from_text(raw_text: str) -> dict:
    """Plain text → structured fields via Cerebras."""
    text = raw_text.strip()
    if not text:
        raise ValueError("Empty text provided.")

    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        raise RuntimeError("CEREBRAS_API_KEY is not configured.")

    client = Cerebras(api_key=api_key)
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": CEREBRAS_SYSTEM_PROMPT},
            {"role": "user", "content": f"Document text:\n\n{text[:MAX_CHARS]}"},
        ],
        temperature=0.1,
        max_tokens=300,
    )
    raw = response.choices[0].message.content.strip()
    return _validate_and_clean(_parse_llm_json(raw))
