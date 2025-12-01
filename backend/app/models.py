from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Float
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="student")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    owner_id = Column(Integer)
    subject = Column(String)
    topic = Column(String)
    difficulty = Column(String)
    is_public = Column(Boolean, default=False)
    time_limit = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer)
    question_text = Column(Text)
    question_type = Column(String, default="mcq")
    options = Column(JSON)
    correct_answer = Column(JSON)
    explanation = Column(Text)
    marks = Column(Integer, default=1)