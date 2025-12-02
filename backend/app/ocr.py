import pytesseract
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import io
import base64
import re
import os

# --- PATH CONFIGURATION ---
# Try to automatically find Tesseract
possible_paths = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
]

TESSERACT_PATH = 'tesseract'
for path in possible_paths:
    if os.path.exists(path) and path.endswith('.exe'):
        TESSERACT_PATH = path
        break

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
print(f"Using Tesseract Path: {TESSERACT_PATH}")

class OCRService:
    @staticmethod
    def preprocess_image(image):
        """Advanced preprocessing for better OCR"""
        # 1. Convert to grayscale
        image = image.convert('L')
        
        # 2. Increase contrast (helps with faint text)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # 3. Apply sharpening (helps with blurry scans)
        image = image.filter(ImageFilter.SHARPEN)
        
        # 4. Auto-threshold (make background white, text black)
        # This helps Tesseract separate text from noise significantly
        image = ImageOps.autocontrast(image)
        
        return image

    @staticmethod
    def extract_text(base64_image: str) -> str:
        try:
            if "base64," in base64_image:
                base64_image = base64_image.split("base64,")[1]
            
            image_data = base64.b64decode(base64_image)
            image = Image.open(io.BytesIO(image_data))
            
            # Preprocess
            processed_image = OCRService.preprocess_image(image)
            
            # --- STRATEGY: Try Dual Extraction ---
            # Attempt 1: Standard Mode (Good for single column)
            text_standard = pytesseract.image_to_string(processed_image)
            
            # Attempt 2: Page Segmentation Mode 3 (Good for multi-column / complex layouts)
            # --psm 3: "Fully automatic page segmentation, but no OSD."
            text_layout = pytesseract.image_to_string(processed_image, config='--psm 3')
            
            # Decide which one is better based on length and detected options
            # If standard text is too short or doesn't look like an MCQ, trust the layout one
            if len(text_layout) > len(text_standard) + 50:
                 print("DEBUG: Using Layout Mode (PSM 3) result")
                 final_text = text_layout
            else:
                 print("DEBUG: Using Standard Mode result")
                 final_text = text_standard
                 
            # Debugging output to console
            print("-" * 30)
            print(f"EXTRACTED TEXT START:\n{final_text[:300]}")
            print("-" * 30)
            
            return final_text
        except Exception as e:
            print(f"OCR Critical Error: {e}")
            return ""

    @staticmethod
    def parse_mcq(text: str):
        # 1. Cleaning: Remove empty lines and excessive whitespace
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        questions = []
        
        current_q = {"question_text": "", "options": []}
        
        # REGEX PATTERNS
        # Detects: A. A) (a) [a] 1. 1)
        OPTION_PATTERN = re.compile(r'^[\(\[]?([a-eA-E]|[1-4])[\.\)\]]\s+(.*)')
        
        # Detects: 1. 1) Q1. Q.1. 108. 
        QUESTION_START_PATTERN = re.compile(r'^(\d+|Q\d*|Q\.)[\.\)\s]+(.*)')
        
        for line in lines:
            # --- CHECK FOR OPTION ---
            opt_match = OPTION_PATTERN.match(line)
            if opt_match:
                # If we have a question text, this is likely a valid option
                if current_q["question_text"]:
                    opt_label = opt_match.group(1).upper() # A, B, C or 1, 2, 3
                    opt_content = opt_match.group(2).strip()
                    
                    # Map numeric options (1,2,3,4) to letters (A,B,C,D) if needed
                    if opt_label.isdigit():
                        mapping = {'1':'A', '2':'B', '3':'C', '4':'D'}
                        opt_label = mapping.get(opt_label, opt_label)

                    current_q["options"].append({
                        "id": opt_label,
                        "text": opt_content,
                        "is_correct": False
                    })
                    continue # Move to next line

            # --- CHECK FOR QUESTION START ---
            q_match = QUESTION_START_PATTERN.match(line)
            
            # It's a new question IF:
            # 1. It matches the "1." or "Q1." pattern
            # 2. OR it's a long text line AND we don't have active options yet
            is_start = bool(q_match)
            is_text_continuation = (len(line) > 15 and not current_q["options"])
            
            if is_start or is_text_continuation:
                # If we have a "ready" question (text + options), save it before starting new one
                if current_q["question_text"] and len(current_q["options"]) >= 2:
                    questions.append(current_q)
                    current_q = {"question_text": "", "options": []}
                
                if is_start:
                    # Found "108. What is..." -> New Question
                    # Remove the number prefix for clean text
                    clean_text = q_match.group(2).strip()
                    
                    # Only overwrite if we aren't mid-question
                    if not current_q["question_text"] or current_q["options"]:
                         current_q = {"question_text": clean_text, "options": []}
                    else:
                         # Sometimes "1999." is detected as a list item inside a question text
                         current_q["question_text"] += " " + line
                else:
                    # Just text line. Append to current question text.
                    if current_q["question_text"]:
                         current_q["question_text"] += " " + line
                    else:
                         current_q["question_text"] = line

            # --- SAFETY CHECK ---
            # If we have 4 options, the next thing MUST be a new question or end
            if len(current_q["options"]) >= 4:
                questions.append(current_q)
                current_q = {"question_text": "", "options": []}

        # Save the very last question found
        if current_q["question_text"] and len(current_q["options"]) >= 2:
            questions.append(current_q)
            
        print(f"DEBUG: Parsed {len(questions)} questions successfully.")
        return questions