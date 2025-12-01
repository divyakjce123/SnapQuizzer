import pytesseract
from PIL import Image
import io
import base64
import re

# Set path if on Windows, otherwise relying on Docker ENV
# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract' 

class OCRService:
    @staticmethod
    def extract_text(base64_image: str) -> str:
        try:
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
            
            image_data = base64.b64decode(base64_image)
            image = Image.open(io.BytesIO(image_data))
            
            # Simple preprocessing could be added here (grayscale, etc.)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"OCR Error: {e}")
            return ""

    @staticmethod
    def parse_mcq(text: str):
        """Simple heuristic to convert text block into question format"""
        # This is a basic parser. In a real app, use an LLM (OpenAI/Gemini) here.
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        questions = []
        
        # Dummy logic: Treat first line as question, lines starting with A/B/C/D as options
        if not lines:
            return []

        current_q = {"question_text": "Parsed Question", "options": []}
        
        for line in lines:
            if re.match(r'^[A-D][\).]', line):
                # It's an option
                opt_id = line[0]
                opt_text = line[2:].strip()
                current_q["options"].append({
                    "id": opt_id,
                    "text": opt_text,
                    "is_correct": False
                })
            elif len(line) > 10 and "?" in line:
                 # New Question found (simplified logic)
                 if current_q["options"]:
                     questions.append(current_q)
                     current_q = {"question_text": line, "options": []}
                 else:
                     current_q["question_text"] = line
        
        if current_q["options"]:
            questions.append(current_q)
            
        return questions