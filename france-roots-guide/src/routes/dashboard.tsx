import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { buildingThemes, buildingOrder } from "@/lib/theme";
import { CleoCharacter } from "@/components/CleoCharacter";
import { CountUp } from "@/components/CountUp";
import { BottomNav } from "@/components/BottomNav";
import { BuildingIcon } from "@/components/BuildingIcon";
import { LockIcon, CheckIcon } from "@/components/icons";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Concierge" }] }),
  component: Dashboard,
});

const SPARKLINE = [2200, 2100, 2300, 2150, 2450, 2380, 2600, 2700, 2950, 3100, 3300, 3450];

const EXPENSES = [
  { label: "Loyer", value: 850, color: "var(--vivid-orange)" },
  { label: "Courses", value: 420, color: "var(--vivid-green)" },
  { label: "Transport", value: 84, color: "var(--vivid-purple)" },
  { label: "Loisirs", value: 210, color: "var(--lilac)" },
  { label: "Énergie", value: 95, color: "var(--lemon)" },
];

function Sparkline({ data, w = 320, h = 60, color = "url(#sparkGrad)" }: { data: number[]; w?: number; h?: number; color?: string }) {
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const area = `M0,${h} L${points.replace(/ /g, " L")} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--lemon)" />
          <stop offset="100%" stopColor="var(--lilac)" />
        </linearGradient>
        <linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lemon)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--lemon)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkArea)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - ((v - min) / range) * (h - 4) - 2} r={i === data.length - 1 ? 4 : 0} fill="var(--lemon)" />
      ))}
    </svg>
  );
}

function Donut({ revenus, depenses, epargne }: { revenus: number; depenses: number; epargne: number }) {
  const total = revenus + depenses + epargne;
  const r = 60; const c = 2 * Math.PI * r;
  const seg = (val: number) => (val / total) * c;
  const segs = [
    { v: revenus, color: "var(--vivid-green)", label: "Revenus" },
    { v: depenses, color: "var(--vivid-orange)", label: "Dépenses" },
    { v: epargne, color: "var(--vivid-purple)", label: "Épargne" },
  ];
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={150} height={150} viewBox="0 0 150 150" className="-rotate-90">
        <circle cx="75" cy="75" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="14" />
        {segs.map((s, i) => {
          const len = seg(s.v);
          const el = (
            <circle key={i} cx="75" cy="75" r={r} fill="none" stroke={s.color} strokeWidth="14"
              strokeDasharray={`${len} ${c}`} strokeDashoffset={-offset} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.8s ease-out" }} />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="flex-1 space-y-2">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            <span className="text-white/70 font-label flex-1">{s.label}</span>
            <span className="text-white font-bold">€{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bars({ data }: { data: typeof EXPENSES }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 h-32 px-1">
      {data.map((d) => {
        const h = (d.value / max) * 100;
        return (
          <div key={d.label} className="flex flex-col items-center flex-1 gap-1">
            <div className="text-[10px] font-bold text-white">€{d.value}</div>
            <div className="w-full rounded-t-md transition-all"
              style={{ height: `${h}%`, background: d.color, animation: "fade-in 0.6s ease-out both" }} />
            <div className="text-[10px] text-white/60 font-label truncate w-full text-center">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function XPRing({ xp }: { xp: number }) {
  const goal = Math.max(500, Math.ceil((xp + 1) / 500) * 500);
  const pct = Math.min(1, xp / goal);
  const r = 38; const c = 2 * Math.PI * r;
  return (
    <div className="relative w-24 h-24">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--lemon)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`} style={{ transition: "stroke-dasharray 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-black text-white text-lg leading-none">{xp}</div>
        <div className="text-[9px] text-white/50 uppercase font-label">/{goal} XP</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { onboarding, completedBuildings, xp, biberons, userBenefits } = useApp();
  const totalSavings = biberons.reduce((s, b) => s + b.savings, 0);
  const benefitsTotal = userBenefits.reduce((s, b) => s + b.monthly_value, 0);

  return (
    <main className="min-h-screen pb-28 bg-[#0A0A0A]">
      <header className="px-5 pt-6 pb-4">
        <p className="text-white/50 italic text-sm">Bonjour {onboarding.first_name ?? "toi"}</p>
        <h1 className="font-display font-black text-3xl text-white">Dashboard</h1>
      </header>

      {/* Hero solde + sparkline */}
      <section className="mx-5 rounded-3xl p-6 mb-4 animate-fade-in" style={{ background: "var(--vivid-purple)" }}>
        <p className="text-white/70 text-xs uppercase tracking-wider font-label">Solde tous comptes</p>
        <p className="font-display font-black text-white text-5xl mt-1">€<CountUp to={3450 + totalSavings} /></p>
        <p className="text-white/60 text-xs italic mt-1">📈 +12% ce mois</p>
        <div className="mt-3 -mx-2">
          <Sparkline data={SPARKLINE} />
        </div>
      </section>

      {/* Donut + XP ring */}
      <section className="mx-5 grid grid-cols-1 gap-3 mb-4">
        <div className="rounded-2xl p-5 bg-[#1C1C1E] animate-fade-in">
          <p className="font-display font-bold text-white mb-3">Répartition mensuelle</p>
          <Donut revenus={2400} depenses={1850} epargne={450} />
        </div>
        <div className="rounded-2xl p-5 bg-[#1C1C1E] flex items-center gap-4 animate-fade-in">
          <XPRing xp={xp} />
          <div className="flex-1">
            <p className="font-display font-bold text-white">Niveau Explorer</p>
            <p className="text-white/50 italic text-xs">Continue à débloquer des bâtiments pour monter en niveau.</p>
          </div>
        </div>
      </section>

      {/* Bar chart dépenses */}
      <section className="mx-5 rounded-2xl p-5 bg-[#1C1C1E] mb-4 animate-fade-in">
        <p className="font-display font-bold text-white mb-3">Dépenses par catégorie</p>
        <Bars data={EXPENSES} />
      </section>

      {/* Avantages actifs */}
      <section className="mx-5 rounded-2xl p-5 mb-4 animate-fade-in" style={{ background: "linear-gradient(135deg, var(--lemon) 0%, #fff8a1 100%)", color: "#000" }}>
        <p className="font-display font-bold mb-1">Mes avantages actifs</p>
        <p className="italic text-xs opacity-70 mb-3">Tu économises €{benefitsTotal}/mois</p>
        {userBenefits.length === 0 ? (
          <p className="italic text-xs opacity-60">Active des aides depuis la ville → bâtiment Aides 🎁</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userBenefits.map((b) => (
              <span key={b.id} className="px-3 py-1.5 rounded-full bg-black/15 text-[11px] font-label font-semibold">
                {b.name} · €{b.monthly_value}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Timeline progression */}
      <section className="mx-5 mb-4">
        <h2 className="font-display font-bold text-white text-lg mb-3">Progression</h2>
        <div className="rounded-2xl p-4 bg-[#1C1C1E] overflow-x-auto">
          <div className="relative flex items-center gap-3 min-w-max pb-1">
            {/* ligne pointillée derrière */}
            <div className="absolute left-6 right-6 top-6 h-0.5 -z-0"
              style={{ backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.2) 0 6px, transparent 6px 12px)" }} />
            {buildingOrder.map((id) => {
              const t = buildingThemes[id];
              const done = completedBuildings.includes(id);
              return (
                <div key={id} className="relative z-10 flex flex-col items-center gap-1.5 w-16">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: done ? t.color : "var(--bg-elevated)",
                      color: done ? t.textColor : "rgba(255,255,255,0.4)",
                      boxShadow: done ? `0 0 12px ${t.color}55` : "none",
                    }}>
                    {done ? <CheckIcon size={16} /> : <BuildingIcon id={id} size={18} />}
                  </div>
                  <span className="text-[9px] font-label text-center" style={{ color: done ? "#fff" : "rgba(255,255,255,0.4)" }}>
                    {t.name}
                  </span>
                  {!done && id !== "airport" && (
                    <span className="absolute top-0 right-1 text-white/30">
                      <LockIcon size={9} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-5 rounded-2xl p-4 bg-[#1C1C1E] flex gap-3" style={{ borderLeft: "4px solid var(--lemon)" }}>
        <CleoCharacter state="TALKING" size={42} />
        <div className="flex-1">
          <p className="font-label font-semibold text-white text-sm mb-1">Suggestion du jour</p>
          <p className="text-white/60 italic text-xs">Tu pourrais économiser €40/mois en activant le Forfait Mobilités Durables avec ton employeur.</p>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
