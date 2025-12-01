from sqlalchemy.orm import Session
from app import models, schemas

class QuizManager:
    def create_quiz(self, db: Session, quiz_data: schemas.QuizCreate, owner_id: int):
        # Create quiz
        quiz = models.Quiz(
            title=quiz_data.title,
            description=quiz_data.description,
            owner_id=owner_id,
            subject=quiz_data.subject,
            topic=quiz_data.topic,
            difficulty=quiz_data.difficulty,
            is_public=quiz_data.is_public,
            time_limit=quiz_data.time_limit
        )
        
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        # Add questions
        for q in quiz_data.questions:
            question = models.Question(
                quiz_id=quiz.id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=[opt.dict() for opt in q.options],
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                marks=q.marks
            )
            db.add(question)
        
        db.commit()
        db.refresh(quiz)
        
        return quiz
    
    def submit_quiz(self, db: Session, quiz_id: int, submission: schemas.QuizSubmission, student_id: int):
        # Get quiz with questions
        quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
        if not quiz:
            raise Exception("Quiz not found")
        
        questions = db.query(models.Question).filter(models.Question.quiz_id == quiz_id).all()
        
        # Calculate score
        score = 0
        total_marks = 0
        detailed_results = []
        
        for question in questions:
            total_marks += question.marks
            user_response = next(
                (r for r in submission.responses if r.get("question_id") == question.id),
                None
            )
            
            if user_response:
                selected = set(user_response.get("selected_options", []))
                correct = set(question.correct_answer)
                
                is_correct = selected == correct
                if is_correct:
                    score += question.marks
                
                detailed_results.append({
                    "question_id": question.id,
                    "question_text": question.question_text,
                    "selected_options": list(selected),
                    "correct_options": list(correct),
                    "is_correct": is_correct,
                    "explanation": question.explanation
                })
        
        # Save response
        quiz_response = models.QuizResponse(
            quiz_id=quiz_id,
            student_id=student_id,
            score=score,
            total_marks=total_marks,
            time_taken=submission.total_time,
            responses=detailed_results
        )
        
        db.add(quiz_response)
        db.commit()
        
        percentage = (score / total_marks * 100) if total_marks > 0 else 0
        
        return {
            "score": score,
            "total_marks": total_marks,
            "percentage": percentage,
            "correct_answers": sum(1 for r in detailed_results if r["is_correct"]),
            "total_questions": len(detailed_results),
            "detailed_results": detailed_results
        }