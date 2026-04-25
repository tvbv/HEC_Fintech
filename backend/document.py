import os
import json
from google import genai
from google.genai import types
import io

SYSTEM_PROMPT = """You are a passport and ID document reader.
Extract the following fields from the document image and return ONLY a valid JSON object with these keys:
- first_name (string)
- last_name (string)
- date_of_birth (string, format YYYY-MM-DD)
- nationality (string, ISO 3166-1 alpha-2 country code e.g. "FR", "DE", "GB")
- document_type (string: "passport" or "id_card")

If a field cannot be read clearly, set it to null.
Return ONLY valid JSON. No prose, no markdown, no code fences."""


def extract_from_image(image_bytes: bytes) -> dict:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            SYSTEM_PROMPT,
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        ],
    )

    raw = response.text.strip()
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
