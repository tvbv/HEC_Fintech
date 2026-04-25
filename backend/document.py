"""
Document text extraction and structured field parsing via Cerebras.

Supported file types:
- PDF  → text extracted with pdfplumber, then parsed by Cerebras llama3.1-8b
- TXT  → passed directly to Cerebras

Edge cases handled:
- Empty files
- Files that exceed the size limit
- Scanned PDFs (image-only, no extractable text)
- Malformed / non-JSON LLM responses (markdown fences, extra prose)
- Missing or invalid fields (null coalescing + format validation)
- Missing API key
- Network / API failures from Cerebras
"""

from __future__ import annotations

import io
import json
import logging
import os
import re

import pdfplumber
from cerebras.cloud.sdk import Cerebras

logger = logging.getLogger(__name__)

# Trim document text to avoid exceeding the context window
MAX_CHARS = 8_000

SYSTEM_PROMPT = """You are an expert at reading official documents (passports, ID cards, lease agreements, payslips, bank statements, etc.).

From the document text provided, extract the following fields and return ONLY a valid JSON object with these exact keys:
- first_name (string or null)
- last_name (string or null)
- date_of_birth (string in YYYY-MM-DD format, or null)
- nationality (ISO 3166-1 alpha-2 country code e.g. "FR", "DE", "GB", or null)
- document_type (one of: "passport", "id_card", "lease", "payslip", "bank_statement", "other", or null)

Rules:
- Return ONLY valid JSON. No prose, no markdown, no code fences.
- If a field is not clearly identifiable in the text, set it to null. Never guess.
- Dates must be strictly in YYYY-MM-DD format.
- Nationality must be a 2-letter ISO 3166-1 alpha-2 code in uppercase."""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _empty_extraction() -> dict:
    """Safe fallback when extraction or parsing fails."""
    return {
        "first_name": None,
        "last_name": None,
        "date_of_birth": None,
        "nationality": None,
        "document_type": None,
    }


def _parse_llm_json(raw: str) -> dict:
    """
    Robustly parse JSON from an LLM response.

    Handles:
    - Markdown code fences (```json ... ```)
    - Extra prose before/after the JSON object
    - Completely invalid output (returns empty dict)
    """
    # Strip markdown code fences
    if "```" in raw:
        raw = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()

    # Try direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Fallback: locate first JSON object in the string
    match = re.search(r"\{.*?\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    logger.warning("Could not parse LLM response as JSON. Raw output: %r", raw[:300])
    return {}


def _validate_and_clean(data: dict) -> dict:
    """
    Validate and sanitise extracted fields.

    - Strips whitespace from strings.
    - Rejects date_of_birth that don't match YYYY-MM-DD.
    - Rejects nationality that isn't a 2-letter uppercase code.
    - Sets invalid / missing fields to null.
    """
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


def _call_cerebras(text: str) -> dict:
    """
    Send document text to Cerebras and return parsed + validated fields.

    Raises:
        RuntimeError: If CEREBRAS_API_KEY is missing.
        Exception:    Propagates Cerebras SDK / network errors to caller.
    """
    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        raise RuntimeError(
            "CEREBRAS_API_KEY is not configured. "
            "Set it as an environment variable before starting the server."
        )

    client = Cerebras(api_key=api_key)

    # Trim to avoid context overflow; log a warning so ops can tune MAX_CHARS
    if len(text) > MAX_CHARS:
        logger.warning(
            "Document text truncated from %d to %d chars before sending to Cerebras.",
            len(text),
            MAX_CHARS,
        )
        text = text[:MAX_CHARS]

    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Document text:\n\n{text}"},
        ],
        temperature=0.1,   # low temperature = factual, deterministic extraction
        max_tokens=300,    # the JSON response is small; cap to avoid runaway output
    )

    raw = response.choices[0].message.content.strip()
    parsed = _parse_llm_json(raw)
    return _validate_and_clean(parsed)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_from_pdf(file_bytes: bytes) -> dict:
    """
    Full pipeline: PDF → text (pdfplumber) → Cerebras → validated JSON.

    Always returns a dict with the 5 expected keys (values may be null).

    Raises:
        ValueError:   If the PDF has no extractable text (e.g. scanned image).
        RuntimeError: If CEREBRAS_API_KEY is missing.
        Exception:    For Cerebras API / network failures.
    """
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
        logger.error("pdfplumber failed to open PDF: %s", e)
        raise ValueError(f"Could not read PDF file: {e}") from e

    full_text = "\n".join(text_parts).strip()
    if not full_text:
        raise ValueError(
            "No text could be extracted from this PDF. "
            "It may be a scanned image. Please upload a text-based PDF or a TXT file."
        )

    return _call_cerebras(full_text)


def extract_from_text(raw_text: str) -> dict:
    """
    Pipeline for plain-text input → Cerebras → validated JSON.

    Always returns a dict with the 5 expected keys (values may be null).

    Raises:
        ValueError:   If the text is empty.
        RuntimeError: If CEREBRAS_API_KEY is missing.
        Exception:    For Cerebras API / network failures.
    """
    text = raw_text.strip()
    if not text:
        raise ValueError("Empty text provided. Please upload a non-empty file.")

    return _call_cerebras(text)
