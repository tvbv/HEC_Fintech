import { useApp } from "@/lib/store";
import { CountUp } from "@/components/CountUp";
import { CleoCharacter } from "@/components/CleoCharacter";
import { useTranslation } from "react-i18next";

export function RetirementSection() {
  const { t } = useTranslation();
  const { payslips } = useApp();
  const uploaded = Object.values(payslips).filter((p) => p?.uploaded);
  const months = uploaded.length;
  const trimestres = Math.floor(months / 3);
  const avgNet = months ? Math.round(uploaded.reduce((s, p) => s + (p.net ?? 0), 0) / months) : 0;
  // Projection ultra-simplifiée : 50% du net moyen × ratio carrière
  const remainingYears = 35;
  const projectedPension = avgNet ? Math.round(avgNet * 0.5) : 0;
  const totalEarned = avgNet * months;

  return (
    <section className="px-5 mb-8">
      <h2 className="font-display font-bold text-white text-xl mb-1">{t("retirement.title")}</h2>
      <p className="text-white/50 italic text-sm mb-4">{t("retirement.subtitle")}</p>

      {months === 0 ? (
        <div className="rounded-2xl p-5 bg-[#1C1C1E] flex gap-3">
          <CleoCharacter state="THINKING" size={42} />
          <p className="text-white/60 italic text-sm flex-1">{t("retirement.no_payslips")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-2xl p-4" style={{ background: "var(--lilac)" }}>
              <p className="text-black/70 text-[10px] uppercase tracking-wider font-label">{t("retirement.quarters")}</p>
              <p className="font-display font-black text-black text-3xl"><CountUp to={trimestres} /></p>
              <p className="text-black/60 text-xs italic">{t("retirement.quarters_required")}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "var(--vivid-purple)" }}>
              <p className="text-white/80 text-[10px] uppercase tracking-wider font-label">{t("retirement.pension")}</p>
              <p className="font-display font-black text-white text-3xl">€<CountUp to={projectedPension} /></p>
              <p className="text-white/70 text-xs italic">{t("retirement.pension_at")}</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 bg-[#1C1C1E]">
            <p className="text-white/50 text-[10px] uppercase tracking-wider font-label">{t("retirement.total_contributed")}</p>
            <p className="font-display font-black text-white text-2xl">€<CountUp to={Math.round(totalEarned * 0.28)} /></p>
            <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full" style={{ width: `${Math.min(100, (trimestres / 172) * 100)}%`, background: "linear-gradient(90deg, var(--lilac), var(--lemon))" }} />
            </div>
            <p className="text-white/40 text-xs italic mt-2">{t("retirement.years_remaining", { years: remainingYears })}</p>
          </div>
        </>
      )}
    </section>
  );
}
