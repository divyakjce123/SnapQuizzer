from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, quizzes, upload

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SnapQuizzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(quizzes.router)
app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "SnapQuizzer API is active"}