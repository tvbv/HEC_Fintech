import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Sparkles,
  Home as HomeIcon,
  Train,
  ShoppingBag,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { TopBar } from "@/components/concierge/TopBar";
import { CCard, Pill, ProgressBar } from "@/components/concierge/CCard";
import { CButton } from "@/components/concierge/CButton";
import { Cleo, CleoBubble } from "@/components/concierge/Cleo";
import { useApp } from "@/lib/store";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/level/benefits")({
  component: BenefitsLevel,
});

interface Benefit {
  id: string;
  Icon: LucideIcon;
  name: string;
  value: string;
  monthly: string;
  eligible: boolean;
  desc: string;
  why: string;
  steps: { t: string; d: string }[];
  applyOn: string;
}

const BENEFITS: Benefit[] = [
  {
    id: "caf",
    Icon: HomeIcon,
    name: "CAF Housing aid",
    value: "~€200/mo",
    monthly: "€200",
    eligible: true,
    desc: "Monthly housing aid from the state. 4 months in = up to €800 may already be unclaimed.",
    why: "Salaried resident with a long-term lease, income under the Paris CAF threshold.",
    steps: [
      { t: "Create a CAF account", d: "Sign up on caf.fr with your numéro de sécu." },
      { t: "Submit your lease", d: "Upload your signed bail (rental contract)." },
      { t: "Add your IBAN", d: "Where CAF will deposit the monthly aid." },
      { t: "Wait for review", d: "2–4 weeks. Then payments start monthly." },
    ],
    applyOn: "caf.fr",
  },
  {
    id: "navigo",
    Icon: Train,
    name: "Navigo Solidarity",
    value: "Up to 50% off",
    monthly: "€42 saved",
    eligible: false,
    desc: "Half-price Paris transport pass for lower incomes.",
    why: "Available based on your CAF income calculation.",
    steps: [
      { t: "Get your CAF attestation", d: "Income proof from CAF." },
      { t: "Apply at navigo.fr", d: "Upload attestation + ID." },
      { t: "Get your discount card", d: "Arrives by mail in 7–10 days." },
    ],
    applyOn: "navigo.fr",
  },
  {
    id: "prime",
    Icon: ShoppingBag,
    name: "Prime d'Activité",
    value: "~€150/mo",
    monthly: "€150",
    eligible: true,
    desc: "Monthly bonus from CAF if you work and earn under €1,800 net.",
    why: "Your €2,200/mo is just over the line — partial eligibility may apply.",
    steps: [
      { t: "Log into CAF", d: "Use the same CAF account you created." },
      { t: "Open the simulator", d: "Confirm exact eligibility." },
      { t: "Submit declaration", d: "Done quarterly — paid monthly." },
    ],
    applyOn: "caf.fr",
  },
  {
    id: "css",
    Icon: HeartPulse,
    name: "Health top-up",
    value: "Free",
    monthly: "€60 saved",
    eligible: false,
    desc: "Free health insurance top-up for lower incomes.",
    why: "Eligibility based on annual income — let's check together.",
    steps: [
      { t: "Get your numéro de sécu", d: "From your employer or CPAM." },
      { t: "Apply on ameli.fr", d: "Upload income proof." },
    ],
    applyOn: "ameli.fr",
  },
];

