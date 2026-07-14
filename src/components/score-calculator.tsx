"use client";

import { useMemo, useState } from "react";
import { CHECK_TYPES, CHECK_LABELS, CheckType, MAX_PER_CHECK, MAX_TOTAL } from "@/lib/checks";
import { gradeForScore } from "@/lib/scoring";
import { CheckIcons, TickGold } from "./icons";
import { ScoreCircle } from "./score-circle";

export function ScoreCalculator() {
  const [selected, setSelected] = useState<Set<CheckType>>(new Set(CHECK_TYPES));

  function toggle(c: CheckType) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  const score = useMemo(() => Math.min(MAX_TOTAL, selected.size * MAX_PER_CHECK), [selected]);
  const grade = gradeForScore(score);

  return (
    <div className="calc" style={{ marginTop: 38 }}>
      <div className="center">
        <ScoreCircle score={score} grade={grade} max={MAX_TOTAL} />
      </div>
      <div className="calc-card">
        <span className="eyebrow">Interactive</span>
        <h3 style={{ fontSize: 26, margin: "6px 0 4px" }}>See the score move</h3>
        <p className="muted small" style={{ margin: "0 0 16px" }}>
          Turn the checks a profile has verified on or off, and watch the trust score and grade
          change live.
        </p>
        <div>
          {CHECK_TYPES.map((c) => (
            <button
              key={c}
              type="button"
              className={`ctog ${selected.has(c) ? "active" : ""}`}
              onClick={() => toggle(c)}
            >
              {CheckIcons[c]}
              <span>{CHECK_LABELS[c]}</span>
              <span className="tk">{TickGold}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
