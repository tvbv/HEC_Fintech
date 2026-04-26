import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { sendIntake } from "@/lib/api";
import { AmbientGlobe } from "@/components/AmbientGlobe";
import { CleoCharacter } from "@/components/CleoCharacter";
import { UploadIcon, CheckIcon, ChevronIcon } from "@/components/icons";
import { useTranslation } from "react-i18next";


export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Concierge" },
      { name: "description", content: "Personnalise ton parcours d'installation en France." },
    ],
  }),
  component: Onboarding,
});

const STEPS = 9; // 8 questions + upload

const NATIONALITIES = [
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "DZ", flag: "🇩🇿", name: "Algeria" },
];

const INCOME_BRACKETS = ["<1500", "1500-2000", "2000-3000", "3000-5000", "5000+"];

// Use stable IDs (= backend codes) — display labels come from i18n
const DOC_IDS = [
  { id: "id_card", labelKey: "onboarding.doc_id" },
  { id: "passport", labelKey: "onboarding.doc_passport" },
  { id: "visa", labelKey: "onboarding.doc_visa" },
  { id: "residence_permit", labelKey: "onboarding.doc_residence" },
  { id: "proof_of_address", labelKey: "onboarding.doc_address" },
  { id: "local_bank_account", labelKey: "onboarding.doc_rib" },
  { id: "tax_number", labelKey: "onboarding.doc_fiscal" },
  { id: "employer_certificate", labelKey: "onboarding.doc_employer" },
] as const;

