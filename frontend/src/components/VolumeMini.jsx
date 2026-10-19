import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { weeklyVolumes } from "../workoutUtils";

export default function VolumeMini({ workouts }) {
  const data = useMemo(() => weeklyVolumes(workouts, 8), [workouts]);
  const current = data[data.length - 1]?.volume ?? 0;
  const previous = data[data.length - 2]?.volume ?? 0;
  const delta =
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Weekly volume</h2>
          <p className="muted small">Total kg lifted per week</p>
        </div>
        {delta !== null && (
          <span className={`delta ${delta >= 0 ? "up" : "down"}`}>
            {delta >= 0 ? "+" : "−"}
            {Math.abs(delta)}% vs last week
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#66728f", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(47,107,255,0.08)" }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e3e8f2" }}
            formatter={(value) => [`${value.toLocaleString()} kg`, "Volume"]}
          />
          <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={d.key}
                fill="#2f6bff"
                fillOpacity={i === data.length - 1 ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}