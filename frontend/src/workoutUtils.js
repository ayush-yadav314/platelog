export function parseLocal(iso) {
  return new Date(`${iso}T00:00:00`);
}

export function toIso(d) {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// Monday of the week containing d (local time)
export function weekStart(d) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
}

export function volumeOf(workout) {
  return workout.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
}

export function thisWeekStats(workouts) {
  const start = weekStart(new Date());
  let sessions = 0;
  let volume = 0;
  for (const w of workouts) {
    if (parseLocal(w.date) >= start) {
      sessions += 1;
      volume += volumeOf(w);
    }
  }
  return { sessions, volume: Math.round(volume) };
}

// Weeks in a row with at least one workout. If this week has no workout yet,
// counting starts from last week, because the current week isn't over.
export function weekStreak(workouts) {
  const weeks = new Set(
    workouts.map((w) => toIso(weekStart(parseLocal(w.date))))
  );
  const cursor = weekStart(new Date());
  if (!weeks.has(toIso(cursor))) cursor.setDate(cursor.getDate() - 7);

  let streak = 0;
  while (weeks.has(toIso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function formatDate(iso) {
  return parseLocal(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysAgoLabel(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today - parseLocal(iso)) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days > 1) return `${days} days ago`;
  return `on ${formatDate(iso)}`;
}

export function groupSets(sets) {
  const groups = new Map();
  for (const s of [...sets].sort((a, b) => a.id - b.id)) {
    if (!groups.has(s.exercise_id)) groups.set(s.exercise_id, []);
    groups.get(s.exercise_id).push(s);
  }
  return [...groups.entries()];
}

// Walk workouts oldest to newest. A PR is a session whose top weight for an
// exercise beats the best of all earlier sessions.
// Returns Map<workoutId, Map<exerciseId, kgImprovement>>
export function computePRs(workouts) {
  const chronological = [...workouts].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id - b.id
  );
  const best = new Map();
  const prs = new Map();

  for (const w of chronological) {
    const topByExercise = new Map();
    for (const s of w.sets) {
      const current = topByExercise.get(s.exercise_id) ?? 0;
      topByExercise.set(s.exercise_id, Math.max(current, s.weight));
    }

    const found = new Map();
    for (const [exerciseId, top] of topByExercise) {
      const previous = best.get(exerciseId);
      if (previous !== undefined && top > previous) {
        found.set(exerciseId, top - previous);
      }
      best.set(exerciseId, Math.max(previous ?? 0, top));
    }
    if (found.size > 0) prs.set(w.id, found);
  }
  return prs;
}

// Total volume per week for the last N weeks, oldest first (empty weeks included)
export function weeklyVolumes(workouts, weeks = 8) {
  const thisWeek = weekStart(new Date());
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisWeek);
    start.setDate(start.getDate() - i * 7);
    buckets.push({
      key: toIso(start),
      label: start.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      }),
      volume: 0,
    });
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
  for (const w of workouts) {
    const bucket = byKey[toIso(weekStart(parseLocal(w.date)))];
    if (bucket) bucket.volume += volumeOf(w);
  }
  return buckets.map((b) => ({ ...b, volume: Math.round(b.volume) }));
}

// Newest personal records first: [{ workoutId, date, exerciseId, improvement }]
export function recentPRs(workouts, limit = 5) {
  const prs = computePRs(workouts);
  const byId = new Map(workouts.map((w) => [w.id, w]));
  const items = [];
  for (const [workoutId, found] of prs) {
    for (const [exerciseId, improvement] of found) {
      items.push({
        workoutId,
        date: byId.get(workoutId).date,
        exerciseId,
        improvement,
      });
    }
  }
  return items
    .sort((a, b) => b.date.localeCompare(a.date) || b.workoutId - a.workoutId)
    .slice(0, limit);
}