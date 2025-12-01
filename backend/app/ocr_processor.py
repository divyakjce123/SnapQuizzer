import easyocr
import cv2
import numpy as np
import base64
import io
from PIL import Image

class OCRProcessor:
    def __init__(self):
        # Initialize easyOCR reader (this will download models on first run)
        self.reader = easyocr.Reader(['en'])
        
    def preprocess_image(self, image_data: str):
        """Preprocess image for better OCR results"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to numpy array
            cv_image = np.array(image)
            
            # Convert to RGB if needed
            if len(cv_image.shape) == 2:
                cv_image = cv2.cvtColor(cv_image, cv2.COLOR_GRAY2RGB)
            elif cv_image.shape[2] == 4:
                cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGBA2RGB)
            
            return cv_image
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None
    
    def extract_text(self, image_data: str) -> str:
        """Extract text from image using easyOCR"""
        try:
            image = self.preprocess_image(image_data)
            if image is None:
                return ""
            
            # Use easyOCR to extract text
            results = self.reader.readtext(image, paragraph=True)
            
            # Combine all text
            text = "\n".join([result[1] for result in results])
            
            return text.strip()
        except Exception as e:
            print(f"Error extracting text: {e}")
            return ""
    
    def detect_mcq_pattern(self, text: str):
        """Detect MCQ patterns in extracted text"""
        lines = text.split('\n')
        questions = []
        current_question = ""
        options = []
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
                
            # Check if line looks like a question
            if (line.startswith('Q') or 
                line.startswith('Question') or
                line[0].isdigit() and ('.' in line or ')' in line) or
                len(line) > 30):  # Long text is likely a question
                
                # Save previous question if exists
                if current_question and options:
                    questions.append({
                        'question': current_question,
                        'options': options
                    })
                
                current_question = line
                options = []
                i += 1
                
                # Look for options in next lines
                while i < len(lines) and len(options) < 4:
                    option_line = lines[i].strip()
                    if (option_line.startswith(('A)', 'B)', 'C)', 'D)', 'a)', 'b)', 'c)', 'd)')) or
                        option_line.startswith(('A.', 'B.', 'C.', 'D.', 'a.', 'b.', 'c.', 'd.'))):
                        options.append(option_line)
                    i += 1
            else:
                i += 1
        
        # Add last question
        if current_question and options:
            questions.append({
                'question': current_question,
                'options': options
            })
        
        return questions

ocr_processor = OCRProcessor()