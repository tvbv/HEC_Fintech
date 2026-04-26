import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CButton } from "@/components/concierge/CButton";
import { Cleo, CleoBubble } from "@/components/concierge/Cleo";
import { Flag, type CountryCode } from "@/components/concierge/Flags";
import { submitIntake, type IntakeRequest } from "@/lib/api";
import {
  IconArrowLeft, IconArrowRight, IconCheck, IconSearch,
  IconBank, IconDocumentCheck, IconCalculator, IconGift,
  IconGraduationCap, IconBriefcase, IconLightning, IconSearch as IconSearch2,
  IconCircles, IconMapPin, IconCard, IconPhone, IconHome, IconShield,
  IconHeartPulse, IconStamp, IconReceipt, IconPerson,
  IconChevronDown,
} from "@/components/concierge/Icons";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const TOTAL = 8;

function Onboarding() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { onboarding, setOnboarding, toggleDocument, completeOnboarding, setProfileId } = useApp();

  // Mapping tables — frontend keys → backend literals
  const STATUS_MAP: Record<string, string> = {
    student: 'student',
    salaried: 'employed_fulltime',
    freelance: 'freelance',
    jobseeker: 'between_jobs',
  };

  const TIME_MAP: Record<string, string> = {
    '0-3': 'just_arrived',
    '3-12': 'settling_in',
    '12+': 'established',
  };

  const DOCS_MAP: Record<string, string> = {
    bank: 'local_bank_account',
    sim: 'local_phone',
    address: 'proof_of_address',
    secu: 'social_security_number',
    vitale: 'health_card',
    visa: 'residence_permit',
    fiscal: 'tax_number',
    caf: 'benefits_number',
  };

  const next = async () => {
    if (step < TOTAL) {
      setDir(1);
      setStep(step + 1);
    } else {
      const mappedStatus = STATUS_MAP[onboarding.status] ?? onboarding.status;
      const isStudent = onboarding.status === 'student';

      const alreadyHas = Object.entries(onboarding.documents)
        .filter(([, checked]) => checked)
        .map(([key]) => DOCS_MAP[key] ?? key);

      const intakeData: IntakeRequest = {
        // Identity
        first_name: onboarding.name.split(' ')[0] || 'User',
        last_name: onboarding.name.split(' ').slice(1).join(' ') || '',
        date_of_birth: '1990-01-01',        // not collected in the form
        nationality: onboarding.fromCountry,
        // Origin & destination
        country_of_residence: onboarding.fromCountry,
        country_moving_to: onboarding.toCountry,
        // Situation
        employment_status: mappedStatus,
        has_income: !isStudent,
        income_bracket: isStudent ? undefined : 'mid',
        currency: 'EUR',
        // Destination context
        time_at_destination: TIME_MAP[onboarding.timeInFrance] ?? undefined,
        has_financial_ties_abroad: onboarding.hasHomeTies ?? undefined,
        already_has: alreadyHas.length > 0 ? alreadyHas : undefined,
        // Goals
        goals: onboarding.goals,
      };

      try {
        setIsSubmitting(true);
        const result = await submitIntake(intakeData);
        setProfileId(result.profile_id);
        completeOnboarding();
        navigate({ to: "/loading" });
      } catch (error) {
        console.error('Failed to submit intake:', error);
        alert('Failed to save your profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const back = () => {
    if (step > 1) { setDir(-1); setStep(step - 1); }
    else navigate({ to: "/" });
  };

  const canContinue = (() => {
    switch (step) {
      case 1: return onboarding.name.trim().length > 0;
      case 2: return !!onboarding.fromCountry;
      case 3: return !!onboarding.toCountry;
      case 4: return onboarding.goals.length > 0;
      case 5: return !!onboarding.status;
      case 6: return !!onboarding.timeInFrance;
      case 7: return onboarding.hasHomeTies !== null;
      case 8: return true;
      default: return false;
    }
  })();

  return (
    <div className="mobile-shell relative overflow-hidden bg-black pb-24">
      {/* Top-right lemon ambient */}
      <div
        className="absolute top-0 right-0 w-[300px] h-[250px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(248,255,161,0.06) 0%, transparent 70%)" }}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-30 px-5 pb-3 glass-dark" style={{ paddingTop: "max(14px, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-3 h-11">
          <button
            onClick={back}
            className="h-10 w-10 -ml-1 rounded-full flex items-center justify-center bg-white-10 text-white active:scale-95"
          >
            <IconArrowLeft size={20} />
          </button>
          <div className="flex-1 flex items-center justify-center gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => {
              const done = i < step - 1;
              const active = i === step - 1;
              return (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    active ? "w-7 bg-lemon" : done ? "w-2 bg-lemon/60" : "w-2 bg-navy"
                  }`}
                />
              );
            })}
          </div>
          <span className="min-w-[60px] text-right text-white-40 text-[12px] font-ui">
            Step {step} of {TOTAL}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4 relative z-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 30 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {step === 1 && <Step1Name value={onboarding.name} onChange={(v) => setOnboarding({ name: v })} />}
            {step === 2 && (
              <Step2Origin
                value={onboarding.fromCountry}
                onSelect={(country, code) => setOnboarding({ fromCountry: country, fromCountryFlag: code })}
              />
            )}
            {step === 3 && (
              <Step3Destination
                value={onboarding.toCountry}
                onSelect={(country, code) => setOnboarding({ toCountry: country, fromCountryFlag: code })}
              />
            )}
            {step === 4 && (
              <Step4Goals
                selected={onboarding.goals}
                onToggle={(k) => {
                  const has = onboarding.goals.includes(k);
                  setOnboarding({ goals: has ? onboarding.goals.filter((g) => g !== k) : [...onboarding.goals, k] });
                }}
              />
            )}
            {step === 5 && (
              <Step5Status value={onboarding.status} onSelect={(v) => setOnboarding({ status: v })} />
            )}
            {step === 6 && (
              <Step6Time
                value={onboarding.timeInFrance}
                destination={onboarding.toCountry || "your destination"}
                onSelect={(v) => setOnboarding({ timeInFrance: v })}
              />
            )}
            {step === 7 && (
              <Step7HomeTies value={onboarding.hasHomeTies} onSelect={(v) => setOnboarding({ hasHomeTies: v })} />
            )}
            {step === 8 && <Step8Documents docs={onboarding.documents} onToggle={toggleDocument} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cleo fixed bottom-left */}
      <div className="fixed bottom-[110px] left-4 z-40 pointer-events-none" style={{ left: "max(16px, calc((100vw - 430px) / 2 + 16px))" }}>
        <div className="opacity-90">
          <Cleo pose="idle" mood="happy" size={48} />
        </div>
      </div>

      {/* Continue CTA fixed bottom */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pt-3 pb-5 glass-dark border-t border-lemon/10 z-30"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <CButton onClick={next} disabled={!canContinue || isSubmitting} variant="primary">
          {isSubmitting ? "Saving..." : step === TOTAL ? "Build my Concierge path" : "Continue"}
          {!isSubmitting && <IconArrowRight size={18} />}
        </CButton>
      </div>
    </div>
  );
}

/* ---------------- Steps ---------------- */

function StepHeader({
  bubble, h1, sub,
}: { bubble: string; h1: string; sub?: string }) {
  return (
    <div className="mb-5">
      <CleoBubble side="left" pose="talking" mood="happy" size={56} text={bubble} className="mb-4" />
      <h1 className="font-display font-extrabold text-white text-[28px] leading-[1.05] tracking-[-0.8px]">
        {h1}
      </h1>
      {sub && <p className="mt-2 text-white-60 text-[14px] font-body">{sub}</p>}
    </div>
  );
}

function Step1Name({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <>
      <StepHeader
        bubble="Hey! What should I call you?"
        h1="What's your name?"
        sub="Let's make this personal."
      />
      <div className="relative">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name..."
          className="w-full h-14 px-5 rounded-[14px] bg-navy text-white text-[18px] font-body placeholder:text-white-30 outline-none border-b-2 border-transparent focus:border-lemon transition-colors"
        />
      </div>
    </>
  );
}

const COUNTRIES: { name: string; code: CountryCode }[] = [
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "United Kingdom", code: "GB" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Belgium", code: "BE" },
  { name: "Switzerland", code: "CH" },
  { name: "Canada", code: "CA" },
  { name: "USA", code: "US" },
  { name: "UAE", code: "AE" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Morocco", code: "MA" },
  { name: "Ukraine", code: "UA" },
  { name: "India", code: "IN" },
  { name: "Brazil", code: "BR" },
  { name: "Japan", code: "JP" },
];

function Step2Origin({ value, onSelect }: { value: string; onSelect: (n: string, c: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <StepHeader bubble="So, where's home? I need to know everything." h1="Where are you from?" />
      <div className="relative mb-4">
        <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lemon" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search countries..."
          className="w-full h-12 pl-12 pr-4 rounded-[14px] bg-navy text-white text-[14px] placeholder:text-white-40 outline-none font-body"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((c) => {
          const active = value === c.name;
          return (
            <button
              key={c.code}
              onClick={() => onSelect(c.name, c.code)}
              className={`flex items-center gap-2.5 p-3.5 rounded-[16px] border transition-all active:scale-[0.97] ${
                active
                  ? "bg-gradient-lemon border-black/20 shadow-lemon scale-[1.02]"
                  : "bg-navy border-white-10"
              }`}
            >
              <Flag code={c.code} size={32} />
              <span className={`text-[14px] font-bold font-body text-left ${active ? "text-black" : "text-white"}`}>
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step3Destination({ value, onSelect }: { value: string; onSelect: (n: string, c: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <StepHeader bubble="Where's the adventure? Pick your destination." h1="And you're heading to..." />
      <div className="relative mb-4">
        <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lemon" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search countries..."
          className="w-full h-12 pl-12 pr-4 rounded-[14px] bg-navy text-white text-[14px] placeholder:text-white-40 outline-none font-body"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((c) => {
          const active = value === c.name;
          return (
            <button
              key={c.code}
              onClick={() => onSelect(c.name, c.code)}
              className={`flex items-center gap-2.5 p-3.5 rounded-[16px] border transition-all active:scale-[0.97] ${
                active
                  ? "bg-gradient-lemon border-black/20 shadow-lemon scale-[1.02]"
                  : "bg-navy border-white-10"
              }`}
            >
              <Flag code={c.code} size={32} />
              <span className={`text-[14px] font-bold font-body text-left ${active ? "text-black" : "text-white"}`}>
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

const GOALS = [
  { key: "banking", title: "Banking & Finance", sub: "Accounts, cards, transfers", Icon: IconBank },
  { key: "admin", title: "Admin Setup", sub: "Residence, social security", Icon: IconDocumentCheck },
  { key: "taxes", title: "Taxes", sub: "Understand and file correctly", Icon: IconCalculator },
  { key: "benefits", title: "Perks & Benefits", sub: "Money France owes you", Icon: IconGift },
];

function Step4Goals({ selected, onToggle }: { selected: string[]; onToggle: (k: string) => void }) {
  return (
    <>
      <StepHeader bubble="What do you need most? Pick everything — I've seen it all." h1="What do you need help with?" />
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => {
          const active = selected.includes(g.key);
          return (
            <button
              key={g.key}
              onClick={() => onToggle(g.key)}
              className={`relative p-4 rounded-[20px] border text-left transition-all active:scale-[0.97] h-[110px] ${
                active ? "bg-gradient-lemon border-black/20 shadow-lemon" : "bg-navy border-white-10"
              }`}
            >
              {active && (
                <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-black flex items-center justify-center">
                  <IconCheck size={12} className="text-lemon" />
                </span>
              )}
              <g.Icon size={26} className={active ? "text-black" : "text-white"} />
              <p className={`mt-2 text-[13px] font-bold font-display ${active ? "text-black" : "text-white"}`}>
                {g.title}
              </p>
              <p className={`text-[11px] font-body mt-0.5 ${active ? "text-black/60" : "text-white-40"}`}>
                {g.sub}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}

const STATUSES = [
  { key: "student", label: "Student", Icon: IconGraduationCap },
  { key: "salaried", label: "Salaried employee", Icon: IconBriefcase },
  { key: "freelance", label: "Freelance", Icon: IconLightning },
  { key: "jobseeker", label: "Job-seeking", Icon: IconSearch2 },
];

function Step5Status({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  return (
    <>
      <StepHeader bubble="And what's your situation? This changes everything." h1="Your status in France?" />
      <div className="space-y-2.5">
        {STATUSES.map((s) => {
          const active = value === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onSelect(s.key)}
              className={`w-full h-[64px] px-5 flex items-center gap-3 rounded-[16px] border transition-all active:scale-[0.98] ${
                active ? "bg-gradient-lemon border-black/20 shadow-lemon" : "bg-navy border-white-10"
              }`}
            >
              <s.Icon size={22} className={active ? "text-black" : "text-lemon"} />
              <span className={`text-[15px] font-bold font-display ${active ? "text-black" : "text-white"}`}>
                {s.label}
              </span>
              {active && <IconCheck size={18} className="text-black ml-auto" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

const TIMES = [
  { key: "0-3", title: "I just arrived", sub: "under 3 months" },
  { key: "3-12", title: "Getting my bearings", sub: "3–12 months" },
  { key: "12+", title: "I'm practically local", sub: "over a year" },
];

function Step6Time({ value, destination, onSelect }: { value: string; destination: string; onSelect: (v: string) => void }) {
  return (
    <>
      <StepHeader bubble="How long navigating this beautiful chaos?" h1={`How long in ${destination}?`} />
      <div className="space-y-3">
        {TIMES.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              className={`w-full h-[72px] px-5 flex flex-col justify-center rounded-[18px] border transition-all active:scale-[0.98] text-left ${
                active ? "bg-gradient-lemon border-black/20 shadow-lemon" : "bg-navy border-white-10"
              }`}
            >
              <p className={`text-[15px] font-bold font-display ${active ? "text-black" : "text-white"}`}>{t.title}</p>
              <p className={`text-[12px] font-body ${active ? "text-black/60" : "text-white-40"}`}>{t.sub}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step7HomeTies({ value, onSelect }: { value: boolean | null; onSelect: (v: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <StepHeader bubble="Still got money stuff back home? Tell me — I keep secrets. (Mostly.)" h1="Financial ties back home?" />
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSelect(true)}
          className={`p-5 rounded-[20px] border min-h-[140px] text-left transition-all active:scale-[0.97] ${
            value === true ? "bg-gradient-lemon border-black/20 shadow-lemon" : "bg-navy border-white-10"
          }`}
        >
          <IconCircles size={30} className={value === true ? "text-black" : "text-lemon"} />
          <p className={`mt-3 text-[15px] font-bold font-display ${value === true ? "text-black" : "text-white"}`}>
            Yes, I do
          </p>
          <p className={`text-[12px] font-body mt-1 ${value === true ? "text-black/60" : "text-white-40"}`}>
            Accounts, savings, property
          </p>
        </button>
        <button
          onClick={() => onSelect(false)}
          className={`p-5 rounded-[20px] border min-h-[140px] text-left transition-all active:scale-[0.97] ${
            value === false ? "bg-gradient-lemon border-black/20 shadow-lemon" : "bg-navy border-white-10"
          }`}
        >
          <IconMapPin size={30} className={value === false ? "text-black" : "text-lemon"} />
          <p className={`mt-3 text-[15px] font-bold font-display ${value === false ? "text-black" : "text-white"}`}>
            Just France for now
          </p>
        </button>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="mt-4 inline-flex items-center gap-1 text-lemon text-[13px] font-bold font-body"
      >
        What counts? <IconChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 p-4 rounded-[14px] bg-navy text-white-60 text-[13px] font-body"
        >
          Bank accounts, property, investments, pensions, or any income source
          still based in your home country.
        </motion.div>
      )}
    </>
  );
}

const DOCS = [
  { key: "bank", label: "French bank account", Icon: IconCard },
  { key: "sim", label: "French phone number", Icon: IconPhone },
  { key: "address", label: "Proof of address", Icon: IconHome },
  { key: "secu", label: "Social Security number", Icon: IconShield },
  { key: "vitale", label: "Carte Vitale", Icon: IconHeartPulse },
  { key: "visa", label: "Residence permit", Icon: IconStamp },
  { key: "fiscal", label: "French tax number", Icon: IconReceipt },
  { key: "caf", label: "CAF number", Icon: IconPerson },
];

function Step8Documents({ docs, onToggle }: { docs: Record<string, boolean>; onToggle: (k: string) => void }) {
  return (
    <>
      <StepHeader bubble="Last one! What's already sorted? I'll skip what you don't need." h1="What do you already have?" />
      <div className="space-y-2.5">
        {DOCS.map((d) => {
          const on = !!docs[d.key];
          return (
            <button
              key={d.key}
              onClick={() => onToggle(d.key)}
              className="w-full px-4 py-3.5 flex items-center gap-3 rounded-[14px] bg-navy border border-white-10 active:scale-[0.99] transition-transform"
            >
              <d.Icon size={20} className={on ? "text-lemon" : "text-white-60"} />
              <span className="flex-1 text-left text-white text-[14px] font-body font-semibold">{d.label}</span>
              <span
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${on ? "bg-lemon" : "bg-white-15"}`}
                style={on ? { boxShadow: "0 0 8px rgba(248,255,161,0.5)" } : undefined}
              >
                <motion.span
                  layout
                  className={`block h-5 w-5 rounded-full ${on ? "bg-black" : "bg-white-40"}`}
                  style={{ marginLeft: on ? "auto" : 0 }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
