import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CleoCharacter } from "@/components/CleoCharacter";
import { buildingThemes, buildingOrder } from "@/lib/theme";

export const Route = createFileRoute("/generating")({
  component: Generating,
});

const LINES = [
  "J'analyse ton profil…",
  "Je calcule tes droits…",
  "Je trace ta route…",
  "Ta ville est prête !",
];

function Generating() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 6000;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setProgress(p);
      setActiveNode(Math.floor(p * buildingOrder.length));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => navigate({ to: "/city" }), 500);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [navigate]);

  useEffect(() => {
    let i = 0;
    const line = LINES[lineIdx];
    const iv = setInterval(() => {
      i++;
      setTyped(line.slice(0, i));
      if (i >= line.length) {
        clearInterval(iv);
        setTimeout(() => {
          if (lineIdx < LINES.length - 1) {
            setTyped("");
            setLineIdx(lineIdx + 1);
          }
        }, 800);
      }
    }, 35);
    return () => clearInterval(iv);
  }, [lineIdx]);

  // constellation positions on a circle around Cleo
  const R = 130;
  const nodes = buildingOrder.map((id, i) => {
    const angle = (i / buildingOrder.length) * Math.PI * 2 - Math.PI / 2;
    return { id, x: Math.cos(angle) * R, y: Math.sin(angle) * R, color: buildingThemes[id].color };
  });

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6 bg-[#0A0A0A]">
      {/* soft glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "var(--lemon)" }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "var(--lilac)" }} />

      {/* constellation */}
      <div className="relative w-[320px] h-[320px] mb-10 flex items-center justify-center">
        <svg viewBox="-160 -160 320 320" className="absolute inset-0 w-full h-full">
          {/* connecting lines */}
          {nodes.map((n, i) => (
            <line
              key={`l-${i}`}
              x1="0" y1="0" x2={n.x} y2={n.y}
              stroke={i < activeNode ? n.color : "rgba(255,255,255,0.08)"}
              strokeWidth={i < activeNode ? 1.5 : 0.5}
              strokeDasharray={i === activeNode ? "3 4" : "0"}
              style={{ transition: "all 0.4s ease" }}
            />
          ))}
          {/* nodes */}
          {nodes.map((n, i) => {
            const lit = i < activeNode;
            const current = i === activeNode;
            return (
              <g key={n.id}>
                {current && (
                  <circle cx={n.x} cy={n.y} r="14" fill={n.color} opacity="0.3" style={{ animation: "pulse-glow 1.2s ease-in-out infinite" }} />
                )}
                <circle
                  cx={n.x} cy={n.y} r={lit || current ? 6 : 3}
                  fill={lit || current ? n.color : "rgba(255,255,255,0.2)"}
                  style={{ transition: "all 0.4s ease" }}
                />
              </g>
            );
          })}
          {/* center halo */}
          <circle cx="0" cy="0" r="50" fill="var(--lemon)" opacity="0.1" />
        </svg>
        <div className="relative z-10">
          <CleoCharacter state="THINKING" size={88} />
        </div>
      </div>

      {/* typewriter */}
      <p className="font-display font-bold text-2xl text-white text-center mb-3 min-h-[40px] px-4">
        {typed}<span className="inline-block w-0.5 h-6 bg-[var(--lemon)] ml-1 align-middle" style={{ animation: "typewriter-cursor 1s infinite" }} />
      </p>

      {/* progress bar */}
      <div className="w-64 h-1 rounded-full overflow-hidden bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: "linear-gradient(90deg, var(--lemon), var(--lilac))" }} />
      </div>
      <p className="text-white/40 italic text-xs mt-2">{Math.round(progress * 100)}%</p>
    </main>
  );
}
