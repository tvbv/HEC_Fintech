import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Calendar,
  Coins,
  ArrowRight,
  Download,
  MapPin,
  Check,
  Sparkles,
  FileSignature,
  Wallet,
  Receipt,
  Home,
} from "lucide-react";
import { TopBar } from "@/components/concierge/TopBar";
import { CCard, Pill } from "@/components/concierge/CCard";
import { CButton } from "@/components/concierge/CButton";
import { Cleo, CleoBubble } from "@/components/concierge/Cleo";
import { useApp } from "@/lib/store";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/level/taxes")({
  component: TaxesLevel,
});

type Step = "intro" | "plan" | "pack";
const TOTAL = 3;
const STEP_INDEX: Record<Step, number> = { intro: 1, plan: 2, pack: 3 };

function TaxesLevel() {
  const [step, setStep] = useState<Step>("intro");
  const { addXp, setQuest } = useApp();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  return (
    <div className="mobile-shell pb-32 bg-black min-h-screen">
      <TopBar
        title={<span className="font-display font-bold text-white">Taxes · Level 2</span>}
        step={{ current: STEP_INDEX[step], total: TOTAL }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35 }}
        >
          {step === "intro" && <IntroStep onNext={() => setStep("plan")} />}
          {step === "plan" && <PlanStep onNext={() => setStep("pack")} />}
          {step === "pack" && (
            <PackStep
              done={done}
              onComplete={() => {
                setDone(true);
                setQuest({ taxesFiled: true });
                addXp(200);
                celebrate();
                setTimeout(() => navigate({ to: "/home" }), 2200);
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ============ INTRO ============ */
function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="px-5 pt-2 pb-4 space-y-5">
      {/* Hero */}
      <div className="h-[200px] rounded-[28px] relative overflow-hidden p-5 border border-lemon/30 shadow-deep card-hero">
        <div className="absolute inset-0 bg-gradient-jungle-glow opacity-80 pointer-events-none" />
        <svg viewBox="0 0 200 140" className="absolute inset-0 w-full h-full opacity-30">
          <rect x="40" y="20" width="120" height="110" rx="6" fill="none" stroke="#F8FFA1" strokeWidth="2.5" />
          <line x1="55" y1="42" x2="145" y2="42" stroke="#F8FFA1" strokeWidth="2" />
          <line x1="55" y1="58" x2="125" y2="58" stroke="#F8FFA1" strokeWidth="2" />
          <line x1="55" y1="74" x2="135" y2="74" stroke="#F8FFA1" strokeWidth="2" />
          <line x1="55" y1="90" x2="115" y2="90" stroke="#F8FFA1" strokeWidth="2" />
          <rect x="55" y="105" width="90" height="20" rx="4" fill="#F8FFA1" />
          <text x="100" y="118" textAnchor="middle" fill="#000" fontSize="9" fontWeight="800">
            FORM 2042
          </text>
        </svg>
        <div className="absolute top-4 left-4">
          <Pill variant="lemon">+200 XP</Pill>
        </div>
        <div className="relative z-10 flex-1 mt-10">
          <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui mb-1">
            Chapter 2
          </p>
          <h2 className="text-white text-[24px] font-display font-bold leading-tight">
            Taxes, decoded.
          </h2>
        </div>
        <div className="absolute -bottom-2 right-2">
          <Cleo pose="thinking" mood="focused" size={92} />
        </div>
      </div>

      <CleoBubble
        side="left"
        pose="guiding"
        tone="dark"
        text={<>French taxes look scary. They're actually <b>predictable</b>.</>}
      />

      {/* Tax year visual */}
      <CCard delay={0.05}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-lemon" />
          <h3 className="text-white text-[15px] font-display font-bold">The tax year</h3>
        </div>
        <div className="relative h-12 mb-2">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/10 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-full bg-gradient-to-r from-lemon/30 to-lemon rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white border-2 border-black" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-gradient-lemon border-2 border-black shadow-lemon" />
          <p className="absolute left-0 -bottom-1 text-white-60 text-[10px] font-ui font-bold">JAN</p>
          <p className="absolute right-0 -bottom-1 text-lemon text-[10px] font-ui font-bold">SPRING</p>
        </div>
        <p className="text-white-60 text-[12px] font-ui mt-3">
          Earn all year. Declare in spring. Miss it = fine. We'll remind you.
        </p>
      </CCard>

      {/* Brackets */}
      <CCard delay={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <Coins size={18} className="text-lemon" />
          <h3 className="text-white text-[15px] font-display font-bold">How much you pay</h3>
        </div>
        <div className="space-y-2.5">
          {[
            { range: "Up to €11,294", rate: 0 },
            { range: "€11,294 – €28,797", rate: 11 },
            { range: "€28,797 – €82,341", rate: 30 },
            { range: "Above €82,341", rate: 45 },
          ].map((b, i) => (
            <div key={b.range} className="flex items-center gap-3">
              <span className="text-white-60 text-[11px] flex-1 font-ui font-semibold">{b.range}</span>
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.rate / 45) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * i }}
                  className="h-full bg-gradient-lemon"
                />
              </div>
              <span className="text-lemon text-[12px] font-display font-extrabold w-9 text-right">
                {b.rate}%
              </span>
            </div>
          ))}
        </div>
      </CCard>

      {/* Other taxes */}
      <CCard delay={0.15}>
        <div className="flex items-center gap-2 mb-3">
          <Receipt size={18} className="text-lemon" />
          <h3 className="text-white text-[15px] font-display font-bold">Other taxes</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "CSG/CRDS", value: "9.7%", note: "On payslip" },
            { label: "Habitation", value: "€0", note: "Mostly gone" },
            { label: "TVA", value: "20%", note: "In price" },
          ].map((t) => (
            <div key={t.label} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
              <p className="text-lemon text-[14px] font-display font-extrabold leading-none">{t.value}</p>
              <p className="text-white text-[10px] font-ui font-bold mt-1">{t.label}</p>
              <p className="text-white-40 text-[9px] font-ui mt-0.5">{t.note}</p>
            </div>
          ))}
        </div>
      </CCard>

      <CButton onClick={onNext}>
        What do I do? <ArrowRight size={18} />
      </CButton>
    </div>
  );
}

