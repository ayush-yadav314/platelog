import { Icon } from "../Icons";
import { daysAgoLabel, recentPRs } from "../workoutUtils";

export default function RecentPRs({ workouts, names }) {
  const items = recentPRs(workouts, 5);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Recent records</h2>
      </div>

      {items.length === 0 ? (
        <p className="muted">
          No personal records yet. Lift more than your best on any exercise and
          it shows up here.
        </p>
      ) : (
        <ul className="pr-list">
          {items.map((it) => (
            <li key={`${it.workoutId}-${it.exerciseId}`}>
              <span className="pr-icon">
                <Icon name="trophy" size={16} />
              </span>
              <div className="pr-text">
                <strong>{names[it.exerciseId] ?? `Exercise #${it.exerciseId}`}</strong>
                <span className="muted small">{daysAgoLabel(it.date)}</span>
              </div>
              <span className="pr-gain">
                +{Number(it.improvement.toFixed(2))} kg
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}