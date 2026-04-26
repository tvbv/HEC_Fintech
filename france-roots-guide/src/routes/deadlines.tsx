import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { buildingThemes, type BuildingId } from "@/lib/theme";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/deadlines")({
  head: () => ({ meta: [{ title: "Échéances — Concierge" }] }),
  component: Deadlines,
});

interface Deadline { date: string; title: string; buildingId: BuildingId; urgency: "high" | "med" | "low" }

const DEADLINES: Deadline[] = [
  { date: "2025-05-31", title: "Déclaration de revenus", buildingId: "taxes", urgency: "high" },
  { date: "2025-06-15", title: "Renouvellement Navigo", buildingId: "transport", urgency: "low" },
  { date: "2025-07-01", title: "Quittance loyer juillet", buildingId: "housing", urgency: "med" },
  { date: "2025-09-01", title: "Inscription école", buildingId: "children", urgency: "med" },
  { date: "2025-05-12", title: "Échéance assurance", buildingId: "insurance", urgency: "med" },
  { date: "2025-05-25", title: "Versement CAF", buildingId: "aids", urgency: "low" },
];

const FR_MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const FR_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function Deadlines() {
  const { onboarding } = useApp();
  const [cursor, setCursor] = useState(() => new Date(2025, 4, 1)); // mai 2025 par défaut
  const [highlight, setHighlight] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const deadlinesByDay = (day: number): Deadline[] => {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return DEADLINES.filter((d) => d.date === iso);
  };

  const urgencyColor = (u: Deadline["urgency"]) =>
    u === "high" ? "var(--vivid-red)" : u === "med" ? "var(--vivid-orange)" : "var(--vivid-green)";

  return (
    <main className="min-h-screen pb-28 bg-[#0A0A0A]">
      <header className="px-5 pt-6 pb-4">
        <p className="text-white/50 italic text-sm">{onboarding.first_name ?? "Toi"}, voilà ce qui arrive</p>
        <h1 className="font-display font-black text-3xl text-white">Échéances</h1>
      </header>

      <section className="px-5 space-y-3 mb-6">
        {[...DEADLINES].sort((a, b) => a.date.localeCompare(b.date)).map((d) => {
          const t = buildingThemes[d.buildingId];
          const date = new Date(d.date);
          const day = date.toLocaleDateString("fr-FR", { day: "2-digit" });
          const m = date.toLocaleDateString("fr-FR", { month: "short" });
          const isHL = highlight === d.date;
          return (
            <article key={d.date + d.title} className="rounded-2xl p-4 flex items-center gap-4 transition-all"
              style={{
                background: isHL ? `${t.color}33` : "var(--bg-surface)",
                borderLeft: `4px solid ${t.color}`,
                transform: isHL ? "scale(1.02)" : "scale(1)",
              }}>
              <div className="text-center w-14 shrink-0">
                <p className="font-display font-black text-2xl" style={{ color: t.color }}>{day}</p>
                <p className="text-white/50 text-xs uppercase font-label">{m}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-white">{d.title}</p>
                <p className="text-white/40 italic text-xs">{t.name}</p>
              </div>
              <div className="px-2 py-1 rounded-full text-[10px] font-label font-bold uppercase"
                style={{ background: urgencyColor(d.urgency), color: "#fff" }}>
                {d.urgency === "high" ? "Urgent" : d.urgency === "med" ? "Bientôt" : "OK"}
              </div>
            </article>
          );
        })}
      </section>

      {/* Calendrier mensuel */}
      <section className="mx-5 rounded-3xl p-4 bg-[#1C1C1E]">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-9 h-9 rounded-full bg-[#2C2C2E] text-white flex items-center justify-center">←</button>
          <p className="font-display font-bold text-white">{FR_MONTHS[month]} {year}</p>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-9 h-9 rounded-full bg-[#2C2C2E] text-white flex items-center justify-center">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {FR_DAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] uppercase tracking-wider text-white/40 font-label py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const ds = deadlinesByDay(d);
            const has = ds.length > 0;
            const main = ds[0];
            const t = main ? buildingThemes[main.buildingId] : null;
            return (
              <button
                key={i}
                disabled={!has}
                onClick={() => has && main && setHighlight(highlight === main.date ? null : main.date)}
                className="aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-label relative transition-all"
                style={{
                  background: has ? `${t!.color}26` : "transparent",
                  border: has ? `1.5px solid ${t!.color}` : "1px solid rgba(255,255,255,0.04)",
                  color: has ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                <span className="font-bold">{d}</span>
                {has && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {ds.slice(0, 3).map((dl, k) => (
                      <span key={k} className="w-1 h-1 rounded-full"
                        style={{ background: urgencyColor(dl.urgency) }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-white/40 italic text-[10px] mt-3 text-center">Tap un jour avec point pour voir l'échéance ↑</p>
      </section>

      <BottomNav />
    </main>
  );
}
