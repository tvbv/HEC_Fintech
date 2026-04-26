import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { buildingThemes, buildingOrder } from "@/lib/theme";
import { CleoCharacter } from "@/components/CleoCharacter";
import { CountUp } from "@/components/CountUp";
import { BottomNav } from "@/components/BottomNav";
import { BuildingIcon } from "@/components/BuildingIcon";
import { LockIcon, CheckIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Concierge" }] }),
  component: Dashboard,
});

const INCOME_BRACKET_MAP: Record<string, number> = {
  "<1500": 1200,
  "1500-2000": 1750,
  "2000-3000": 2500,
  "3000-5000": 4000,
  "5000+": 6000,
};

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
  const total = revenus + depenses + epargne || 1;
  const r = 60; const c = 2 * Math.PI * r;
  const seg = (val: number) => (val / total) * c;
  const { t } = useTranslation();
  const segs = [
    { v: revenus, color: "var(--vivid-green)", label: t("dashboard.income") },
    { v: depenses, color: "var(--vivid-orange)", label: t("dashboard.expenses") },
    { v: epargne, color: "var(--vivid-purple)", label: t("dashboard.savings") },
  ];
  const hasData = revenus > 0 || epargne > 0;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={150} height={150} viewBox="0 0 150 150" className="-rotate-90">
        <circle cx="75" cy="75" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="14" />
        {hasData ? segs.map((s, i) => {
          const len = seg(s.v);
          const el = (
            <circle key={i} cx="75" cy="75" r={r} fill="none" stroke={s.color} strokeWidth="14"
              strokeDasharray={`${len} ${c}`} strokeDashoffset={-offset} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.8s ease-out" }} />
          );
          offset += len;
          return el;
        }) : null}
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

