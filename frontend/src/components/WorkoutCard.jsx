import { Icon } from "../Icons";
import { formatDate, groupSets, volumeOf } from "../workoutUtils";

export default function WorkoutCard({ workout, names, prs, onDelete }) {
  const volume = volumeOf(workout);

  return (
    <article className="panel">
      <div className="workout-head">
        <div>
          <h3>{formatDate(workout.date)}</h3>
          {workout.notes && <p className="muted">{workout.notes}</p>}
        </div>
        {onDelete && (
          <button className="danger" onClick={() => onDelete(workout.id)}>
            Delete
          </button>
        )}
      </div>

      <ul className="workout-exercises">
        {groupSets(workout.sets).map(([exerciseId, list]) => {
          const improvement = prs?.get(exerciseId);
          return (
            <li key={exerciseId}>
              <div className="we-name">
                {names[exerciseId] ?? `Exercise #${exerciseId}`}
                {improvement !== undefined && (
                  <span className="pr-badge">
                    <Icon name="trophy" size={12} />
                    PR +{Number(improvement.toFixed(2))} kg
                  </span>
                )}
              </div>
              <div className="we-sets">
                {list.map((s) => (
                  <span className="chip" key={s.id}>
                    {s.reps} × {s.weight} kg
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="workout-foot">
        <span>{workout.sets.length} sets</span>
        <span>{Math.round(volume).toLocaleString()} kg total volume</span>
      </div>
    </article>
  );
}