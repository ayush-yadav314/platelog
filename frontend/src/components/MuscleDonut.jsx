import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const INK = "#14213d";
const RED = "#d62839";
const BLUE = "#2f6bff";
const YELLOW = "#ffc93c";
const GREEN = "#19b36b";

const GROUP_COLORS = {
  chest: RED,
  back: BLUE,
  legs: GREEN,
  shoulders: YELLOW,
  biceps: "#f77f00",
  triceps: "#7b4bff",
  arms: "#00a6a6",
  core: "#9aa6c4",
};
const FALLBACK_COLORS = ["#e056a0", "#5c7cfa", "#a0522d", "#2a9d8f"];
const DAYS = 30;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function cutoffDate(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
}

function setsByGroup(workouts, exercises) {
  const groupOf = Object.fromEntries(
    exercises.map((e) => [e.id, e.muscle_group])
  );
  const cutoff = cutoffDate(DAYS);
  const counts = {};
  for (const w of workouts) {
    if (new Date(`${w.date}T00:00:00`) < cutoff) continue;
    for (const s of w.sets) {
      const group = groupOf[s.exercise_id] ?? "other";
      counts[group] = (counts[group] ?? 0) + 1;
    }
  }
  return counts;
}

export default function MuscleDonut({ workouts, exercises }) {
  const { data, total, untrained } = useMemo(() => {
    const counts = setsByGroup(workouts, exercises);
    let fallbackIndex = 0;
    const data = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        key,
        name: capitalize(key),
        value,
        color:
          GROUP_COLORS[key] ??
          FALLBACK_COLORS[fallbackIndex++ % FALLBACK_COLORS.length],
      }));
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const allGroups = [...new Set(exercises.map((e) => e.muscle_group))];
    const untrained = allGroups.filter((g) => !counts[g]);
    return { data, total, untrained };
  }, [workouts, exercises]);

  if (workouts.length === 0) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Training balance</h2>
        <span className="muted">Sets per muscle group, last {DAYS} days</span>
      </div>

      {total === 0 ? (
        <p className="muted">No sets logged in the last {DAYS} days.</p>
      ) : (
        <>
          <div className="donut-body">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    stroke={INK}
                    strokeWidth={2}
                  >
                    {data.map((d) => (
                      <Cell key={d.key} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: `2px solid ${INK}`,
                      borderRadius: 8,
                    }}
                    itemStyle={{ color: INK }}
                    formatter={(value, name) => [`${value} sets`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span className="donut-total">{total}</span>
                <span className="muted">sets</span>
              </div>
            </div>

            <ul className="donut-legend">
              {data.map((d) => (
                <li key={d.key}>
                  <span className="swatch" style={{ background: d.color }} />
                  <span className="legend-name">{d.name}</span>
                  <span className="muted">
                    {d.value} sets ({Math.round((d.value / total) * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {untrained.length > 0 && (
            <p className="muted donut-note">
              No sets in the last {DAYS} days for: {untrained.join(", ")}.
            </p>
          )}
        </>
      )}
    </div>
  );
}