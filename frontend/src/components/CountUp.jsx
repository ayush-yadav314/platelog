import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

export default function CountUp({ value, duration = 0.9 }) {
  const reduce = useReducedMotion();
  const from = useRef(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        from.current = v;
        setDisplay(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduce, duration]);

  return <>{(reduce ? value : display).toLocaleString()}</>;
}