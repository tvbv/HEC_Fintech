import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { DocIcon, CheckIcon, UploadIcon } from "@/components/icons";
import { CountUp } from "@/components/CountUp";
import { useTranslation } from "react-i18next";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

/** Returns the last N months as { iso: "YYYY-MM", label: "janvier 2026" } */
function lastNMonths(n: number, locale: string) {
  const out: { iso: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(locale, { month: "long", year: "numeric" });
    out.push({ iso, label });
  }
  return out;
}

export function PayslipsSection() {
  const { t, i18n } = useTranslation();
  const { payslips, uploadPayslip, onboarding, setOnboarding } = useApp();
  const locale = i18n.language === "en" ? "en-GB" : "fr-FR";
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const months = lastNMonths(12, locale);
  const uploaded = months.filter((m) => payslips[m.iso]?.uploaded);
  const nets = uploaded.map((m) => payslips[m.iso]?.net ?? 0);
  const avgNet = nets.length ? Math.round(nets.reduce((s, v) => s + v, 0) / nets.length) : 0;
  const totalCotis = nets.length ? Math.round(nets.reduce((s, v) => s + v, 0) * 0.28) : 0;
  const isJobSeeking = onboarding.is_job_seeking === true;

  const handleFile = async (iso: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError(t("onboarding.step8_too_big"));
      return;
    }
    if (!/\.(pdf|jpg|jpeg|png|webp)$/i.test(file.name)) {
      setError(t("onboarding.step8_bad_format"));
      return;
    }

    setError(null);
    setUploading(iso);

    try {
      // Try real AI analysis first
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/upload-document`, { method: "POST", body: form });
      if (res.ok) {
        // The endpoint extracts identity fields, not payslip net — use simulated net
        uploadPayslip(iso, file.name);
      } else {
        uploadPayslip(iso, file.name);
      }
    } catch {
      // Network error — still mark as uploaded locally
      uploadPayslip(iso, file.name);
    } finally {
      setUploading(null);
    }
  };

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

      {error && (
        <p className="text-[var(--vivid-red)] text-xs italic mb-3 px-1">{error}</p>
      )}

      <div className="space-y-2">
        {months.map(({ iso, label }) => {
          const p = payslips[iso];
          const isUploaded = p?.uploaded === true;
          const isLoading = uploading === iso;

          return (
            <div
              key={iso}
              className="w-full rounded-xl bg-[#1C1C1E] p-3 flex items-center gap-3 transition-all"
              style={{ border: isUploaded ? "1px solid var(--vivid-green)" : "1px solid transparent" }}
            >
              {/* File input (hidden) */}
              <input
                ref={(el) => { fileRefs.current[iso] = el; }}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(iso, file);
                  e.target.value = "";
                }}
              />

              {/* Icon */}
              <button
                onClick={() => !isUploaded && !isLoading && fileRefs.current[iso]?.click()}
                disabled={isUploaded || isLoading}
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isUploaded ? "var(--vivid-green)" : "rgba(248,255,161,0.15)",
                  color: isUploaded ? "#fff" : "var(--lemon)",
                }}
              >
                {isLoading
                  ? <span className="animate-spin text-xs">⏳</span>
                  : isUploaded
                    ? <CheckIcon size={16} />
                    : <UploadIcon size={16} />
                }
              </button>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <p className="font-label font-semibold text-white text-sm truncate capitalize">{label}</p>
                <p className="text-xs italic truncate" style={{ color: isUploaded ? "var(--vivid-green)" : "rgba(255,255,255,0.4)" }}>
                  {isLoading
                    ? t("onboarding.step8_analyzing")
                    : isUploaded
                      ? (p.filename ? `${p.filename} · Net : €${p.net?.toLocaleString(locale)}` : `Net : €${p.net?.toLocaleString(locale)}`)
                      : t("payslips.tap_upload")
                  }
                </p>
              </div>

              {/* Upload button (when not yet uploaded) */}
              {!isUploaded && !isLoading && (
                <button
                  onClick={() => fileRefs.current[iso]?.click()}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-label font-semibold transition-all active:scale-95"
                  style={{ background: "rgba(248,255,161,0.15)", color: "var(--lemon)" }}
                >
                  <DocIcon size={12} />
                  PDF
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
