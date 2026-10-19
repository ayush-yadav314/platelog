import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

import models  # noqa: F401  (imported so tables register on Base)
from auth_routes import router as auth_router
from coach_routes import router as coach_router
from database import Base, SessionLocal, engine, get_db
from exercise_library import sync_default_exercises
from workout_routes import exercise_router, router as workout_router

load_dotenv()

# Comma-separated list of frontend addresses allowed to call this API.
# No trailing slashes, for example: https://platelog.vercel.app
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        sync_default_exercises(db)
    yield


app = FastAPI(title="Fitness Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(exercise_router)
app.include_router(workout_router)
app.include_router(coach_router)


@app.get("/")
def root():
    return {"message": "Fitness Tracker API is running"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}