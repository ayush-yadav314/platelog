import { createContext, useContext, useEffect, useState } from "react";
import { deleteWorkout, getExercises, getWorkouts } from "./api";

const DataContext = createContext(null);

const sortWorkouts = (list) =>
  [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

const sortExercises = (list) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name));

export function DataProvider({ children }) {
  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getExercises(), getWorkouts()])
      .then(([ex, wk]) => {
        if (cancelled) return;
        setExercises(ex);
        setWorkouts(sortWorkouts(wk));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function addExercise(exercise) {
    setExercises((prev) => sortExercises([...prev, exercise]));
  }

  function addWorkout(workout) {
    setError("");
    setWorkouts((prev) => sortWorkouts([...prev, workout]));
  }

  async function removeWorkout(id) {
    setError("");
    try {
      await deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <DataContext.Provider
      value={{
        exercises,
        workouts,
        loading,
        error,
        addExercise,
        addWorkout,
        removeWorkout,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  return useContext(DataContext);
}