const GOAL_IDS = [
  { id: "open_bank_account", labelKey: "onboarding.goal_bank" },
  { id: "find_housing", labelKey: "onboarding.goal_housing" },
  { id: "understand_taxes", labelKey: "onboarding.goal_taxes" },
  { id: "get_insurance", labelKey: "onboarding.goal_insurance" },
  { id: "get_transport_card", labelKey: "onboarding.goal_navigo" },
  { id: "find_job", labelKey: "onboarding.goal_job" },
  { id: "enroll_children", labelKey: "onboarding.goal_school" },
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { onboarding, setOnboarding, addDocument, completeOnboarding, setProfileId } = useApp();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const next = async () => {
    if (step < STEPS - 1) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const { profile_id } = await sendIntake(onboarding);
        setProfileId(profile_id);
      } catch {
        setSubmitError(t("common.profile_not_synced"));
      } finally {
        setSubmitting(false);
        completeOnboarding();
        navigate({ to: "/generating" });
      }
    }
  };

  const prev = () => step > 0 && setStep(step - 1);

  const canContinue = (() => {
    switch (step) {
      case 0: return !!onboarding.first_name && !!onboarding.last_name;
      case 1: return !!onboarding.date_of_birth;
      case 2: return !!onboarding.nationality;
      case 3: return !!onboarding.country_moving_to;
      case 4: return !!onboarding.employment_status;
      case 5: return onboarding.has_income !== undefined;
      case 6: return !!onboarding.time_in_france;
      case 7: return (onboarding.goals?.length ?? 0) > 0;
      case 8: return true;
      default: return false;
    }
  })();

  return (
    <main className="relative min-h-screen pb-32">
      <AmbientGlobe />
      <div className="relative z-10 max-w-md mx-auto px-5 pt-6">
        {/* progress pills */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                background: i < step ? "var(--lemon)" : i === step ? "#fff" : "var(--bg-elevated)",
              }}
            />
          ))}
        </div>

        <div key={step} className="animate-fade-in">
          {step === 0 && <Step0 data={onboarding} set={setOnboarding} />}
          {step === 1 && <Step1 data={onboarding} set={setOnboarding} />}
          {step === 2 && <Step2 data={onboarding} set={setOnboarding} />}
          {step === 3 && <Step3 data={onboarding} set={setOnboarding} />}
          {step === 4 && <Step4 data={onboarding} set={setOnboarding} />}
          {step === 5 && <Step5 data={onboarding} set={setOnboarding} />}
          {step === 6 && <Step6 data={onboarding} set={setOnboarding} />}
          {step === 7 && <Step7 data={onboarding} set={setOnboarding} />}
          {step === 8 && <Step8 onUpload={(name) => addDocument({ name, type: "official" })} />}
        </div>
      </div>

      {/* footer CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pt-8 pb-6 px-5 z-20">
        {submitError && (
          <p className="text-center text-xs text-orange-400 italic mb-2">{submitError}</p>
        )}
        <div className="max-w-md mx-auto flex gap-3">
          {step > 0 && (
            <button onClick={prev} className="px-5 py-3.5 rounded-2xl bg-[#1C1C1E] text-white font-label">
              ←
            </button>
          )}
          <button
            onClick={next}
            disabled={!canContinue || submitting}
            className="flex-1 py-3.5 rounded-2xl font-label font-semibold transition-opacity"
            style={{
              background: "var(--lemon)",
              color: "#000",
              opacity: canContinue && !submitting ? 1 : 0.35,
            }}
          >
            {submitting ? t("common.sending") : step === STEPS - 1 ? t("common.finish") : t("common.continue")}
          </button>
          {step === 8 && (
            <button onClick={next} className="px-4 py-3.5 rounded-2xl bg-[#1C1C1E] text-white/60 text-sm font-label">
              {t("common.skip")}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Heading({ a, b, c, ca, cb, cc }: { a: string; b: string; c?: string; ca: string; cb: string; cc?: string }) {
  return (
    <h1 className="font-display font-black text-4xl leading-tight mb-6">
      <span style={{ color: ca }}>{a}</span>{" "}
      <span style={{ color: cb }}>{b}</span>
      {c && <> <span style={{ color: cc }}>{c}</span></>}
    </h1>
  );
}

const inputCls = "w-full bg-[#1C1C1E] border-b-2 border-white/10 px-4 py-3.5 rounded-t-xl text-white font-body italic placeholder:text-white/30 outline-none focus:border-[var(--lemon)] transition-colors";

function Step0({ data, set }: any) {
  const { t } = useTranslation();
  return (
    <>
      <Heading a={t("onboarding.step0_title_a")} b={t("onboarding.step0_title_b")} c={t("onboarding.step0_title_c")} ca="var(--lemon)" cb="#fff" cc="var(--lilac)" />
      <CleoCharacter state="TALKING" message={t("onboarding.step0_cleo")} size={56} />
      <div className="mt-6 space-y-3">
        <input className={inputCls} placeholder={t("onboarding.step0_first")} value={data.first_name ?? ""} onChange={(e) => set({ first_name: e.target.value })} />
        <input className={inputCls} placeholder={t("onboarding.step0_last")} value={data.last_name ?? ""} onChange={(e) => set({ last_name: e.target.value })} />
      </div>
    </>
  );
}

function Step1({ data, set }: any) {
  const { t } = useTranslation();
  return (
    <>
      <Heading a={t("onboarding.step1_title_a")} b={t("onboarding.step1_title_b")} c={t("onboarding.step1_title_c")} ca="#fff" cb="var(--lemon)" cc="var(--lilac)" />
      <p className="text-white/50 italic mb-6">{t("onboarding.step1_sub")}</p>
      <input
        type="date"
        className={inputCls}
        value={data.date_of_birth ?? ""}
        onChange={(e) => set({ date_of_birth: e.target.value })}
      />
    </>
  );
}

function Step2({ data, set }: any) {
  const { t } = useTranslation();
  return (
    <>
      <Heading a={t("onboarding.step2_title_a")} b={t("onboarding.step2_title_b")} c={t("onboarding.step2_title_c")} ca="var(--lilac)" cb="#fff" cc="var(--lemon)" />
      <p className="text-white/50 italic mb-4 text-sm">{t("onboarding.step2_sub")}</p>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {NATIONALITIES.map((n) => {
          const active = data.nationality === n.code;
          return (
            <button
              key={n.code}
              onClick={() => set({ nationality: n.code })}
              className="rounded-2xl p-4 text-left transition-all"
              style={{
                background: active ? "var(--lemon)" : "var(--bg-surface)",
                color: active ? "#000" : "#fff",
              }}
            >
              <div className="text-2xl mb-1">{n.flag}</div>
              <div className="text-sm font-label font-medium">{n.name}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

const COUNTRIES = [
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "BE", flag: "🇧🇪", name: "Belgique" },
  { code: "CH", flag: "🇨🇭", name: "Suisse" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "LU", flag: "🇱🇺", name: "Luxembourg" },
  { code: "DE", flag: "🇩🇪", name: "Allemagne" },
  { code: "ES", flag: "🇪🇸", name: "Espagne" },
  { code: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "IT", flag: "🇮🇹", name: "Italie" },
  { code: "GB", flag: "🇬🇧", name: "Royaume-Uni" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "MA", flag: "🇲🇦", name: "Maroc" },
];

function Step3({ data, set }: any) {
  const { t } = useTranslation();
  return (
    <>
      <Heading a={t("onboarding.step3_title_a")} b={t("onboarding.step3_title_b")} c={t("onboarding.step3_title_c")} ca="#fff" cb="var(--lemon)" cc="var(--lilac)" />
      <p className="text-white/50 italic mb-4 text-sm">{t("onboarding.step3_sub")}</p>
      <div className="grid grid-cols-3 gap-2">
        {COUNTRIES.map((c) => {
          const active = data.country_moving_to === c.code;
          return (
            <button
              key={c.code}
              onClick={() => set({ country_moving_to: c.code, region: null, city: "" })}
              className="rounded-2xl p-3 text-center transition-all"
              style={{
                background: active ? "var(--lemon)" : "var(--bg-surface)",
                color: active ? "#000" : "#fff",
                border: active ? "2px solid var(--lemon)" : "2px solid transparent",
              }}
            >
              <div className="text-3xl mb-1">{c.flag}</div>
              <div className="text-xs font-label font-medium">{c.name}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step4({ data, set }: any) {
  const { t } = useTranslation();
  const EMPLOYMENT = [
    { id: "student", label: t("onboarding.step4_student") },
    { id: "salaried", label: t("onboarding.step4_salaried") },
    { id: "freelance", label: t("onboarding.step4_freelance") },
    { id: "searching", label: t("onboarding.step4_searching") },
  ];
  return (
    <>
      <Heading a={t("onboarding.step4_title_a")} b={t("onboarding.step4_title_b")} c={t("onboarding.step4_title_c")} ca="var(--lemon)" cb="#fff" cc="var(--vivid-green)" />
      <div className="space-y-3 mt-4">
        {EMPLOYMENT.map((e) => {
          const active = data.employment_status === e.id;
          return (
            <button
              key={e.id}
              onClick={() => set({ employment_status: e.id })}
              className="w-full rounded-2xl p-5 text-left flex items-center justify-between transition-all"
              style={{
                background: active ? "var(--lemon)" : "var(--bg-surface)",
                color: active ? "#000" : "#fff",
              }}
            >
              <span className="font-label font-medium text-base">{e.label}</span>
              {active && <CheckIcon size={20} />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step5({ data, set }: any) {
  const { t } = useTranslation();
  return (
    <>
      <Heading a={t("onboarding.step5_title_a")} b={t("onboarding.step5_title_b")} c={t("onboarding.step5_title_c")} ca="#fff" cb="var(--vivid-green)" cc="var(--lemon)" />
      <div className="flex gap-3 mb-6">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            onClick={() => set({ has_income: v })}
            className="flex-1 py-4 rounded-2xl font-label font-semibold"
            style={{
              background: data.has_income === v ? "var(--lemon)" : "var(--bg-surface)",
              color: data.has_income === v ? "#000" : "#fff",
            }}
          >
            {v ? t("onboarding.step5_yes") : t("onboarding.step5_no")}
          </button>
        ))}
      </div>
      {data.has_income && (
        <div className="animate-fade-in">
          <p className="text-white/60 italic text-sm mb-3">{t("onboarding.step5_how_much")}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {INCOME_BRACKETS.map((b) => (
              <button
                key={b}
                onClick={() => set({ income_bracket: b })}
                className="px-4 py-2.5 rounded-full text-sm font-label font-medium"
                style={{
                  background: data.income_bracket === b ? "var(--lilac)" : "var(--bg-surface)",
                  color: data.income_bracket === b ? "#000" : "#fff",
                }}
              >
                {b} €
              </button>
            ))}
          </div>
          <select
            className={inputCls}
            value={data.currency ?? "EUR"}
            onChange={(e) => set({ currency: e.target.value })}
          >
            <option value="EUR">EUR €</option>
            <option value="USD">USD $</option>
            <option value="GBP">GBP £</option>
          </select>
        </div>
      )}
    </>
  );
}

function Step6({ data, set }: any) {
  const { t } = useTranslation();
  const TIMES = [
    { id: "less_3m", label: t("onboarding.time_less3m") },
    { id: "4_months", label: t("onboarding.time_4months") },
    { id: "1_3_years", label: t("onboarding.time_1_3y") },
    { id: "3_plus", label: t("onboarding.time_3plus") },
  ];
  return (
    <>
      <Heading a={t("onboarding.step6_title_a")} b={t("onboarding.step6_title_b")} c={t("onboarding.step6_title_c")} ca="var(--lilac)" cb="var(--lemon)" cc="#fff" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {TIMES.map((ti) => (
          <button
            key={ti.id}
            onClick={() => set({ time_in_france: ti.id })}
            className="rounded-2xl p-4 font-label font-medium"
            style={{
              background: data.time_in_france === ti.id ? "var(--lemon)" : "var(--bg-surface)",
              color: data.time_in_france === ti.id ? "#000" : "#fff",
            }}
          >
            {ti.label}
          </button>
        ))}
      </div>
      <p className="text-white/60 italic text-sm mb-3">{t("onboarding.step6_financial_ties")}</p>
      <div className="flex gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            onClick={() => set({ has_financial_ties_abroad: v })}
            className="flex-1 py-3.5 rounded-2xl font-label font-medium"
            style={{
              background: data.has_financial_ties_abroad === v ? "var(--lilac)" : "var(--bg-surface)",
              color: data.has_financial_ties_abroad === v ? "#000" : "#fff",
            }}
          >
            {v ? t("common.yes") : t("common.no")}
          </button>
        ))}
      </div>
    </>
  );
}

function Step7({ data, set }: any) {
  const { t } = useTranslation();
  const goals = data.goals ?? [];
  const already = data.already_has ?? [];
  const toggle = (key: string, list: string[]) =>
    list.includes(key) ? list.filter((x) => x !== key) : [...list, key];
  return (
    <>
      <Heading a={t("onboarding.step7_title_a")} b={t("onboarding.step7_title_b")} c="" ca="var(--vivid-orange)" cb="#fff" cc="" />
      <p className="text-white/50 italic mb-3 text-sm">{t("onboarding.step7_sub_have")}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {DOC_IDS.map((d) => {
          const has = already.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => set({ already_has: toggle(d.id, already) })}
              className="px-3 py-2 rounded-full text-xs font-label"
              style={{
                background: has ? "var(--vivid-green)" : "var(--bg-surface)",
                color: has ? "#fff" : "rgba(255,255,255,0.7)",
              }}
            >
              {has ? "✓ " : ""}{t(d.labelKey)}
            </button>
          );
        })}
      </div>
      <p className="text-white/50 italic mb-3 text-sm">{t("onboarding.step7_sub_goals")}</p>
      <div className="space-y-2">
        {GOAL_IDS.map((g) => {
          const active = goals.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => set({ goals: toggle(g.id, goals) })}
              className="w-full rounded-xl p-3.5 text-left flex items-center justify-between"
              style={{
                background: active ? "var(--lemon)" : "var(--bg-surface)",
                color: active ? "#000" : "#fff",
              }}
            >
              <span className="font-label text-sm">{t(g.labelKey)}</span>
              {active && <CheckIcon size={18} />}
            </button>
          );
        })}
      </div>
    </>
  );
}

const API_URL_UPLOAD = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

interface UploadResult { name: string; status: "ok" | "error" | "loading"; reason?: string }

function Step8({ onUpload }: { onUpload: (name: string) => void }) {
  const { t } = useTranslation();
  const [results, setResults] = useState<UploadResult[]>([]);
  const { setOnboarding } = useApp();

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      if (file.size > 10 * 1024 * 1024) {
        setResults((r) => [...r, { name: file.name, status: "error", reason: t("onboarding.step8_too_big") }]);
        return;
      }
      const ok = /\.(pdf|jpg|jpeg|png|webp|txt)$/i.test(file.name);
      if (!ok) {
        setResults((r) => [...r, { name: file.name, status: "error", reason: t("onboarding.step8_bad_format") }]);
        return;
      }

      setResults((r) => [...r, { name: file.name, status: "loading" }]);

      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${API_URL_UPLOAD}/documents`, { method: "POST", body: form });
        if (res.ok) {
          const { extracted } = await res.json() as { extracted: Record<string, string | null> };
          const patch: Record<string, string> = {};
          if (extracted.first_name) patch.first_name = extracted.first_name;
          if (extracted.last_name) patch.last_name = extracted.last_name;
          if (extracted.date_of_birth) patch.date_of_birth = extracted.date_of_birth;
          if (extracted.nationality) patch.nationality = extracted.nationality;
          if (Object.keys(patch).length > 0) setOnboarding(patch);
        }
        onUpload(file.name);
        setResults((r) => r.map((x) => x.name === file.name && x.status === "loading" ? { ...x, status: "ok" } : x));
      } catch {
        setResults((r) => r.map((x) => x.name === file.name && x.status === "loading" ? { ...x, status: "error", reason: t("onboarding.step8_network_err") } : x));
        onUpload(file.name);
      }
    });
  };
  return (
    <>
      <Heading a={t("onboarding.step8_title_a")} b={t("onboarding.step8_title_b")} c={t("onboarding.step8_title_c")} ca="var(--lemon)" cb="#fff" cc="var(--lilac)" />
      <p className="text-white/50 italic mb-6 text-sm">{t("onboarding.step8_sub")}</p>
      <label
        className="block rounded-3xl p-8 text-center cursor-pointer transition-all"
        style={{ background: "var(--bg-surface)", border: "2px dashed var(--lemon)" }}
      >
        <input
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="inline-flex w-14 h-14 rounded-full bg-[var(--lemon)]/20 items-center justify-center mb-3 text-[var(--lemon)]">
          <UploadIcon size={26} />
        </div>
        <p className="font-label font-medium text-white">{t("onboarding.step8_drop")}</p>
        <p className="text-white/40 italic text-xs mt-1">{t("onboarding.step8_hint")}</p>
      </label>
      {results.length > 0 && (
        <div className="mt-4 space-y-2 animate-fade-in">
          {results.map((r, i) => (
            <div key={i} className="rounded-xl p-3 flex items-center gap-2 text-sm"
              style={{
                background: "var(--bg-surface)",
                border: `1px solid ${r.status === "ok" ? "var(--vivid-green)" : r.status === "loading" ? "rgba(255,255,255,0.2)" : "var(--vivid-red)"}`,
              }}>
              {r.status === "ok" && <CheckIcon size={14} className="text-[var(--vivid-green)]" />}
              {r.status === "loading" && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
              {r.status === "error" && <span className="text-[var(--vivid-red)]">✕</span>}
              <span className="text-white truncate flex-1">{r.name}</span>
              {r.status === "loading" && <span className="text-white/40 text-xs italic">{t("onboarding.step8_analyzing")}</span>}
              {r.reason && <span className="text-[var(--vivid-red)] text-xs italic">{r.reason}</span>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
