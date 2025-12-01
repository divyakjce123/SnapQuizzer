from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db, engine, Base
from app import schemas
from app.ocr_processor import ocr_processor
from app.ai_processor import ai_processor

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SnapQuizzer API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock user system (replace with real auth later)
current_user_id = 1

# In-memory storage (replace with database later)
quizzes = []
questions = []

@app.get("/")
def read_root():
    return {"message": "SnapQuizzer API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/process-image")
def process_image(data: schemas.ImageUpload):
    """Process image and extract questions"""
    try:
        # Extract text using OCR
        extracted_text = ocr_processor.extract_text(data.image_data)
        
        if not extracted_text:
            return {
                "success": False,
                "error": "No text could be extracted from the image",
                "processed_questions": []
            }
        
        # Detect MCQ patterns
        mcqs = ocr_processor.detect_mcq_pattern(extracted_text)
        
        processed_questions = []
        for mcq in mcqs:
            # Structure using AI (simplified for now)
            structured = {
                "question_text": mcq.get('question', ''),
                "options": [],
                "predicted_answer": [],
                "confidence_score": 0.8,
                "explanation": "AI-generated explanation"
            }
            
            # Parse options
            for opt in mcq.get('options', []):
                # Extract option ID and text
                opt_id = opt[0].upper() if opt else 'A'
                opt_text = opt[2:] if len(opt) > 2 else opt
                
                structured["options"].append({
                    "id": opt_id,
                    "text": opt_text,
                    "is_correct": False
                })
            
            # Mark first option as correct for demo
            if structured["options"]:
                structured["options"][0]["is_correct"] = True
                structured["predicted_answer"] = [structured["options"][0]["id"]]
            
            processed_questions.append(structured)
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "processed_questions": processed_questions,
            "total_questions": len(processed_questions)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "processed_questions": []
        }

@app.post("/quizzes")
def create_quiz(quiz: schemas.QuizCreate):
    """Create a new quiz"""
    try:
        quiz_id = len(quizzes) + 1
        quiz_dict = quiz.dict()
        quiz_dict["id"] = quiz_id
        quiz_dict["owner_id"] = current_user_id
        quiz_dict["created_at"] = "2024-01-01T00:00:00"
        
        quizzes.append(quiz_dict)
        
        # Store questions
        for q in quiz.questions:
            question_id = len(questions) + 1
            question_dict = q.dict()
            question_dict["id"] = question_id
            question_dict["quiz_id"] = quiz_id
            questions.append(question_dict)
        
        return quiz_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/quizzes")
def get_quizzes():
    """Get all quizzes for current user"""
    user_quizzes = [q for q in quizzes if q.get("owner_id") == current_user_id]
    
    # Add questions to each quiz
    for quiz in user_quizzes:
        quiz["questions"] = [q for q in questions if q.get("quiz_id") == quiz["id"]]
    
    return user_quizzes

@app.get("/quizzes/{quiz_id}")
def get_quiz(quiz_id: int):
    """Get a specific quiz"""
    quiz = next((q for q in quizzes if q["id"] == quiz_id and q.get("owner_id") == current_user_id), None)
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz["questions"] = [q for q in questions if q.get("quiz_id") == quiz_id]
    return quiz

@app.post("/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: int, submission: schemas.QuizSubmission):
    """Submit quiz answers"""
    try:
        # Find quiz
        quiz = next((q for q in quizzes if q["id"] == quiz_id), None)
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Get quiz questions
        quiz_questions = [q for q in questions if q.get("quiz_id") == quiz_id]
        
        # Calculate score
        score = 0
        total_marks = 0
        detailed_results = []
        
        for q in quiz_questions:
            total_marks += q.get("marks", 1)
            
            # Find user response for this question
            user_response = next(
                (r for r in submission.responses if r.get("question_id") == q["id"]),
                None
            )
            
            if user_response:
                selected = set(user_response.get("selected_options", []))
                correct = set(q.get("correct_answer", []))
                
                is_correct = selected == correct
                if is_correct:
                    score += q.get("marks", 1)
                
                detailed_results.append({
                    "question_id": q["id"],
                    "question_text": q.get("question_text", ""),
                    "selected_options": list(selected),
                    "correct_options": list(correct),
                    "is_correct": is_correct,
                    "explanation": q.get("explanation", "")
                })
        
        percentage = (score / total_marks * 100) if total_marks > 0 else 0
        
        return {
            "score": score,
            "total_marks": total_marks,
            "percentage": percentage,
            "correct_answers": sum(1 for r in detailed_results if r["is_correct"]),
            "total_questions": len(detailed_results),
            "detailed_results": detailed_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register")
def register(user: schemas.UserCreate):
    """Register a new user"""
    return {
        "id": 1,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": True,
        "created_at": "2024-01-01T00:00:00"
    }

@app.post("/login")
def login(user: schemas.UserLogin):
    """Login user"""
    return {
        "access_token": "mock_token_123456",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": user.email,
            "username": "demo_user",
            "full_name": "Demo User",
            "role": "student"
        }
    }

@app.post("/classes")
def create_class(class_data: dict):
    """Create a new class"""
    return {
        "id": 1,
        "name": class_data.get("name", "New Class"),
        "description": class_data.get("description", ""),
        "class_code": "CLASS123",
        "teacher_id": current_user_id
    }

@app.post("/classes/{class_code}/join")
def join_class(class_code: str):
    """Join a class"""
    return {"message": f"Successfully joined class with code {class_code}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)