/* ============ PLAN ============ */
function PlanStep({ onNext }: { onNext: () => void }) {
  const { onboarding } = useApp();
  return (
    <div className="px-5 pt-2 space-y-5 pb-4">
      <div>
        <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui">
          Your situation
        </p>
        <h2 className="text-white text-[24px] font-display font-bold mt-1 leading-tight">
          What applies to <span className="text-lemon">you</span>
        </h2>
      </div>

      <CCard tone="lemon" delay={0.05}>
        <div className="text-3xl mb-2">{onboarding.fromCountryFlag}</div>
        <p className="text-black text-[15px] font-display font-bold leading-snug">
          {onboarding.fromCountry} national, salaried in France, 4 months in, €2,200/month net.
        </p>
        <div className="mt-3">
          <Pill variant="dark">Tax resident</Pill>
        </div>
      </CCard>

      <CCard delay={0.1}>
        <h3 className="text-white text-[15px] font-display font-bold mb-3">This year's process</h3>
        <div className="space-y-2.5">
          {[
            { Icon: FileSignature, t: "Paper declaration", note: "First year only" },
            { Icon: Download, t: "Form 2042", note: "From impots.gouv.fr" },
            { Icon: MapPin, t: "Mail to tax office", note: "Local centre" },
            { Icon: Calendar, t: "Deadline May 31", note: "Don't be late", urgent: true },
          ].map(({ Icon, t, note, urgent }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-lemon flex items-center justify-center shadow-lemon flex-shrink-0">
                <Icon size={16} className="text-black" strokeWidth={2.6} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-display font-bold">{t}</p>
                <p className={`text-[11px] font-ui ${urgent ? "text-coral-red font-bold" : "text-white-60"}`}>
                  {note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CCard>

      <CCard delay={0.2}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-lemon" />
          <h3 className="text-white-60 text-[11px] font-ui font-bold uppercase tracking-wider">
            Your estimated tax
          </h3>
        </div>
        <p className="text-lemon text-[36px] font-display font-extrabold tracking-tight">
          €500 – €1,400<span className="text-[16px] text-white-60">/yr</span>
        </p>
        <p className="text-white-40 text-[10px] mt-1 font-ui italic">
          Estimate only — depends on deductions.
        </p>
      </CCard>

      <CButton onClick={onNext}>
        Show my action pack <ArrowRight size={18} />
      </CButton>
    </div>
  );
}

/* ============ PACK ============ */
function PackStep({ done, onComplete }: { done: boolean; onComplete: () => void }) {
  const months = ["Mar", "Apr", "May", "Jun"];
  const docs = [
    { Icon: Wallet, t: "Money proofs", d: "Payslips + IBAN" },
    { Icon: FileSignature, t: "Tax number", d: "Numéro fiscal" },
    { Icon: Home, t: "Home income", d: "From Ukraine" },
    { Icon: Download, t: "Form 2042", d: "Filled in" },
  ];
  return (
    <div className="px-5 pt-2 pb-4 space-y-5">
      <div>
        <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui">
          Action pack
        </p>
        <h2 className="text-white text-[24px] font-display font-bold mt-1 leading-tight">
          Your tax to-do
        </h2>
      </div>

      <CCard delay={0.05}>
        <h3 className="text-lemon text-[11px] font-display font-extrabold mb-4 uppercase tracking-[1.5px]">
          Timeline
        </h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-2 right-2 top-2 h-0.5 bg-white/10" />
          {months.map((m, i) => (
            <div key={m} className="flex flex-col items-center flex-1 relative z-10">
              <div
                className={`h-4 w-4 rounded-full ${
                  i === 2 ? "bg-lemon shadow-lemon" : i < 2 ? "bg-lemon/50" : "bg-white/20"
                }`}
                style={i === 2 ? { animation: "pulse-ring 2s infinite" } : undefined}
              />
              <p
                className={`mt-2 text-[12px] font-display font-bold ${
                  i === 2 ? "text-lemon" : "text-white-60"
                }`}
              >
                {m}
              </p>
              {i === 2 && (
                <p className="text-[10px] text-coral-red font-ui font-bold uppercase">Deadline</p>
              )}
            </div>
          ))}
        </div>
      </CCard>

      <CCard delay={0.1}>
        <h3 className="text-white text-[15px] font-display font-bold mb-3">Gather these</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {docs.map(({ Icon, t, d }) => (
            <div
              key={t}
              className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5"
            >
              <div className="h-9 w-9 rounded-xl bg-lemon/15 border border-lemon/30 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-lemon" strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-[12px] font-display font-bold leading-tight">{t}</p>
                <p className="text-white-40 text-[10px] font-ui">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </CCard>

      <div className="grid grid-cols-2 gap-3">
        <CButton variant="secondary" size="md">
          <Download size={16} /> Form 2042
        </CButton>
        <CButton variant="secondary" size="md">
          <MapPin size={16} /> Tax office
        </CButton>
      </div>

      <CleoBubble
        side="left"
        pose="celebrating"
        tone="tip"
        text={
          done ? (
            <>You did it! +200 XP coming your way.</>
          ) : (
            <>Tap below when sent — I'll add <b>200 XP</b> to your level.</>
          )
        }
      />

      <CButton onClick={onComplete} disabled={done}>
        {done ? (
          <>
            <Check size={18} /> Quest complete
          </>
        ) : (
          <>
            I've filed my taxes <Check size={18} />
          </>
        )}
      </CButton>
    </div>
  );
}
