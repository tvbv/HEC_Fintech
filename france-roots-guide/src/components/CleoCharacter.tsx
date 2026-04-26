import { useEffect, useState } from "react";

export type CleoState = "IDLE" | "TALKING" | "THINKING" | "GUIDING" | "CELEBRATING";

interface CleoProps {
  state?: CleoState;
  message?: string;
  size?: number;
  className?: string;
}

export function CleoCharacter({ state = "IDLE", message, size = 64, className = "" }: CleoProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (state !== "TALKING" && state !== "THINKING") return;
    const t = setInterval(() => setTick((x) => x + 1), 400);
    return () => clearInterval(t);
  }, [state]);

  const eyeY = state === "THINKING" ? 28 + Math.sin(tick) * 1 : 30;
  const mouthScale = state === "TALKING" ? 0.6 + (tick % 2) * 0.4 : 1;
  const isCelebrating = state === "CELEBRATING";

  return (
    <div className={`inline-flex items-end gap-2 ${className}`}>
      <div
        className="relative animate-blob animate-float"
        style={{
          width: size,
          height: size,
          background: "var(--lemon)",
          boxShadow: isCelebrating
            ? "0 0 40px 8px var(--lemon)"
            : "0 0 20px 0 rgba(248,255,161,0.4)",
        }}
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full">
          {/* eyes */}
          {state === "THINKING" ? (
            <>
              <line x1="22" y1={eyeY} x2="28" y2={eyeY} stroke="#000" strokeWidth="3" strokeLinecap="round" />
              <line x1="36" y1={eyeY} x2="42" y2={eyeY} stroke="#000" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : isCelebrating ? (
            <>
              <path d="M 20 32 Q 25 26 30 32" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 34 32 Q 39 26 44 32" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="25" cy={eyeY} r="3" fill="#000" />
              <circle cx="39" cy={eyeY} r="3" fill="#000" />
            </>
          )}
          {/* mouth */}
          <ellipse
            cx="32"
            cy="42"
            rx={6 * mouthScale}
            ry={3 * mouthScale}
            fill="#000"
          />
          {/* blush */}
          <circle cx="18" cy="40" r="2.5" fill="rgba(246,198,238,0.7)" />
          <circle cx="46" cy="40" r="2.5" fill="rgba(246,198,238,0.7)" />
        </svg>
      </div>
      {message && (
        <div className="relative max-w-[220px] bg-white text-black rounded-2xl rounded-bl-sm px-3 py-2 mb-1 animate-fade-in">
          <p className="text-sm italic font-body leading-snug">{message}</p>
        </div>
      )}
    </div>
  );
}
