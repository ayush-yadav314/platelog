import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { celebrate } from "../confetti";
import { useData } from "../DataContext";
import { Icon } from "../Icons";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import WorkoutCard from "../components/WorkoutCard";
import { computePRs } from "../workoutUtils";

export default function History() {
  const { workouts, exercises, removeWorkout } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const celebrated = useRef(false);
  const names = useMemo(
    () => Object.fromEntries(exercises.map((e) => [e.id, e.name])),
    [exercises]
  );
  const prs = useMemo(() => computePRs(workouts), [workouts]);

  // Fire confetti once after saving a PR, then mark it so a refresh won't repeat it.
  useEffect(() => {
    const state = location.state;
    if (state?.pr && !state.celebrated && !celebrated.current) {
      celebrated.current = true;
      celebrate();
      navigate(location.pathname, {
        replace: true,
        state: { ...state, celebrated: true },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this workout?")) return;
    await removeWorkout(id);
  }

  return (
    <>
      <PageHeader title="History" subtitle="All your workouts, newest first." />

      {location.state?.saved && (
        <div className="banner banner-success">
          <Icon name={location.state.pr ? "trophy" : "check"} size={18} />
          {location.state.pr
            ? "Workout saved. New personal record!"
            : "Workout saved."}
        </div>
      )}

      {workouts.length === 0 ? (
        <div className="panel empty">
          <div className="stat-icon blue">
            <Icon name="dumbbell" />
          </div>
          <h2>No workouts yet</h2>
          <p className="muted">Log your first workout and it will show up here.</p>
          <Link className="btn" to="/log">
            Log a workout
          </Link>
        </div>
      ) : (
        workouts.map((w, i) => (
          <Reveal key={w.id} delay={Math.min(i, 6) * 0.05}>
            <WorkoutCard
              workout={w}
              names={names}
              prs={prs.get(w.id)}
              onDelete={handleDelete}
            />
          </Reveal>
        ))
      )}
    </>
  );
}