from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    class Config:
        from_attributes = True

# --- Quiz Schemas ---
class Option(BaseModel):
    id: str
    text: str
    is_correct: bool = False

class QuestionBase(BaseModel):
    question_text: str
    question_type: str = "mcq"
    options: List[Option]
    explanation: Optional[str] = None
    marks: int = 1

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionBase]

class QuizResponse(QuizCreate):
    id: int
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Processing Schemas ---
class ImageUpload(BaseModel):
    image_data: str # base64