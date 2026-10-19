import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Icon } from "../Icons";

function loadGoal() {
  try {
    const n = Number(localStorage.getItem("weeklyGoal"));
    if (Number.isInteger(n) && n >= 1 && n <= 7) return n;
  } catch {
    /* ignore */
  }
  return 3;
}

export default function GoalCard({ sessions, streak }) {
  const [goal, setGoal] = useState(loadGoal);

  useEffect(() => {
    try {
      localStorage.setItem("weeklyGoal", String(goal));
    } catch {
      /* ignore */
    }
  }, [goal]);

  const progress = Math.min(sessions / goal, 1);
  const done = sessions >= goal;
  const remaining = goal - sessions;

  return (
    <div className="panel goal-card">
      <div className="ring-wrap">
        <svg
          className="ring"
          viewBox="0 0 128 128"
          role="img"
          aria-label={`${sessions} of ${goal} sessions this week`}
        >
          <circle className="ring-track" cx="64" cy="64" r="52" />
          <g transform="rotate(-90 64 64)">
            {progress > 0 && (
              <motion.circle
                className={`ring-fill${done ? " done" : ""}`}
                cx="64"
                cy="64"
                r="52"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            )}
          </g>
        </svg>
        <div className="ring-label">
          <span className="ring-value">{sessions}</span>
          <span className="muted">of {goal}</span>
        </div>
      </div>

      <div className="goal-main">
        <h2>Weekly goal</h2>
        <p className="muted">
          {done
            ? "Goal reached this week. Nice work."
            : `${remaining} more session${remaining === 1 ? "" : "s"} to hit your goal.`}
        </p>

        <div className="goal-stepper">
          <span className="muted">Sessions per week</span>
          <button
            className="icon"
            onClick={() => setGoal((g) => Math.max(1, g - 1))}
            disabled={goal <= 1}
            aria-label="Lower weekly goal"
          >
            −
          </button>
          <strong>{goal}</strong>
          <button
            className="icon"
            onClick={() => setGoal((g) => Math.min(7, g + 1))}
            disabled={goal >= 7}
            aria-label="Raise weekly goal"
          >
            +
          </button>
        </div>

        <div className="streak">
          <Icon name="flame" size={20} />
          {streak > 0
            ? `${streak} week streak`
            : "Log a workout to start a streak"}
        </div>
        {streak > 0 && (
          <p className="muted small">Weeks in a row with at least one workout.</p>
        )}
      </div>
    </div>
  );
}