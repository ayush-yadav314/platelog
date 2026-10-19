import datetime as dt
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserOut(BaseModel):
    id: int
    email: EmailStr

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    muscle_group: str = Field(min_length=1, max_length=50)


class ExerciseOut(BaseModel):
    id: int
    name: str
    muscle_group: str

    model_config = {"from_attributes": True}


class SetCreate(BaseModel):
    exercise_id: int
    set_number: int = Field(ge=1)
    reps: int = Field(ge=1, le=1000)
    weight: float = Field(ge=0, le=2000)


class SetOut(SetCreate):
    id: int

    model_config = {"from_attributes": True}


class WorkoutCreate(BaseModel):
    date: dt.date
    notes: Optional[str] = Field(default=None, max_length=500)
    sets: list[SetCreate] = Field(default_factory=list)


class WorkoutUpdate(BaseModel):
    date: Optional[dt.date] = None
    notes: Optional[str] = Field(default=None, max_length=500)


class WorkoutOut(BaseModel):
    id: int
    date: dt.date
    notes: Optional[str]
    sets: list[SetOut]

    model_config = {"from_attributes": True}