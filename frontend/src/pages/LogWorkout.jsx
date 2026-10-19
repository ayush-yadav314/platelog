import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkout } from "../api";
import { useData } from "../DataContext";
import ExercisePicker from "../components/ExercisePicker";
import PageHeader from "../components/PageHeader";
import WorkoutBuilder from "../components/WorkoutBuilder";
import { computePRs, toIso } from "../workoutUtils";

export default function LogWorkout() {
  const { exercises, workouts, addExercise, addWorkout } = useData();
  const navigate = useNavigate();
  const builderRef = useRef(null);

  const [date, setDate] = useState(() => toIso(new Date()));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]); // [{ exercise, sets: [{ reps, weight }] }]
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Last set logged for each exercise (workouts are sorted newest first)
  const lastByExercise = useMemo(() => {
    const map = new Map();
    for (const w of workouts) {
      const latestInWorkout = new Map();
      for (const s of [...w.sets].sort((a, b) => a.id - b.id)) {
        latestInWorkout.set(s.exercise_id, s);
      }
      for (const [exerciseId, s] of latestInWorkout) {
        if (!map.has(exerciseId)) map.set(exerciseId, s);
      }
    }
    return map;
  }, [workouts]);

  function pickExercise(exercise) {
    setItems((prev) => {
      if (prev.some((it) => it.exercise.id === exercise.id)) return prev;
      const last = lastByExercise.get(exercise.id);
      const first = {
        reps: last ? String(last.reps) : "",
        weight: last ? String(last.weight) : "",
      };
      return [...prev, { exercise, sets: [first] }];
    });
  }

  function changeSet(i, j, field, value) {
    setItems((prev) =>
      prev.map((it, a) =>
        a !== i
          ? it
          : {
              ...it,
              sets: it.sets.map((s, b) =>
                b === j ? { ...s, [field]: value } : s
              ),
            }
      )
    );
  }

  function addSet(i) {
    // copy the previous set so you only change what differs
    setItems((prev) =>
      prev.map((it, a) =>
        a !== i
          ? it
          : { ...it, sets: [...it.sets, { ...it.sets[it.sets.length - 1] }] }
      )
    );
  }

  function removeSet(i, j) {
    setItems((prev) =>
      prev.map((it, a) =>
        a !== i ? it : { ...it, sets: it.sets.filter((_, b) => b !== j) }
      )
    );
  }

  function removeItem(i) {
    setItems((prev) => prev.filter((_, a) => a !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (items.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    const sets = items.flatMap((it) =>
      it.sets.map((s, idx) => ({
        exercise_id: it.exercise.id,
        set_number: idx + 1,
        reps: Number(s.reps),
        weight: Number(s.weight),
      }))
    );

    setBusy(true);
    try {
      const workout = await createWorkout({
        date,
        notes: notes.trim() || null,
        sets,
      });
      const isPR = computePRs([...workouts, workout]).has(workout.id);
      addWorkout(workout);
      navigate("/history", { state: { saved: true, pr: isPR } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="New workout"
        subtitle="Tap exercises to add them, then fill in reps and weight."
      />

      <div className="log-grid">
        <ExercisePicker
          exercises={exercises}
          selectedIds={new Set(items.map((it) => it.exercise.id))}
          selectedCount={items.length}
          onPick={pickExercise}
          onCreated={addExercise}
          onReview={() =>
            builderRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />

        <div ref={builderRef}>
          <WorkoutBuilder
            date={date}
            onDate={setDate}
            notes={notes}
            onNotes={setNotes}
            items={items}
            lastByExercise={lastByExercise}
            onSetChange={changeSet}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemoveItem={removeItem}
            onSubmit={handleSubmit}
            busy={busy}
            error={error}
          />
        </div>
      </div>
    </>
  );
}