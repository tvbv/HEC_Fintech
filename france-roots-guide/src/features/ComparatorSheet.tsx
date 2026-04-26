import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import type { Recommendation } from "@/lib/buildings";

interface Props {
  recos: Recommendation[];
  brands: { name: string; color: string }[];
  themeColor: string;
}

// Construit une liste enrichie d'options à comparer (recos + brands restantes)
function buildOptions(recos: Recommendation[], brands: { name: string; color: string }[]) {
  const out = recos.map((r) => ({
    name: r.name,
    rating: r.rating,
    metrics: r.metrics,
  }));
  brands.forEach((b) => {
    if (!out.some((o) => o.name === b.name)) {
      out.push({
        name: b.name,
        rating: 3.8 + Math.random() * 0.8,
        metrics: [
          { label: "Prix", value: `${Math.floor(Math.random() * 20)} €` },
          { label: "Délai", value: `${Math.floor(Math.random() * 7) + 1}j` },
          { label: "Note", value: (3.8 + Math.random() * 1).toFixed(1) },
        ],
      });
    }
  });
  return out;
}

export function ComparatorButton({ recos, brands, themeColor }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const options = buildOptions(recos, brands);

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  const compared = options.filter((o) => selected.includes(o.name));
  // collecte des labels de métriques (union)
  const metricLabels = Array.from(new Set(compared.flatMap((c) => c.metrics.map((m) => m.label))));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 rounded-2xl font-label font-semibold text-sm flex items-center gap-2"
        style={{ background: themeColor, color: "#000" }}
      >
        ⚖️ Comparer toutes les options
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Comparer les options">
        <p className="text-white/50 italic text-xs mb-3">Sélectionne 2 à 5 options pour les comparer côte à côte.</p>
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {options.map((o) => {
            const checked = selected.includes(o.name);
            return (
              <button
                key={o.name}
                onClick={() => toggle(o.name)}
                className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all"
                style={{ background: checked ? `${themeColor}22` : "var(--bg-elevated)", border: checked ? `1px solid ${themeColor}` : "1px solid transparent" }}
              >
                <span className="w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{ borderColor: checked ? themeColor : "rgba(255,255,255,0.2)", background: checked ? themeColor : "transparent", color: "#000" }}>
                  {checked && "✓"}
                </span>
                <span className="font-label font-semibold text-white text-sm flex-1">{o.name}</span>
                <span className="text-[var(--lemon)] text-xs">★ {o.rating.toFixed(1)}</span>
              </button>
            );
          })}
        </div>

        {compared.length >= 2 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg-elevated)" }}>
                  <th className="text-left p-3 font-label text-white/60 text-xs uppercase">Critère</th>
                  {compared.map((c) => (
                    <th key={c.name} className="p-3 font-display font-bold text-white text-xs whitespace-nowrap" style={{ color: themeColor }}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 text-white/60 font-label text-xs">Note</td>
                  {compared.map((c) => (
                    <td key={c.name} className="p-3 text-white font-bold text-xs">★ {c.rating.toFixed(1)}</td>
                  ))}
                </tr>
                {metricLabels.map((lbl) => (
                  <tr key={lbl} className="border-t border-white/5">
                    <td className="p-3 text-white/60 font-label text-xs">{lbl}</td>
                    {compared.map((c) => {
                      const m = c.metrics.find((x) => x.label === lbl);
                      return (
                        <td key={c.name} className="p-3 text-white text-xs whitespace-nowrap">{m?.value ?? "—"}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white/40 italic text-xs text-center py-6">Sélectionne au moins 2 options ↑</p>
        )}
      </BottomSheet>
    </>
  );
}
