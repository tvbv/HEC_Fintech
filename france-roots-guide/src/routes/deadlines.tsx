import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { buildingThemes, type BuildingId } from "@/lib/theme";
import { BottomNav } from "@/components/BottomNav";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/deadlines")({
  head: () => ({ meta: [{ title: "Échéances — Concierge" }] }),
  component: Deadlines,
});

interface Deadline { date: string; titleKey: string; buildingId: BuildingId; urgency: "high" | "med" | "low" }

const DEADLINES: Deadline[] = [
  { date: "2025-05-31", titleKey: "deadlines.dl_tax_return", buildingId: "taxes", urgency: "high" },
  { date: "2025-06-15", titleKey: "deadlines.dl_navigo", buildingId: "transport", urgency: "low" },
  { date: "2025-07-01", titleKey: "deadlines.dl_rent", buildingId: "housing", urgency: "med" },
  { date: "2025-09-01", titleKey: "deadlines.dl_school", buildingId: "children", urgency: "med" },
  { date: "2025-05-12", titleKey: "deadlines.dl_insurance", buildingId: "insurance", urgency: "med" },
  { date: "2025-05-25", titleKey: "deadlines.dl_caf", buildingId: "aids", urgency: "low" },
];

function Deadlines() {
  const { t, i18n } = useTranslation();
  const { onboarding } = useApp();
  const [cursor, setCursor] = useState(() => new Date(2025, 4, 1));
  const [highlight, setHighlight] = useState<string | null>(null);

  const locale = i18n.language === "en" ? "en-GB" : "fr-FR";

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
        <p className="text-white/50 italic text-sm">{t("deadlines.greeting", { name: onboarding.first_name ?? "" })}</p>
        <h1 className="font-display font-black text-3xl text-white">{t("deadlines.title")}</h1>
      </header>

      <section className="px-5 space-y-3 mb-6">
        {[...DEADLINES].sort((a, b) => a.date.localeCompare(b.date)).map((d) => {
          const theme = buildingThemes[d.buildingId];
          const date = new Date(d.date);
          const day = date.toLocaleDateString(locale, { day: "2-digit" });
          const m = date.toLocaleDateString(locale, { month: "short" });
          const isHL = highlight === d.date;
          return (
            <article key={d.date + d.title} className="rounded-2xl p-4 flex items-center gap-4 transition-all"
              style={{
                background: isHL ? `${theme.color}33` : "var(--bg-surface)",
                borderLeft: `4px solid ${theme.color}`,
                transform: isHL ? "scale(1.02)" : "scale(1)",
              }}>
              <div className="text-center w-14 shrink-0">
                <p className="font-display font-black text-2xl" style={{ color: theme.color }}>{day}</p>
                <p className="text-white/50 text-xs uppercase font-label">{m}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-white">{t(d.titleKey as any)}</p>
                <p className="text-white/40 italic text-xs">{t(`theme.${d.buildingId}` as any)}</p>
              </div>
              <div className="px-2 py-1 rounded-full text-[10px] font-label font-bold uppercase"
                style={{ background: urgencyColor(d.urgency), color: "#fff" }}>
                {d.urgency === "high" ? t("deadlines.urgent") : d.urgency === "med" ? t("deadlines.soon") : t("deadlines.ok")}
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
          <p className="font-display font-bold text-white">{new Date(year, month, 1).toLocaleDateString(locale, { month: "long", year: "numeric" })}</p>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-9 h-9 rounded-full bg-[#2C2C2E] text-white flex items-center justify-center">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(2025, 0, 6 + i); // Jan 6 2025 = Monday
            return <div key={i} className="text-center text-[10px] uppercase tracking-wider text-white/40 font-label py-1">
              {d.toLocaleDateString(locale, { weekday: "short" }).slice(0, 1).toUpperCase()}
            </div>;
          })}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const ds = deadlinesByDay(d);
            const has = ds.length > 0;
            const main = ds[0];
            const calTheme = main ? buildingThemes[main.buildingId] : null;
            return (
              <button
                key={i}
                disabled={!has}
                onClick={() => has && main && setHighlight(highlight === main.date ? null : main.date)}
                className="aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-label relative transition-all"
                style={{
                  background: has ? `${calTheme!.color}26` : "transparent",
                  border: has ? `1.5px solid ${calTheme!.color}` : "1px solid rgba(255,255,255,0.04)",
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
        <p className="text-white/40 italic text-[10px] mt-3 text-center">{t("deadlines.tap_hint")}</p>
      </section>

      <BottomNav />
    </main>
  );
}
