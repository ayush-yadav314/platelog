from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

import models
import schemas
from database import get_db
from security import get_current_user

exercise_router = APIRouter(prefix="/exercises", tags=["exercises"])
router = APIRouter(prefix="/workouts", tags=["workouts"])


def get_user_workout(db: Session, workout_id: int, user_id: int) -> models.Workout:
    workout = db.scalar(
        select(models.Workout)
        .where(models.Workout.id == workout_id, models.Workout.user_id == user_id)
        .options(selectinload(models.Workout.sets))
    )
    if workout is None:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout


def check_exercises_exist(
    db: Session, exercise_ids: list[int], user_id: int
) -> None:
    """Every exercise used in a set must belong to the logged-in user."""
    wanted = set(exercise_ids)
    if not wanted:
        return
    found = set(
        db.scalars(
            select(models.Exercise.id).where(
                models.Exercise.id.in_(wanted),
                models.Exercise.user_id == user_id,
            )
        )
    )
    missing = wanted - found
    if missing:
        raise HTTPException(
            status_code=400, detail=f"Unknown exercise_id: {sorted(missing)}"
        )


# ---------- Exercises ----------

@exercise_router.post("", response_model=schemas.ExerciseOut, status_code=201)
def create_exercise(
    data: schemas.ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    name = data.name.strip()
    group = data.muscle_group.strip().lower()
    if not name or not group:
        raise HTTPException(
            status_code=400, detail="Name and muscle group cannot be blank"
        )

    existing = db.scalar(
        select(models.Exercise).where(
            models.Exercise.user_id == current_user.id,
            func.lower(models.Exercise.name) == name.lower(),
        )
    )
    if existing:
        raise HTTPException(status_code=400, detail="Exercise already exists")

    exercise = models.Exercise(
        user_id=current_user.id, name=name, muscle_group=group
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@exercise_router.get("", response_model=list[schemas.ExerciseOut])
def list_exercises(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.scalars(
        select(models.Exercise)
        .where(models.Exercise.user_id == current_user.id)
        .order_by(models.Exercise.name)
    ).all()


# ---------- Workouts ----------

@router.post("", response_model=schemas.WorkoutOut, status_code=201)
def create_workout(
    data: schemas.WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    check_exercises_exist(db, [s.exercise_id for s in data.sets], current_user.id)

    workout = models.Workout(
        user_id=current_user.id, date=data.date, notes=data.notes
    )
    workout.sets = [models.WorkoutSet(**s.model_dump()) for s in data.sets]
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


@router.get("", response_model=list[schemas.WorkoutOut])
def list_workouts(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    exercise_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = (
        select(models.Workout)
        .where(models.Workout.user_id == current_user.id)
        .options(selectinload(models.Workout.sets))
        .order_by(models.Workout.date.desc(), models.Workout.id.desc())
    )
    if date_from:
        query = query.where(models.Workout.date >= date_from)
    if date_to:
        query = query.where(models.Workout.date <= date_to)
    if exercise_id is not None:
        query = query.where(
            models.Workout.sets.any(models.WorkoutSet.exercise_id == exercise_id)
        )
    return db.scalars(query).all()


@router.get("/{workout_id}", response_model=schemas.WorkoutOut)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_user_workout(db, workout_id, current_user.id)


@router.patch("/{workout_id}", response_model=schemas.WorkoutOut)
def update_workout(
    workout_id: int,
    data: schemas.WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = get_user_workout(db, workout_id, current_user.id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(workout, field, value)
    db.commit()
    db.refresh(workout)
    return workout


@router.delete("/{workout_id}", status_code=204)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = get_user_workout(db, workout_id, current_user.id)
    db.delete(workout)
    db.commit()


# ---------- Sets ----------

@router.post("/{workout_id}/sets", response_model=schemas.SetOut, status_code=201)
def add_set(
    workout_id: int,
    data: schemas.SetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = get_user_workout(db, workout_id, current_user.id)
    check_exercises_exist(db, [data.exercise_id], current_user.id)

    new_set = models.WorkoutSet(workout_id=workout.id, **data.model_dump())
    db.add(new_set)
    db.commit()
    db.refresh(new_set)
    return new_set


@router.delete("/{workout_id}/sets/{set_id}", status_code=204)
def delete_set(
    workout_id: int,
    set_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    workout = get_user_workout(db, workout_id, current_user.id)
    target = db.scalar(
        select(models.WorkoutSet).where(
            models.WorkoutSet.id == set_id,
            models.WorkoutSet.workout_id == workout.id,
        )
    )
    if target is None:
        raise HTTPException(status_code=404, detail="Set not found")
    db.delete(target)
    db.commit()