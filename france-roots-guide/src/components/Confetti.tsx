import { useEffect, useState } from "react";

interface ConfettiProps {
  count?: number;
  duration?: number;
  onDone?: () => void;
}

const COLORS = ["#F8FFA1", "#A8A3F8", "#F6C6EE", "#7B61FF"];

export function Confetti({ count = 60, duration = 2200, onDone }: ConfettiProps) {
  const [pieces] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      duration: 1.6 + Math.random() * 1.4,
    }))
  );

  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: "2px",
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
