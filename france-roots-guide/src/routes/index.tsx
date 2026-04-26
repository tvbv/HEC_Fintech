import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AmbientGlobe } from "@/components/AmbientGlobe";
import { CleoCharacter } from "@/components/CleoCharacter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Concierge — Ta ville t'attend" },
      { name: "description", content: "Ville gamifiée pour t'installer en France. Banque, impôts, logement, assurance." },
      { property: "og:title", content: "Concierge — Ta ville t'attend" },
      { property: "og:description", content: "Ville gamifiée pour t'installer en France." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [letters, setLetters] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => setPhase(4), 3000);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase < 3) return;
    const i = setInterval(() => {
      setLetters((x) => {
        if (x >= 9) { clearInterval(i); return x; }
        return x + 1;
      });
    }, 90);
    return () => clearInterval(i);
  }, [phase]);

  const word = "Concierge";
  const colorOf = (i: number) =>
    i < 3 ? "var(--lemon)" : i < 6 ? "#fff" : "var(--lilac)";

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6">
      <AmbientGlobe />

      {/* halos */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full" style={{ background: "var(--lemon)", filter: "blur(120px)", opacity: 0.18 }} />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full" style={{ background: "var(--lilac)", filter: "blur(120px)", opacity: 0.22 }} />

      {/* Paris silhouette montant du bas */}
      <div className="absolute bottom-0 inset-x-0 h-40 z-10 transition-transform duration-1000" style={{ transform: phase >= 1 ? "translateY(0)" : "translateY(100%)"}}>
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0 160 L0 100 L20 100 L25 80 L40 80 L40 60 L60 60 L65 50 L70 60 L90 60 L90 100 L120 100 L120 70 L140 70 L150 30 L160 70 L180 70 L180 110 L210 110 L210 80 L230 80 L230 60 L250 60 L250 100 L280 100 L280 70 L300 70 L305 50 L310 70 L330 70 L330 110 L360 110 L360 90 L380 90 L380 100 L400 100 L400 160 Z" fill="rgba(168,163,248,0.25)" />
        </svg>
      </div>

      <div className="relative z-20 flex flex-col items-center gap-8">
        {/* Cleo qui tombe */}
        <div className={`transition-all duration-700 ${phase >= 2 ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"}`}>
          <CleoCharacter state="IDLE" size={84} />
        </div>

        {/* Wordmark */}
        {phase >= 3 && (
          <div className="flex">
            {word.split("").map((l, i) => (
              <span
                key={i}
                className="font-display font-black text-5xl sm:text-6xl"
                style={{
                  color: colorOf(i),
                  opacity: i < letters ? 1 : 0,
                  transform: i < letters ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                {l}
              </span>
            ))}
          </div>
        )}

        <p className={`text-white/60 text-center font-body italic max-w-xs transition-opacity duration-700 ${phase >= 4 ? "opacity-100" : "opacity-0"}`}>
          Ta ville sur-mesure pour t'installer en France.
        </p>

        {phase >= 4 && (
          <button
            onClick={() => navigate({ to: "/onboarding" })}
            className="animate-pulse-glow font-label font-semibold px-8 py-4 rounded-2xl text-base"
            style={{ background: "var(--lemon)", color: "#000" }}
          >
            Commencer →
          </button>
        )}
      </div>
    </main>
  );
}
