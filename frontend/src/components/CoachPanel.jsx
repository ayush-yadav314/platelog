import { useState } from "react";
import { getCoaching } from "../api";

export default function CoachPanel({ hasWorkouts }) {
  const [advice, setAdvice] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setError("");
    setBusy(true);
    try {
      const data = await getCoaching();
      setAdvice(data.advice);
      setRemaining(data.remaining);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>AI coach</h2>
        <button onClick={handleClick} disabled={busy || !hasWorkouts}>
          {busy ? "Thinking..." : "Get coaching"}
        </button>
      </div>

      {!hasWorkouts && (
        <p className="muted">Log a workout to get coaching.</p>
      )}
      {error && <p className="error">{error}</p>}
      {advice && (
        <>
          <p className="coach-text">{advice}</p>
          <p className="muted">
            AI-generated suggestions based on your last workouts, not
            professional advice.
            {remaining !== null &&
              ` ${remaining} request${remaining === 1 ? "" : "s"} left today.`}
          </p>
        </>
      )}
    </div>
  );
}