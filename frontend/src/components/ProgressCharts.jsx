import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function parseLocal(iso) {
  return new Date(`${iso}T00:00:00`);
}

function toIso(d) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// Monday of the week containing d
function weekStart(d) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
}

function shortDate(d) {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function weeklyVolume(workouts, weeks = 8) {
  const thisWeek = weekStart(new Date());
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisWeek);
    start.setDate(start.getDate() - i * 7);
    buckets.push({ key: toIso(start), label: shortDate(start), volume: 0 });
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));

  for (const w of workouts) {
    const bucket = byKey[toIso(weekStart(parseLocal(w.date)))];
    if (!bucket) continue;
    bucket.volume += w.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
  }
  return buckets.map((b) => ({ ...b, volume: Math.round(b.volume) }));
}

function exerciseProgress(workouts, exerciseId) {
  const bestByDate = new Map();
  for (const w of workouts) {
    for (const s of w.sets) {
      if (s.exercise_id !== exerciseId) continue;
      const best = bestByDate.get(w.date) ?? 0;
      if (s.weight > best) bestByDate.set(w.date, s.weight);
      else if (!bestByDate.has(w.date)) bestByDate.set(w.date, s.weight);
    }
  }
  return [...bestByDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, weight]) => ({
      date,
      label: shortDate(parseLocal(date)),
      weight,
    }));
}

const INK = "#14213d";
const MUTED = "#5b6785";
const GRID = "#d5dbe8";
const RED = "#d62839";
const BLUE = "#2f6bff";

const tooltipStyle = {
  contentStyle: {
    background: "#ffffff",
    border: `2px solid ${INK}`,
    borderRadius: 8,
  },
  labelStyle: { color: INK, fontWeight: 700 },
  itemStyle: { color: INK },
};

const axisProps = {
  stroke: MUTED,
  tick: { fill: MUTED, fontSize: 12 },
};

export default function ProgressCharts({ workouts, exercises }) {
  const [selectedId, setSelectedId] = useState("");

  // only exercises that appear in at least one logged set
  const options = useMemo(() => {
    const used = new Set(workouts.flatMap((w) => w.sets.map((s) => s.exercise_id)));
    return exercises.filter((ex) => used.has(ex.id));
  }, [workouts, exercises]);

  const activeId =
    options.find((ex) => String(ex.id) === selectedId)?.id ?? options[0]?.id;

  const volumeData = useMemo(() => weeklyVolume(workouts), [workouts]);
  const progressData = useMemo(
    () => (activeId ? exerciseProgress(workouts, activeId) : []),
    [workouts, activeId]
  );

  if (workouts.length === 0) {
    return (
      <div className="panel">
        <h2>Progress</h2>
        <p className="muted">Log a workout to see your charts.</p>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <h2>Weekly volume (kg)</h2>
          <span className="muted">Last 8 weeks</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={volumeData}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={56} />
            <Tooltip
              {...tooltipStyle}
              cursor={{ fill: "rgba(20,33,61,0.06)" }}
              formatter={(value) => [`${value.toLocaleString()} kg`, "Volume"]}
            />
            <Bar
              dataKey="volume"
              fill={RED}
              stroke={INK}
              strokeWidth={2}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Top weight per session</h2>
          <select
            value={activeId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {options.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        {progressData.length < 2 && (
          <p className="muted">
            Log this exercise on at least two different days to see a trend line.
          </p>
        )}
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={progressData}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={56} domain={["auto", "auto"]} />
            <Tooltip
              {...tooltipStyle}
              formatter={(value) => [`${value} kg`, "Top weight"]}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={BLUE}
              strokeWidth={3}
              dot={{ r: 5, fill: BLUE, stroke: INK, strokeWidth: 2 }}
              activeDot={{ r: 7, fill: BLUE, stroke: INK, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}