interface PayslipBar { label: string; net: number; color: string }
function PayslipBars({ data, noDataLabel }: { data: PayslipBar[]; noDataLabel: string }) {
  const max = Math.max(...data.map((d) => d.net), 1);
  if (data.length === 0) {
    return <p className="text-white/40 italic text-sm text-center py-6">{noDataLabel}</p>;
  }
  return (
    <div className="flex items-end justify-between gap-2 h-32 px-1">
      {data.map((d) => {
        const h = (d.net / max) * 100;
        return (
          <div key={d.label} className="flex flex-col items-center flex-1 gap-1">
            <div className="text-[10px] font-bold text-white">€{d.net}</div>
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
  const { t, i18n } = useTranslation();
  const { onboarding, completedBuildings, xp, biberons, userBenefits, payslips } = useApp();
  const locale = i18n.language === "en" ? "en-GB" : "fr-FR";

  // Real income from uploaded payslips
  const uploadedPayslips = Object.entries(payslips).filter(([, p]) => p.uploaded && p.net);
  const avgNet = uploadedPayslips.length > 0
    ? Math.round(uploadedPayslips.reduce((s, [, p]) => s + (p.net ?? 0), 0) / uploadedPayslips.length)
    : onboarding.has_income
      ? (INCOME_BRACKET_MAP[onboarding.income_bracket ?? ""] ?? 0)
      : 0;

  // Expenses always 0 (no tracking yet)
  const totalExpenses = 0;

  // Savings = biberons savings total
  const totalSavings = biberons.reduce((s, b) => s + b.savings, 0);
  const benefitsTotal = userBenefits.reduce((s, b) => s + b.monthly_value, 0);

  // Payslip bar chart data (last 6 months)
  const payslipBars: PayslipBar[] = uploadedPayslips
    .slice(-6)
    .map(([month, p], i) => ({
      label: (() => {
        const [y, m] = month.split("-");
        return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(locale, { month: "short" });
      })(),
      net: p.net ?? 0,
      color: i === uploadedPayslips.length - 1 ? "var(--lemon)" : "var(--vivid-purple)",
    }));

  // Sparkline from payslips or flat line
  const sparklineData = uploadedPayslips.length >= 2
    ? uploadedPayslips.slice(-12).map(([, p]) => p.net ?? 0)
    : [avgNet, avgNet, avgNet, avgNet, avgNet, avgNet];

  return (
    <main className="min-h-screen pb-28 bg-[#0A0A0A]">
      <header className="px-5 pt-6 pb-4">
        <p className="text-white/50 italic text-sm">{t("dashboard.hello", { name: onboarding.first_name ?? "" })}</p>
        <h1 className="font-display font-black text-3xl text-white">{t("dashboard.title")}</h1>
      </header>

      {/* Hero balance + sparkline */}
      <section className="mx-5 rounded-3xl p-6 mb-4 animate-fade-in" style={{ background: "var(--vivid-purple)" }}>
        <p className="text-white/70 text-xs uppercase tracking-wider font-label">{t("dashboard.balance")}</p>
        <p className="font-display font-black text-white text-5xl mt-1">€<CountUp to={avgNet + totalSavings} /></p>
        {uploadedPayslips.length > 0 && (
          <p className="text-white/60 text-xs italic mt-1">
            {t("dashboard.avg_net_label")} · {uploadedPayslips.length} {t("dashboard.payslips_count")}
          </p>
        )}
        <div className="mt-3 -mx-2">
          <Sparkline data={sparklineData} />
        </div>
      </section>

      {/* Donut + XP ring */}
      <section className="mx-5 grid grid-cols-1 gap-3 mb-4">
        <div className="rounded-2xl p-5 bg-[#1C1C1E] animate-fade-in">
          <p className="font-display font-bold text-white mb-3">{t("dashboard.monthly_split")}</p>
          <Donut revenus={avgNet} depenses={totalExpenses} epargne={totalSavings} />
        </div>
        <div className="rounded-2xl p-5 bg-[#1C1C1E] flex items-center gap-4 animate-fade-in">
          <XPRing xp={xp} />
          <div className="flex-1">
            <p className="font-display font-bold text-white">{t("dashboard.level")}</p>
            <p className="text-white/50 italic text-xs">{t("dashboard.level_hint")}</p>
          </div>
        </div>
      </section>

      {/* Payslip income timeline */}
      <section className="mx-5 rounded-2xl p-5 bg-[#1C1C1E] mb-4 animate-fade-in">
        <p className="font-display font-bold text-white mb-3">{t("dashboard.income_history")}</p>
        <PayslipBars data={payslipBars} noDataLabel={t("dashboard.no_payslips")} />
      </section>

      {/* Active benefits */}
      <section className="mx-5 rounded-2xl p-5 mb-4 animate-fade-in" style={{ background: "linear-gradient(135deg, var(--lemon) 0%, #fff8a1 100%)", color: "#000" }}>
        <p className="font-display font-bold mb-1">{t("dashboard.active_benefits")}</p>
        <p className="italic text-xs opacity-70 mb-3">{t("dashboard.saving_monthly", { total: benefitsTotal })}</p>
        {userBenefits.length === 0 ? (
          <p className="italic text-xs opacity-60">{t("dashboard.no_benefits")}</p>
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
        <h2 className="font-display font-bold text-white text-lg mb-3">{t("dashboard.progression")}</h2>
        <div className="rounded-2xl p-4 bg-[#1C1C1E] overflow-x-auto">
          <div className="relative flex items-center gap-3 min-w-max pb-1">
            {/* ligne pointillée derrière */}
            <div className="absolute left-6 right-6 top-6 h-0.5 -z-0"
              style={{ backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.2) 0 6px, transparent 6px 12px)" }} />
            {buildingOrder.map((id) => {
              const theme = buildingThemes[id];
              const done = completedBuildings.includes(id);
              return (
                <div key={id} className="relative z-10 flex flex-col items-center gap-1.5 w-16">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: done ? theme.color : "var(--bg-elevated)",
                      color: done ? theme.textColor : "rgba(255,255,255,0.4)",
                      boxShadow: done ? `0 0 12px ${theme.color}55` : "none",
                    }}>
                    {done ? <CheckIcon size={16} /> : <BuildingIcon id={id} size={18} />}
                  </div>
                  <span className="text-[9px] font-label text-center" style={{ color: done ? "#fff" : "rgba(255,255,255,0.4)" }}>
                    {theme.name}
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
          <p className="font-label font-semibold text-white text-sm mb-1">{t("dashboard.daily_tip")}</p>
          <p className="text-white/60 italic text-xs">{t("dashboard.daily_tip_text")}</p>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
