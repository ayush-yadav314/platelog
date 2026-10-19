import { useMemo } from "react";
import { Icon } from "../Icons";
import { cssVars } from "../muscleColors";

export default function WorkoutBuilder({
  date,
  onDate,
  notes,
  onNotes,
  items,
  lastByExercise,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onRemoveItem,
  onSubmit,
  busy,
  error,
}) {
  const totals = useMemo(() => {
    let sets = 0;
    let volume = 0;
    for (const item of items) {
      for (const s of item.sets) {
        sets += 1;
        const reps = Number(s.reps);
        const weight = Number(s.weight);
        if (reps > 0 && weight >= 0) volume += reps * weight;
      }
    }
    return { sets, volume };
  }, [items]);

  return (
    <form className="panel builder" onSubmit={onSubmit}>
      <div className="panel-header">
        <h2>Your workout</h2>
        {items.length > 0 && (
          <span className="muted small">
            {items.length} exercise{items.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="row">
        <input
          type="date"
          value={date}
          onChange={(e) => onDate(e.target.value)}
          aria-label="Workout date"
          required
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          maxLength={500}
          onChange={(e) => onNotes(e.target.value)}
        />
      </div>

      {items.length === 0 ? (
        <div className="builder-empty">
          <div className="stat-icon blue">
            <Icon name="dumbbell" />
          </div>
          <strong>No exercises yet</strong>
          <span className="muted">Pick an exercise to start your workout.</span>
        </div>
      ) : (
        items.map((item, i) => {
          const last = lastByExercise.get(item.exercise.id);
          return (
            <div
              className="item"
              key={item.exercise.id}
              style={cssVars(item.exercise.muscle_group)}
            >
              <div className="item-head">
                <div>
                  <strong>{item.exercise.name}</strong>
                  {last && (
                    <p className="muted small">
                      Last time: {last.reps} × {last.weight} kg
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="icon"
                  onClick={() => onRemoveItem(i)}
                  aria-label={`Remove ${item.exercise.name}`}
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              {item.sets.map((s, j) => (
                <div className="set-line" key={j}>
                  <span className="set-no">{j + 1}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Reps"
                    min="1"
                    max="1000"
                    step="1"
                    value={s.reps}
                    onChange={(e) => onSetChange(i, j, "reps", e.target.value)}
                    aria-label={`Set ${j + 1} reps`}
                    required
                  />
                  <span className="x">×</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="kg"
                    min="0"
                    max="2000"
                    step="any"
                    value={s.weight}
                    onChange={(e) =>
                      onSetChange(i, j, "weight", e.target.value)
                    }
                    aria-label={`Set ${j + 1} weight in kg`}
                    required
                  />
                  <button
                    type="button"
                    className="icon"
                    onClick={() => onRemoveSet(i, j)}
                    disabled={item.sets.length === 1}
                    aria-label={`Remove set ${j + 1}`}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="secondary add-set"
                onClick={() => onAddSet(i)}
              >
                + Add set
              </button>
            </div>
          );
        })
      )}

      {error && <p className="error">{error}</p>}

      <div className="builder-foot">
        <div className="totals">
          <span>
            <strong>{totals.sets}</strong> sets
          </span>
          <span>
            <strong>{Math.round(totals.volume).toLocaleString()}</strong> kg
            total
          </span>
        </div>
        <button className="btn-save" disabled={busy || items.length === 0}>
          {busy ? "Saving..." : "Save workout"}
        </button>
      </div>
    </form>
  );
}