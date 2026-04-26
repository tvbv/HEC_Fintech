import { useState } from "react";
import { useApp } from "@/lib/store";
import { AIDS_CATALOG, type AidEntry } from "@/lib/buildings";
import { CheckIcon } from "@/components/icons";
import { CountUp } from "@/components/CountUp";

const CATEGORIES: { id: AidEntry["category"]; label: string; color: string }[] = [
  { id: "logement", label: "Logement", color: "var(--vivid-orange)" },
  { id: "famille", label: "Famille", color: "var(--pink)" },
  { id: "santé", label: "Santé", color: "var(--vivid-red)" },
  { id: "emploi", label: "Emploi", color: "var(--vivid-green)" },
  { id: "énergie", label: "Énergie", color: "var(--vivid-yellow)" },
  { id: "jeune", label: "Jeunes", color: "var(--lemon)" },
  { id: "handicap", label: "Handicap", color: "var(--vivid-purple)" },
];

export function AidsSection() {
  const { userBenefits, addBenefit, removeBenefit } = useApp();
  const [filter, setFilter] = useState<AidEntry["category"] | "all">("all");
  const totalMonthly = userBenefits.reduce((s, b) => s + b.monthly_value, 0);
  const filtered = filter === "all" ? AIDS_CATALOG : AIDS_CATALOG.filter((a) => a.category === filter);

  return (
    <section className="px-5 mb-8">
      <h2 className="font-display font-bold text-white text-xl mb-1">Catalogue d'aides</h2>
      <p className="text-white/50 italic text-sm mb-4">Coche celles que tu touches déjà — j'ajoute à ton dashboard.</p>

      {userBenefits.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--vivid-yellow)" }}>
          <p className="text-black/70 text-[10px] uppercase tracking-wider font-label">Tes avantages mensuels</p>
          <p className="font-display font-black text-black text-3xl">€<CountUp to={totalMonthly} /></p>
          <p className="text-black/60 text-xs italic">{userBenefits.length} aide(s) obtenue(s)</p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
        <button onClick={() => setFilter("all")} className="px-3 py-1.5 rounded-full text-xs font-label font-semibold whitespace-nowrap" style={{ background: filter === "all" ? "var(--lemon)" : "var(--bg-surface)", color: filter === "all" ? "#000" : "#fff" }}>
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)} className="px-3 py-1.5 rounded-full text-xs font-label font-semibold whitespace-nowrap" style={{ background: filter === c.id ? c.color : "var(--bg-surface)", color: filter === c.id ? "#fff" : "#fff" }}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((a) => {
          const obtained = userBenefits.find((b) => b.name === a.name);
          return (
            <div key={a.id} className="rounded-2xl p-4 bg-[#1C1C1E]" style={{ border: obtained ? "1px solid var(--vivid-yellow)" : "1px solid transparent" }}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-display font-bold text-white text-sm flex-1">{a.name}</h3>
                {a.monthly_value > 0 && <span className="text-[var(--lemon)] font-bold text-sm">€{a.monthly_value}/mo</span>}
              </div>
              <p className="text-white/60 italic text-xs mb-2">{a.description}</p>
              <p className="text-white/40 text-[11px] mb-3">📋 {a.conditions}</p>
              <div className="flex gap-2">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-2 rounded-xl text-xs font-label font-semibold bg-white/10 text-white">
                  En savoir +
                </a>
                <button
                  onClick={() => obtained ? removeBenefit(obtained.id) : addBenefit({ name: a.name, monthly_value: a.monthly_value })}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-label font-semibold flex items-center justify-center gap-1"
                  style={{ background: obtained ? "var(--vivid-yellow)" : "var(--lemon)", color: "#000" }}
                >
                  {obtained ? <><CheckIcon size={12} /> Obtenue</> : "Je l'ai"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
