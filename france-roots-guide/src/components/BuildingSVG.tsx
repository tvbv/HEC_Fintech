import type { ReactElement } from "react";
import type { BuildingId } from "@/lib/theme";

interface Props {
  id: BuildingId;
  color: string;
  state: "locked" | "unlocked" | "done";
  size?: number;
}

export function BuildingSVG({ id, color, state, size = 120 }: Props) {
  const fill = state === "locked" ? "#1C1C1E" : color;
  const stroke = state === "locked" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)";
  const opacity = state === "locked" ? 0.55 : 1;
  const dashed = state === "locked" ? "4 4" : "0";

  const common = { fill, stroke, strokeWidth: 1.5, strokeDasharray: dashed, opacity };

  const shapes: Record<BuildingId, ReactElement> = {
    airport: (
      <g>
        <path d="M60 20 L70 50 L100 60 L70 65 L62 90 L55 65 L20 60 L55 50 Z" {...common} />
      </g>
    ),
    bank: (
      <g>
        {/* fronton */}
        <polygon points="20,40 100,40 60,15" {...common} />
        {/* colonnes */}
        <rect x="25" y="42" width="8" height="50" {...common} />
        <rect x="42" y="42" width="8" height="50" {...common} />
        <rect x="59" y="42" width="8" height="50" {...common} />
        <rect x="76" y="42" width="8" height="50" {...common} />
        <rect x="89" y="42" width="6" height="50" {...common} />
        {/* marches */}
        <rect x="15" y="92" width="90" height="6" {...common} />
        <rect x="10" y="98" width="100" height="6" {...common} />
      </g>
    ),
    taxes: (
      <g>
        <rect x="20" y="45" width="80" height="55" {...common} />
        {/* dome */}
        <path d="M 30 45 Q 60 10 90 45 Z" {...common} />
        <rect x="58" y="20" width="4" height="10" {...common} />
        {/* fenêtres */}
        <rect x="30" y="55" width="10" height="14" fill="rgba(0,0,0,0.3)" />
        <rect x="48" y="55" width="10" height="14" fill="rgba(0,0,0,0.3)" />
        <rect x="66" y="55" width="10" height="14" fill="rgba(0,0,0,0.3)" />
        <rect x="84" y="55" width="10" height="14" fill="rgba(0,0,0,0.3)" />
        <rect x="55" y="78" width="14" height="22" fill="rgba(0,0,0,0.4)" />
      </g>
    ),
    housing: (
      <g>
        {/* toit */}
        <polygon points="20,55 60,20 100,55" {...common} />
        {/* façade */}
        <rect x="25" y="55" width="70" height="50" {...common} />
        {/* cheminée */}
        <rect x="78" y="28" width="10" height="18" {...common} />
        {/* porte */}
        <rect x="55" y="80" width="14" height="25" fill="rgba(0,0,0,0.35)" />
        {/* fenêtre */}
        <rect x="32" y="65" width="14" height="12" fill="rgba(0,0,0,0.3)" />
        <rect x="74" y="65" width="14" height="12" fill="rgba(0,0,0,0.3)" />
      </g>
    ),
    insurance: (
      <g>
        <rect x="20" y="30" width="80" height="75" {...common} />
        {/* shield */}
        <path d="M 60 45 L 80 52 L 78 78 Q 60 92 42 78 L 40 52 Z" fill="rgba(0,0,0,0.3)" stroke="#fff" strokeWidth="2" />
        <path d="M 50 65 L 58 73 L 72 58" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    transport: (
      <g>
        {/* arche metro */}
        <path d="M 25 100 L 25 55 Q 60 15 95 55 L 95 100" {...common} fill="none" strokeWidth="6" />
        <path d="M 25 100 L 25 55 Q 60 15 95 55 L 95 100" fill="none" stroke={fill} strokeWidth="3" opacity="0.4" />
        {/* M */}
        <text x="60" y="78" textAnchor="middle" fontSize="32" fontWeight="900" fill={state === "locked" ? "rgba(255,255,255,0.3)" : "#fff"} fontFamily="Unbounded">M</text>
      </g>
    ),
    work: (
      <g>
        <rect x="30" y="20" width="60" height="85" {...common} />
        {/* fenêtres grille */}
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect key={`${r}-${c}`} x={36 + c * 13} y={28 + r * 14} width="9" height="9" fill="rgba(0,0,0,0.35)" />
          ))
        )}
      </g>
    ),
    children: (
      <g>
        <path d="M 20 105 L 20 55 Q 20 30 60 25 Q 100 30 100 55 L 100 105 Z" {...common} />
        <rect x="50" y="60" width="20" height="28" rx="3" fill={state === "locked" ? "rgba(255,255,255,0.2)" : "#fff"} />
        <rect x="55" y="55" width="10" height="6" rx="2" fill={state === "locked" ? "rgba(255,255,255,0.2)" : "#fff"} />
        <line x1="55" y1="72" x2="65" y2="72" stroke={fill} strokeWidth="1.5" />
        <line x1="55" y1="78" x2="65" y2="78" stroke={fill} strokeWidth="1.5" />
      </g>
    ),
    retirement: (
      <g>
        {/* temple base */}
        <rect x="20" y="55" width="80" height="50" {...common} />
        <polygon points="15,55 105,55 60,28" {...common} />
        {/* clock */}
        <circle cx="60" cy="78" r="14" fill="rgba(0,0,0,0.35)" stroke="#fff" strokeWidth="2" />
        <line x1="60" y1="78" x2="60" y2="68" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="78" x2="68" y2="80" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="78" r="1.5" fill="#fff" />
      </g>
    ),
    aids: (
      <g>
        {/* mains tendues + cœur */}
        <rect x="20" y="60" width="80" height="45" {...common} />
        <polygon points="20,60 100,60 60,38" {...common} />
        <path d="M 60 92 Q 48 80 48 72 Q 48 64 60 70 Q 72 64 72 72 Q 72 80 60 92 Z"
          fill={state === "locked" ? "rgba(255,255,255,0.25)" : "#fff"} />
      </g>
    ),
  };

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="overflow-visible">
      {shapes[id]}
    </svg>
  );
}
