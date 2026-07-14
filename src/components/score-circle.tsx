"use client";

import { useEffect, useRef, useState } from "react";

function gradeColorVar(grade: string): string {
  const map: Record<string, string> = {
    "A+": "var(--green)",
    A: "var(--green)",
    "B+": "var(--gold-dark)",
    B: "var(--gold-dark)",
    C: "var(--amber)",
    D: "var(--red)",
  };
  return map[grade] || "var(--gold-dark)";
}

export function ScoreCircle({
  score,
  grade,
  max,
  animate = false,
}: {
  score: number;
  grade: string;
  max: number;
  animate?: boolean;
}) {
  const [shown, setShown] = useState(animate ? 0 : score);
  const raf = useRef<number>();

  useEffect(() => {
    if (!animate) {
      setShown(score);
      return;
    }
    const start = performance.now();
    const dur = 1000;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(score * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [score, animate]);

  const pct = Math.round((shown / max) * 100);

  return (
    <div
      className="score-circle"
      style={
        {
          // CSS custom properties for the conic gradient.
          ["--pct" as string]: pct,
          ["--c" as string]: gradeColorVar(grade),
        } as React.CSSProperties
      }
    >
      <div className="inner">
        <div className="num">{shown}</div>
        <div className="of">of {max}</div>
        <div className="grade">Grade {grade}</div>
      </div>
    </div>
  );
}
