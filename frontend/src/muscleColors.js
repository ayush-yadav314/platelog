const KNOWN = {
  chest: { color: "#d62839", ink: "#ffffff" },
  back: { color: "#2f6bff", ink: "#ffffff" },
  legs: { color: "#19b36b", ink: "#06281a" },
  shoulders: { color: "#ffc93c", ink: "#14213d" },
  biceps: { color: "#f77f00", ink: "#14213d" },
  triceps: { color: "#7b4bff", ink: "#ffffff" },
  core: { color: "#8a94b8", ink: "#ffffff" },
  arms: { color: "#00a6a6", ink: "#14213d" }, // older combined group
};

const FALLBACK = [
  { color: "#e056a0", ink: "#14213d" },
  { color: "#5c7cfa", ink: "#14213d" },
  { color: "#a0522d", ink: "#ffffff" },
  { color: "#2a9d8f", ink: "#14213d" },
];

export const STANDARD_GROUPS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "biceps",
  "triceps",
  "core",
];

// Known muscle groups keep fixed colors. Custom groups get a stable color from their name.
export function groupStyle(group) {
  const key = (group || "").toLowerCase();
  if (KNOWN[key]) return KNOWN[key];
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK[hash % FALLBACK.length];
}

// Inline CSS variables used by the chips, cards and workout blocks
export function cssVars(group) {
  const { color, ink } = groupStyle(group);
  return { "--gc": color, "--gc-ink": ink };
}