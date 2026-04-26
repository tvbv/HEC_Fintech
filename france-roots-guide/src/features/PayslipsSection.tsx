import { useApp } from "@/lib/store";
import { DocIcon, CheckIcon, UploadIcon } from "@/components/icons";
import { CountUp } from "@/components/CountUp";
import { useTranslation } from "react-i18next";

export function PayslipsSection() {
  const { t, i18n } = useTranslation();
  const { payslips, uploadPayslip, onboarding, setOnboarding } = useApp();
  const locale = i18n.language === "en" ? "en-GB" : "fr-FR";

  function lastNMonths(n: number): string[] {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push(d.toLocaleDateString(locale, { month: "long", year: "numeric" }));
    }
    return out;
  }

  const months = lastNMonths(12);
  const uploaded = months.map((m) => payslips[m]).filter((p) => p?.uploaded);
  const avgNet = uploaded.length
    ? Math.round(uploaded.reduce((s, p) => s + (p?.net ?? 0), 0) / uploaded.length)
    : 0;
  const totalCotis = uploaded.length ? Math.round(avgNet * 0.28 * uploaded.length) : 0;
  const isJobSeeking = onboarding.is_job_seeking === true;

  return (
    <section className="px-5 mb-8">
      <h2 className="font-display font-bold text-white text-xl mb-1">{t("payslips.title")}</h2>
      <p className="text-white/50 italic text-sm mb-4">{t("payslips.subtitle")}</p>

      {isJobSeeking && (
        <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: "var(--vivid-orange)" }}>
          <span className="text-2xl">🔍</span>
          <div className="flex-1">
            <p className="font-display font-bold text-white text-sm">{t("payslips.job_seeking")}</p>
            <p className="text-white/80 italic text-xs mt-0.5">{t("payslips.job_seeking_sub")}</p>
            <button onClick={() => setOnboarding({ is_job_seeking: false, employment_status: "salaried" })}
              className="mt-2 px-3 py-1.5 rounded-full bg-black/25 text-white text-xs font-label font-semibold">
              {t("payslips.back_to_work")}
            </button>
          </div>
        </div>
      )}
      {uploaded.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl p-4" style={{ background: "var(--vivid-green)" }}>
            <p className="text-white/80 text-[10px] uppercase tracking-wider font-label">{t("payslips.avg_net")}</p>
            <p className="font-display font-black text-white text-2xl">€<CountUp to={avgNet} /></p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--vivid-purple)" }}>
            <p className="text-white/80 text-[10px] uppercase tracking-wider font-label">{t("payslips.contributions")}</p>
            <p className="font-display font-black text-white text-2xl">€<CountUp to={totalCotis} /></p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {months.map((m) => {
          const p = payslips[m];
          return (
            <button
              key={m}
              onClick={() => !p?.uploaded && uploadPayslip(m)}
              className="w-full rounded-xl bg-[#1C1C1E] p-3 flex items-center gap-3 transition-all"
              style={{ border: p?.uploaded ? "1px solid var(--vivid-green)" : "1px solid transparent" }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: p?.uploaded ? "var(--vivid-green)" : "rgba(248,255,161,0.15)", color: p?.uploaded ? "#fff" : "var(--lemon)" }}>
                {p?.uploaded ? <CheckIcon size={16} /> : <UploadIcon size={16} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-label font-semibold text-white text-sm truncate">{m}</p>
                <p className="text-xs italic" style={{ color: p?.uploaded ? "var(--vivid-green)" : "rgba(255,255,255,0.4)" }}>
                  {p?.uploaded ? `Net : €${p.net?.toLocaleString(locale)}` : t("payslips.tap_upload")}
                </p>
              </div>
              <DocIcon size={18} className="text-white/30" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
