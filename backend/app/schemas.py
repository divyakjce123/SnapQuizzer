from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Quiz Schemas
class OptionBase(BaseModel):
    id: str
    text: str
    is_correct: bool = False

class QuestionBase(BaseModel):
    question_text: str
    question_type: str = "mcq"
    options: List[OptionBase]
    correct_answer: List[str]
    explanation: Optional[str] = None
    marks: int = 1
    image_url: Optional[str] = None

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = "medium"
    is_public: bool = False
    time_limit: Optional[int] = None
    questions: List[QuestionBase]

# Image Processing Schemas
class ImageUpload(BaseModel):
    image_data: str  # base64 encoded image
    has_answer_key: bool = False
    subject: Optional[str] = None

# Quiz Taking Schemas
class QuizSubmission(BaseModel):
    quiz_id: int
    responses: List[Dict[str, Any]]  # {question_id: int, selected_options: List[str], time_taken: int}
    total_time: int

class QuizResult(BaseModel):
    score: float
    total_marks: int
    percentage: float
    correct_answers: int
    total_questions: int
    detailed_results: List[Dict[str, Any]]