function BenefitsLevel() {
  const [open, setOpen] = useState<Benefit | null>(null);
  const [success, setSuccess] = useState(false);
  const { setQuest, addXp } = useApp();
  const navigate = useNavigate();

  const handleApply = () => {
    setOpen(null);
    setQuest({ benefitsClaimed: true });
    addXp(200);
    celebrate();
    setSuccess(true);
  };

  return (
    <div className="mobile-shell pb-32 bg-black min-h-screen">
      <TopBar
        title={<span className="font-display font-bold text-white">Benefits · Level 3</span>}
      />
      <div className="px-5 pt-2 pb-4 space-y-5">
        {/* Hero */}
        <div className="h-[200px] rounded-[28px] relative overflow-hidden p-5 border border-lemon/30 shadow-deep card-hero">
          <div className="absolute inset-0 bg-gradient-jungle-glow opacity-80 pointer-events-none" />
          <svg viewBox="0 0 200 130" className="absolute inset-0 w-full h-full opacity-50">
            {[
              { x: 30, y: 20, d: 0 },
              { x: 80, y: 8, d: 0.3 },
              { x: 140, y: 25, d: 0.6 },
              { x: 50, y: 70, d: 0.9 },
              { x: 110, y: 75, d: 1.2 },
              { x: 160, y: 65, d: 1.5 },
            ].map((g, i) => (
              <motion.g
                key={i}
                animate={{ y: [0, 8, 0], rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, delay: g.d }}
                style={{ transformOrigin: `${g.x + 12}px ${g.y + 12}px` }}
              >
                <circle cx={g.x + 12} cy={g.y + 12} r="11" fill="#F8FFA1" stroke="#000" strokeWidth="1.5" />
                <text
                  x={g.x + 12}
                  y={g.y + 16}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="900"
                  fill="#000"
                >
                  €
                </text>
              </motion.g>
            ))}
          </svg>
          <div className="absolute top-4 left-4">
            <Pill variant="lemon">+200 XP</Pill>
          </div>
          <div className="relative z-10 flex-1 mt-10">
            <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui mb-1">
              Chapter 3
            </p>
            <h2 className="text-white text-[24px] font-display font-bold leading-tight">
              Free money.
            </h2>
          </div>
          <div className="absolute -bottom-2 right-2">
            <Cleo pose="celebrating" mood="wow" size={92} />
          </div>
        </div>

        <CleoBubble
          side="left"
          pose="guiding"
          tone="dark"
          text={<>Most newcomers miss <b>at least one</b> of these. Not on my watch.</>}
        />

        {/* Big number callout */}
        <CCard tone="lemon" delay={0.05} className="text-center !p-6">
          <p className="text-black/70 text-[10px] uppercase tracking-[2px] font-ui font-bold flex items-center justify-center gap-1">
            <Sparkles size={11} /> You may be entitled to
          </p>
          <p className="text-black text-[40px] font-display font-extrabold mt-1 tracking-tight">
            ~€2,100<span className="text-[20px]">/yr</span>
          </p>
          <p className="text-black/70 text-[12px] font-ui font-semibold">
            Across 3 benefits matched to your profile
          </p>
        </CCard>

        <div className="space-y-3">
          {BENEFITS.map((b, i) => (
            <BenefitCard key={b.id} b={b} delay={i * 0.06} onOpen={() => setOpen(b)} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && <BenefitDetail b={open} onClose={() => setOpen(null)} onApply={handleApply} />}
      </AnimatePresence>

      <AnimatePresence>
        {success && <SuccessOverlay onContinue={() => navigate({ to: "/home" })} />}
      </AnimatePresence>
    </div>
  );
}

function BenefitCard({
  b,
  delay,
  onOpen,
}: {
  b: Benefit;
  delay: number;
  onOpen: () => void;
}) {
  const Icon = b.Icon;
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left card-navy p-4 border-l-4 ${
        b.eligible ? "!border-l-lemon" : "!border-l-white/15"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            b.eligible
              ? "bg-gradient-lemon shadow-lemon"
              : "bg-white/8 border border-white/15"
          }`}
        >
          <Icon
            size={22}
            className={b.eligible ? "text-black" : "text-white-60"}
            strokeWidth={2.4}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] font-display font-bold">{b.name}</p>
          <p className="text-lemon text-[20px] font-display font-extrabold mt-0.5">{b.value}</p>
          <p className="text-white-60 text-[11px] mt-1 leading-snug font-ui">{b.desc}</p>
        </div>
        <Pill variant={b.eligible ? "lemon" : "ghost"}>
          {b.eligible ? "Eligible" : "Check"}
        </Pill>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-white-60 text-[11px] font-ui font-semibold">Not applied yet</span>
        <span className="text-lemon text-[12px] font-display font-bold flex items-center gap-1">
          Start <ArrowRight size={13} />
        </span>
      </div>
    </motion.button>
  );
}

function BenefitDetail({
  b,
  onClose,
  onApply,
}: {
  b: Benefit;
  onClose: () => void;
  onApply: () => void;
}) {
  const Icon = b.Icon;
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-black mobile-shell overflow-y-auto pb-28"
    >
      <TopBar
        title={<span className="font-display font-bold text-white truncate">{b.name}</span>}
        onBack={onClose}
      />
      <div className="px-5 pt-2 pb-4 space-y-5">
        <CCard tone="lemon" className="!p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-deep">
              <Icon size={22} className="text-lemon" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-black/70 text-[10px] uppercase tracking-[2px] font-ui font-bold">
                Estimated value
              </p>
              <p className="text-black text-[28px] font-display font-extrabold tracking-tight leading-none mt-1">
                {b.value}
              </p>
            </div>
          </div>
          <p className="text-black/80 text-[13px] font-ui font-semibold mt-2">
            Eligible based on your profile
          </p>
        </CCard>

        <CCard className="border-l-4 !border-l-lemon">
          <h3 className="text-white text-[15px] font-display font-bold mb-2">Why this fits you</h3>
          <p className="text-white text-[13px] font-ui font-medium leading-relaxed">{b.why}</p>
        </CCard>

        <div>
          <h3 className="text-white text-[15px] font-display font-bold mb-3">How to apply</h3>
          <div className="relative pl-1">
            <div className="absolute left-[14px] top-3 bottom-3 w-px bg-lemon/30" />
            {b.steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 mb-3 relative"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-lemon text-black text-[12px] font-display font-extrabold flex items-center justify-center z-10 border-2 border-black shadow-lemon">
                  {i + 1}
                </div>
                <div className="flex-1 card-navy p-3.5 !rounded-2xl">
                  <p className="text-white text-[13px] font-display font-bold">{s.t}</p>
                  <p className="text-white-60 text-[11px] mt-1 font-ui">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <CCard>
          <h3 className="text-white text-[14px] font-display font-bold mb-3">What you'll need</h3>
          <div className="grid grid-cols-3 gap-2">
            {["Address", "IBAN", "Passport"].map((d) => (
              <div
                key={d}
                className="bg-lemon/10 border border-lemon/25 rounded-xl py-2 text-center"
              >
                <Check size={14} className="text-lemon mx-auto" strokeWidth={3} />
                <p className="text-white text-[11px] font-ui font-bold mt-1">{d}</p>
              </div>
            ))}
          </div>
        </CCard>

        <CButton onClick={onApply}>
          Start application <ArrowRight size={16} />
        </CButton>
      </div>
    </motion.div>
  );
}

function SuccessOverlay({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const t = setTimeout(onContinue, 3500);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center px-6 text-center"
    >
      <Cleo pose="celebrating" size={120} />
      <h1 className="mt-6 text-white text-[28px] font-display font-extrabold">All set</h1>
      <p className="mt-2 text-white-60 text-[14px] font-ui">Your application is on its way.</p>

      <CCard tone="lemon" className="mt-6 w-full text-center !p-6">
        <p className="text-black text-[16px] font-display font-bold">All 3 levels complete</p>
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-black text-[40px] font-display font-extrabold mt-1"
        >
          +200 XP
        </motion.p>
        <div className="mt-4">
          <ProgressBar value={3} max={3} />
          <p className="text-black/70 text-[12px] mt-2 font-ui font-bold">Chapter 1 — done</p>
        </div>
      </CCard>

      <div className="mt-8 w-full">
        <CButton onClick={onContinue}>
          Back to your quest map <ArrowRight size={18} />
        </CButton>
      </div>
    </motion.div>
  );
}
