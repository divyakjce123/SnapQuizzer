from fastapi import APIRouter, HTTPException
from app.schemas import ImageUpload
from app.services.ocr import OCRService

router = APIRouter(prefix="/process", tags=["Processing"])

@router.post("/image")
def process_image(data: ImageUpload):
    # 1. Extract Text
    text = OCRService.extract_text(data.image_data)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text")
    
    # 2. Structure (Mock/Heuristic)
    # In production, send 'text' to Gemini/OpenAI API here
    questions = OCRService.parse_mcq(text)
    
    return {
        "success": True,
        "raw_text": text,
        "detected_questions": questions
    }