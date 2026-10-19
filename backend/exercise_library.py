from sqlalchemy import select

import models

DEFAULT_EXERCISES = [
    # chest
    ("Bench Press", "chest"),
    ("Incline Bench Press", "chest"),
    ("Dumbbell Bench Press", "chest"),
    ("Incline Dumbbell Press", "chest"),
    ("Push-up", "chest"),
    ("Cable Fly", "chest"),
    # back
    ("Deadlift", "back"),
    ("Barbell Row", "back"),
    ("Dumbbell Row", "back"),
    ("Pull-up", "back"),
    ("Lat Pulldown", "back"),
    ("Seated Cable Row", "back"),
    # legs
    ("Squat", "legs"),
    ("Leg Press", "legs"),
    ("Romanian Deadlift", "legs"),
    ("Lunge", "legs"),
    ("Leg Extension", "legs"),
    ("Leg Curl", "legs"),
    ("Hip Thrust", "legs"),
    ("Calf Raise", "legs"),
    # shoulders
    ("Overhead Press", "shoulders"),
    ("Dumbbell Shoulder Press", "shoulders"),
    ("Lateral Raise", "shoulders"),
    ("Rear Delt Fly", "shoulders"),
    ("Face Pull", "shoulders"),
    # biceps
    ("Barbell Curl", "biceps"),
    ("Dumbbell Curl", "biceps"),
    ("Hammer Curl", "biceps"),
    ("Preacher Curl", "biceps"),
    ("Incline Dumbbell Curl", "biceps"),
    ("Cable Curl", "biceps"),
    # triceps
    ("Triceps Pushdown", "triceps"),
    ("Skull Crusher", "triceps"),
    ("Overhead Triceps Extension", "triceps"),
    ("Close-Grip Bench Press", "triceps"),
    ("Dips", "triceps"),
    ("Triceps Kickback", "triceps"),
    # core
    ("Plank", "core"),
    ("Hanging Leg Raise", "core"),
    ("Cable Crunch", "core"),
    ("Russian Twist", "core"),
]


def seed_default_exercises(db, user_id: int) -> None:
    """Give a brand-new user the starter library."""
    db.add_all(
        models.Exercise(user_id=user_id, name=name, muscle_group=group)
        for name, group in DEFAULT_EXERCISES
    )


def sync_default_exercises(db) -> None:
    """For every user: add any missing starter exercises, and move old 'arms'
    starter exercises to biceps or triceps. Safe to run repeatedly. Exercises
    the user created themselves are never changed."""
    user_ids = db.scalars(select(models.User.id)).all()
    for user_id in user_ids:
        existing = {
            e.name.lower(): e
            for e in db.scalars(
                select(models.Exercise).where(models.Exercise.user_id == user_id)
            )
        }
        for name, group in DEFAULT_EXERCISES:
            current = existing.get(name.lower())
            if current is None:
                db.add(
                    models.Exercise(user_id=user_id, name=name, muscle_group=group)
                )
            elif current.muscle_group == "arms" and group in ("biceps", "triceps"):
                current.muscle_group = group
    db.commit()