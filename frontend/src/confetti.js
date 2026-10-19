import confetti from "canvas-confetti";

const COLORS = ["#d62839", "#2f6bff", "#ffc93c", "#19b36b"];

export function celebrate() {
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 2000 };
  confetti({
    ...base,
    particleCount: 80,
    spread: 70,
    angle: 60,
    origin: { x: 0.2, y: 0.7 },
  });
  confetti({
    ...base,
    particleCount: 80,
    spread: 70,
    angle: 120,
    origin: { x: 0.8, y: 0.7 },
  });
}