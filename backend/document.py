import os
import json
import base64
import io
from mistralai import Mistral

EXTRACTION_PROMPT = """You are a passport and ID document reader.
The text above was extracted from a passport or ID document via OCR.
Extract the following fields and return ONLY a valid JSON object with these keys:
- first_name (string)
- last_name (string)
- date_of_birth (string, format YYYY-MM-DD)
- nationality (string, ISO 3166-1 alpha-2 country code e.g. "FR", "DE", "GB")
- document_type (string: "passport" or "id_card")

If a field cannot be found, set it to null.
Return ONLY valid JSON. No prose, no markdown, no code fences."""


def extract_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

    # Step 1: OCR — extract raw text from the document image
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "image_url",
            "image_url": f"data:{mime_type};base64,{b64}",
        },
    )
    ocr_text = "\n".join(page.markdown for page in ocr_response.pages)

    # Step 2: Use Mistral chat to extract structured fields from OCR text
    chat_response = client.chat.complete(
        model="mistral-small-latest",
        messages=[
            {"role": "user", "content": f"{ocr_text}\n\n{EXTRACTION_PROMPT}"},
        ],
    )

    raw = chat_response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def convert_pdf_to_image(file_bytes: bytes) -> bytes:
    from pdf2image import convert_from_bytes
    pages = convert_from_bytes(file_bytes, first_page=1, last_page=1)
    buf = io.BytesIO()
    pages[0].save(buf, format="PNG")
    return buf.getvalue()
