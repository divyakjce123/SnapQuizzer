from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, models
from app.dependencies import get_current_user

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

@router.post("/", response_model=schemas.QuizResponse)
def create_quiz(
    quiz: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Create Quiz
    new_quiz = models.Quiz(
        title=quiz.title,
        description=quiz.description,
        owner_id=current_user.id
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    
    # Create Questions
    for q in quiz.questions:
        # Flatten options to JSON compatible format
        options_json = [opt.dict() for opt in q.options]
        new_q = models.Question(
            quiz_id=new_quiz.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=options_json,
            marks=q.marks,
            explanation=q.explanation
        )
        db.add(new_q)
    
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@router.get("/", response_model=List[schemas.QuizResponse])
def get_my_quizzes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Quiz).filter(models.Quiz.owner_id == current_user.id).all()