import { useMemo, useState } from "react";
import { createExercise } from "../api";
import { Icon } from "../Icons";
import { STANDARD_GROUPS, cssVars } from "../muscleColors";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ExercisePicker({
  exercises,
  selectedIds,
  selectedCount,
  onPick,
  onCreated,
  onReview,
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [newGroup, setNewGroup] = useState("chest");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const found = [...new Set(exercises.map((e) => e.muscle_group))];
    const standard = STANDARD_GROUPS.filter((g) => found.includes(g));
    const extra = found.filter((g) => !STANDARD_GROUPS.includes(g)).sort();
    return [...standard, ...extra];
  }, [exercises]);

  const groupChoices = [...new Set([...STANDARD_GROUPS, ...groups])];

  const q = query.trim().toLowerCase();
  const visible = exercises.filter(
    (e) =>
      (group === "all" || e.muscle_group === group) &&
      e.name.toLowerCase().includes(q)
  );
  const exactMatch = exercises.some((e) => e.name.toLowerCase() === q);
  const canCreate = q.length > 0 && !exactMatch;

  async function handleCreate() {
    setError("");
    setBusy(true);
    try {
      const exercise = await createExercise(query.trim(), newGroup);
      onCreated(exercise);
      onPick(exercise);
      setQuery("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel picker">
      <div className="panel-header">
        <h2>Choose exercises</h2>
        <span className="muted small">Tap to add to your workout</span>
      </div>

      <div className="search">
        <Icon name="search" size={18} />
        <input
          type="search"
          placeholder="Search exercises"
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
      </div>

      <div className="chips" role="group" aria-label="Filter by muscle group">
        <button
          type="button"
          className={`gchip${group === "all" ? " on" : ""}`}
          onClick={() => setGroup("all")}
        >
          All
        </button>
        {groups.map((g) => (
          <button
            type="button"
            key={g}
            className={`gchip${group === g ? " on" : ""}`}
            style={cssVars(g)}
            onClick={() => setGroup(g)}
          >
            {cap(g)}
          </button>
        ))}
      </div>

      <div className="ex-grid">
        {visible.map((e) => {
          const selected = selectedIds.has(e.id);
          return (
            <button
              type="button"
              key={e.id}
              className={`ex-card${selected ? " selected" : ""}`}
              style={cssVars(e.muscle_group)}
              onClick={() => {
                if (!selected) onPick(e);
              }}
              aria-pressed={selected}
            >
              <span className="ex-name">{e.name}</span>
              <span className="ex-group">{e.muscle_group}</span>
              <span className="ex-add">
                <Icon name={selected ? "check" : "plus"} size={16} />
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 && !canCreate && (
        <p className="muted">No exercises match.</p>
      )}

      {canCreate && (
        <div className="create-row">
          <span>
            Add <strong>“{query.trim()}”</strong> as a new exercise
          </span>
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            aria-label="Muscle group for the new exercise"
          >
            {groupChoices.map((g) => (
              <option key={g} value={g}>
                {cap(g)}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleCreate} disabled={busy}>
            {busy ? "Adding..." : "Add and select"}
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {selectedCount > 0 && (
        <button type="button" className="review-btn" onClick={onReview}>
          Review workout ({selectedCount})
        </button>
      )}
    </section>
  );
}