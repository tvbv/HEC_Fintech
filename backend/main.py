from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, init_db, save_profile, save_document
from models import IntakeRequest, IntakeResponse, DocumentUploadResponse, ExtractedDocument
from document import extract_from_image, convert_pdf_to_image

app = FastAPI(title="Expat Onboarding API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.post("/intake", response_model=IntakeResponse)
def intake(request: IntakeRequest):
    profile = request.model_dump()

    with Session(engine) as db:
        profile_id = save_profile(db, profile)

    return IntakeResponse(profile_id=profile_id)


@app.post("/upload-document", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    file_bytes = await file.read()

    # convert PDF to image if needed
    if file.content_type == "application/pdf" or file.filename.endswith(".pdf"):
        try:
            file_bytes = convert_pdf_to_image(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF conversion failed: {str(e)}")

    try:
        extracted = extract_from_image(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Extraction failed: {str(e)}")

    with Session(engine) as db:
        document_id = save_document(db, {
            "first_name": extracted.get("first_name"),
            "last_name": extracted.get("last_name"),
            "date_of_birth": extracted.get("date_of_birth"),
            "nationality": extracted.get("nationality"),
            "document_type": extracted.get("document_type"),
            "file_name": file.filename,
        })

    return DocumentUploadResponse(
        document_id=document_id,
        extracted=ExtractedDocument(**extracted)
    )


@app.get("/health")
def health():
    return {"status": "ok"}
