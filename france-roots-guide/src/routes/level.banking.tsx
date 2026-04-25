import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Building2,
  Smartphone,
  Clock,
  Euro,
  ChevronRight,
  X,
  ArrowRight,
  Check,
  IdCard,
  Home,
  FileText,
  Bell,
  Sparkles,
  Star,
} from "lucide-react";
import { TopBar } from "@/components/concierge/TopBar";
import { CCard, Pill, ProgressBar } from "@/components/concierge/CCard";
import { CButton } from "@/components/concierge/CButton";
import { Cleo, CleoBubble } from "@/components/concierge/Cleo";
import { BankLogo } from "@/components/concierge/BankLogo";
import { useApp } from "@/lib/store";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/level/banking")({
  component: BankingLevel,
});

type Step = "intro" | "recommend" | "apply" | "track" | "success";
const TOTAL = 4;
const STEP_INDEX: Record<Step, number> = { intro: 1, recommend: 2, apply: 3, track: 4, success: 4 };

function BankingLevel() {
  const [step, setStep] = useState<Step>("intro");
  const [compareOpen, setCompareOpen] = useState(false);
  const [comparing, setComparing] = useState<string[]>([]);
  const { quest, setQuest, addXp } = useApp();
  const navigate = useNavigate();

  const goTo = (s: Step) => setStep(s);

  return (
    <div className="mobile-shell pb-32 bg-black min-h-screen">
      {step !== "success" && (
        <TopBar
          title={<span className="font-display font-bold text-white">Banking · Level 1</span>}
          step={{ current: STEP_INDEX[step], total: TOTAL }}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {step === "intro" && <IntroStep onNext={() => goTo("recommend")} />}
          {step === "recommend" && (
            <RecommendStep
              comparing={comparing}
              onCompareToggle={(b) =>
                setComparing((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b].slice(-2)))
              }
              onCompare={() => setCompareOpen(true)}
              onChoose={(bank) => {
                setQuest({ bankSelected: bank });
                goTo("apply");
              }}
            />
          )}
          {step === "apply" && (
            <ApplyStep
              bank={quest.bankSelected ?? "Revolut"}
              onSubmitted={() => {
                setQuest({ bankApplied: true });
                goTo("track");
              }}
            />
          )}
          {step === "track" && (
            <TrackStep
              bank={quest.bankSelected ?? "Revolut"}
              onAccountReady={() => {
                setQuest({ bankActive: true });
                addXp(150);
                goTo("success");
              }}
            />
          )}
          {step === "success" && (
            <SuccessStep
              bank={quest.bankSelected ?? "Revolut"}
              onContinue={() => navigate({ to: "/home" })}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {compareOpen && (
          <CompareModal
            banks={comparing}
            onClose={() => setCompareOpen(false)}
            onChoose={(bank) => {
              setQuest({ bankSelected: bank });
              setCompareOpen(false);
              goTo("apply");
            }}
          />
        )}
      </AnimatePresence>

      {step === "recommend" && comparing.length >= 2 && !compareOpen && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass-dark border-t border-lemon/30 px-5 py-4 z-40"
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex -space-x-2">
              {comparing.map((b) => (
                <div key={b} className="ring-2 ring-black rounded-[14px]">
                  <BankLogo bank={b} size={36} />
                </div>
              ))}
            </div>
            <CButton fullWidth={false} className="px-5" onClick={() => setCompareOpen(true)}>
              Compare {comparing.length} <ArrowRight size={16} />
            </CButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ───────── INTRO — visual, low-text ───────── */
function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="px-5 pt-2 pb-6 space-y-5">
      {/* Hero */}
      <div className="h-[200px] rounded-[28px] relative overflow-hidden p-5 border border-lemon/30 shadow-deep card-hero">
        <div className="absolute inset-0 bg-gradient-jungle-glow opacity-80 pointer-events-none" />
        <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full opacity-25">
          <rect x="40" y="40" width="120" height="70" fill="none" stroke="#F8FFA1" strokeWidth="2" />
          <polygon points="30,40 100,15 170,40" fill="none" stroke="#F8FFA1" strokeWidth="2" />
          {[55, 78, 108, 131].map((x) => (
            <rect key={x} x={x} y="55" width="14" height="22" fill="none" stroke="#F8FFA1" strokeWidth="1.5" />
          ))}
        </svg>
        <div className="absolute top-4 left-4">
          <Pill variant="lemon">+150 XP</Pill>
        </div>
        <div className="relative z-10 flex-1 mt-10">
          <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui mb-1">Chapter 1</p>
          <h2 className="text-white text-[24px] font-display font-bold leading-tight">Banking, decoded.</h2>
        </div>
        <div className="absolute -bottom-2 right-2">
          <Cleo pose="guiding" mood="happy" size={92} />
        </div>
      </div>

      <CleoBubble
        side="left"
        pose="guiding"
        tone="dark"
        text={<>French banks come in <b>two flavors</b>. Pick fast, pick smart 👇</>}
      />

      {/* Two flavors — split visual */}
      <CCard delay={0.05}>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-lemon flex items-center justify-center shadow-lemon mb-2">
              <Smartphone size={22} className="text-black" strokeWidth={2.4} />
            </div>
            <p className="text-white text-[13px] font-display font-bold">Neobanks</p>
            <p className="text-lemon text-[18px] font-display font-extrabold mt-1">10 min</p>
            <p className="text-white-60 text-[11px] font-ui mt-1">Revolut, N26</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-navy border border-white/15 flex items-center justify-center mb-2">
              <Building2 size={22} className="text-white" strokeWidth={2.4} />
            </div>
            <p className="text-white text-[13px] font-display font-bold">Traditional</p>
            <p className="text-white text-[18px] font-display font-extrabold mt-1">10 days</p>
            <p className="text-white-60 text-[11px] font-ui mt-1">SocGen, BNP</p>
          </div>
        </div>
      </CCard>

      {/* Paperwork — lemon card */}
      <CCard delay={0.1} tone="lemon">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-black" strokeWidth={2.6} />
          <h3 className="text-black text-[15px] font-display font-extrabold">What you'll need</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: IdCard, label: "Passport" },
            { Icon: Home, label: "Address" },
            { Icon: Euro, label: "Income" },
          ].map(({ Icon, label }) => (
            <div key={label} className="bg-black/10 rounded-xl py-3 px-2 text-center border border-black/15">
              <Icon size={18} className="text-black mx-auto" strokeWidth={2.4} />
              <p className="text-black text-[11px] font-ui font-bold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </CCard>

      {/* Cost contrast */}
      <CCard delay={0.15}>
        <div className="flex items-center gap-2 mb-3">
          <Euro size={18} className="text-lemon" />
          <h3 className="text-white text-[15px] font-display font-bold">Monthly cost</h3>
        </div>
        <div className="flex items-end justify-around">
          <div className="text-center">
            <p className="text-lemon text-[28px] font-display font-extrabold">€0</p>
            <p className="text-white-60 text-[11px] font-ui">Neobank</p>
          </div>
          <div className="text-white-30 text-[20px] font-display">vs</div>
          <div className="text-center">
            <p className="text-white text-[28px] font-display font-extrabold">€8</p>
            <p className="text-white-60 text-[11px] font-ui">Traditional</p>
          </div>
        </div>
      </CCard>

      <CButton onClick={onNext}>
        Show me my matches <ArrowRight size={18} />
      </CButton>
    </div>
  );
}

/* ───────── RECOMMEND ───────── */

interface BankRow {
  name: string;
  type: "Neobank" | "Traditional";
  rating: number;
  reviews: string;
  clients: string;
  opening: string;
  fee: string;
  highlights: string[];
  best?: boolean;
  appRating: string;
  intl: string;
  bestFeature: string;
}

const BANKS: BankRow[] = [
  {
    name: "Revolut",
    type: "Neobank",
    rating: 4.6,
    reviews: "128K reviews",
    clients: "14M",
    opening: "10 min",
    fee: "€0",
    highlights: ["No fee", "English app", "Instant card"],
    best: true,
    appRating: "4.7",
    intl: "Free",
    bestFeature: "Multi-currency wallet",
  },
  {
    name: "N26",
    type: "Neobank",
    rating: 4.4,
    reviews: "82K reviews",
    clients: "8M",
    opening: "8 min",
    fee: "€0",
    highlights: ["German backed", "English app", "Sub-accounts"],
    appRating: "4.5",
    intl: "€0–1",
    bestFeature: "Spaces savings buckets",
  },
  {
    name: "Société Générale",
    type: "Traditional",
    rating: 3.9,
    reviews: "21K reviews",
    clients: "26M",
    opening: "10 days",
    fee: "€8.50",
    highlights: ["Branches", "Mortgage ready", "Advisor"],
    appRating: "4.1",
    intl: "€15+",
    bestFeature: "Local branch advisor",
  },
];

function RecommendStep({
  comparing,
  onCompareToggle,
  onCompare,
  onChoose,
}: {
  comparing: string[];
  onCompareToggle: (b: string) => void;
  onCompare: () => void;
  onChoose: (b: string) => void;
}) {
  return (
    <div className="px-5 pt-1 pb-4 space-y-4">
      <div>
        <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui">Your matches</p>
        <h2 className="text-white text-[24px] font-display font-bold leading-tight mt-1">Top 3 banks for you</h2>
        <p className="text-white-60 text-[13px] mt-1 font-ui">
          Tuned for: salaried, just arrived, needs speed.
        </p>
      </div>

      <div className="space-y-3">
        {BANKS.map((b, i) => (
          <BankCard
            key={b.name}
            bank={b}
            delay={i * 0.08}
            comparing={comparing.includes(b.name)}
            onToggleCompare={() => onCompareToggle(b.name)}
            onChoose={() => onChoose(b.name)}
          />
        ))}
      </div>

      {comparing.length >= 2 && (
        <CButton variant="secondary" onClick={onCompare}>
          Open comparison ({comparing.length})
        </CButton>
      )}
    </div>
  );
}

function BankCard({
  bank,
  delay,
  comparing,
  onToggleCompare,
  onChoose,
}: {
  bank: BankRow;
  delay: number;
  comparing: boolean;
  onToggleCompare: () => void;
  onChoose: () => void;
}) {
  return (
    <CCard delay={delay} className="relative !p-4">
      {bank.best && (
        <div className="absolute -top-px right-4 bg-gradient-lemon text-black px-3 py-1 text-[10px] font-display font-extrabold rounded-b-xl uppercase tracking-wider shadow-lemon flex items-center gap-1">
          <Sparkles size={10} strokeWidth={3} /> Best match
        </div>
      )}
      <div className="flex items-center gap-3">
        <BankLogo bank={bank.name} size={52} />
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-[17px] font-display font-bold">{bank.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white-60 text-[10px] bg-white/8 px-2 py-0.5 rounded-full font-ui font-bold">
              {bank.type}
            </span>
            <span className="text-lemon text-[12px] font-ui font-bold flex items-center gap-1">
              <Star size={11} fill="#F8FFA1" strokeWidth={0} /> {bank.rating}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric label="Open" value={bank.opening} />
        <Metric label="Fee" value={bank.fee} />
        <Metric label="App" value={bank.appRating} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {bank.highlights.map((h) => (
          <span
            key={h}
            className="text-[10px] text-lemon bg-lemon/10 border border-lemon/30 rounded-full px-2 py-0.5 font-ui font-semibold"
          >
            {h}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
        <CButton variant="secondary" size="md" fullWidth={false} className="px-4" onClick={onToggleCompare}>
          {comparing ? <Check size={16} /> : "Compare"}
        </CButton>
        <CButton size="md" onClick={onChoose}>
          Choose <ChevronRight size={16} />
        </CButton>
      </div>
    </CCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-lemon/8 border border-lemon/20 rounded-xl py-2 px-2 text-center">
      <p className="text-lemon text-[14px] font-display font-extrabold leading-none">{value}</p>
      <p className="text-white-40 text-[10px] mt-1 font-ui font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

/* ───────── COMPARE MODAL ───────── */

function CompareModal({
  banks,
  onClose,
  onChoose,
}: {
  banks: string[];
  onClose: () => void;
  onChoose: (b: string) => void;
}) {
  const items = BANKS.filter((b) => banks.includes(b.name));
  const [chosen, setChosen] = useState<string>(items[0]?.name ?? "");

  const rows: { label: string; key: keyof BankRow }[] = [
    { label: "Rating", key: "rating" },
    { label: "Clients", key: "clients" },
    { label: "Fee/mo", key: "fee" },
    { label: "Open in", key: "opening" },
    { label: "Intl", key: "intl" },
    { label: "Best for", key: "bestFeature" },
  ];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
      className="fixed inset-0 z-50 bg-black flex flex-col mobile-shell"
    >
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/8"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <h3 className="text-white text-[18px] font-display font-bold">Compare</h3>
        <button onClick={onClose} className="text-white-60 active:scale-95">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {items.map((b) => (
            <button
              key={b.name}
              onClick={() => setChosen(b.name)}
              className={`card-navy p-4 flex flex-col items-center gap-2 transition active:scale-95 ${
                chosen === b.name ? "ring-2 ring-lemon shadow-lemon" : ""
              }`}
            >
              <BankLogo bank={b.name} size={48} />
              <p className="text-white text-[13px] font-display font-bold">{b.name}</p>
            </button>
          ))}
        </div>

        <CCard className="!p-0 overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.key}
              className={`grid grid-cols-3 px-4 py-3 ${
                i !== rows.length - 1 ? "border-b border-white/8" : ""
              }`}
            >
              <div className="text-white-40 text-[11px] font-ui font-bold uppercase tracking-wider">
                {row.label}
              </div>
              {items.map((b) => (
                <div
                  key={b.name}
                  className={`text-[13px] font-ui font-semibold text-center ${
                    chosen === b.name ? "text-lemon" : "text-white"
                  }`}
                >
                  {String(b[row.key])}
                </div>
              ))}
            </div>
          ))}
        </CCard>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-6 pt-3 bg-black border-t border-white/8"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <CButton onClick={() => onChoose(chosen)} disabled={!chosen}>
          Choose {chosen} <ArrowRight size={18} />
        </CButton>
      </div>
    </motion.div>
  );
}

/* ───────── APPLY ───────── */

function ApplyStep({ bank, onSubmitted }: { bank: string; onSubmitted: () => void }) {
  const steps = [
    { t: "Download the app", d: `Search '${bank}' in App Store or Google Play.` },
    { t: "Create your account", d: "Email + a strong password. This is your money." },
    { t: "Verify your identity", d: "Snap your passport + a quick selfie. AI checks it." },
    { t: "Confirm address", d: "Upload your lease or a utility bill." },
    { t: "Activate your card", d: "Virtual card, instant. Physical, 5–7 days." },
  ];

  return (
    <div className="px-5 pt-1 pb-4 space-y-5">
      <div>
        <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui">Step 3 of 4</p>
        <h2 className="text-white text-[24px] font-display font-bold leading-tight mt-1">
          Open your <span className="text-lemon">{bank}</span> account
        </h2>
        <p className="text-white-60 text-[13px] mt-1 font-ui">5 quick steps. ~10 minutes total.</p>
      </div>

      <div className="relative pl-1">
        <div className="absolute left-[14px] top-4 bottom-4 w-px bg-lemon/25" />
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 mb-3 relative"
          >
            <div className="h-7 w-7 rounded-full bg-gradient-lemon text-black text-[12px] font-display font-extrabold flex items-center justify-center z-10 border-2 border-black shadow-lemon">
              {i + 1}
            </div>
            <div className="flex-1 card-navy p-4 !rounded-2xl">
              <p className="text-white text-[14px] font-display font-bold">{s.t}</p>
              <p className="text-white-60 text-[12px] mt-1 font-ui">{s.d}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <CCard tone="lemon" delay={0.4}>
        <div className="flex items-center gap-3">
          <Cleo pose="guiding" size={48} />
          <p className="text-black text-[14px] font-ui font-bold flex-1">
            Open the app — I'll be here when you're back.
          </p>
        </div>
      </CCard>

      <CButton onClick={onSubmitted}>
        I'm done — track my application <ArrowRight size={18} />
      </CButton>
    </div>
  );
}

/* ───────── TRACK ───────── */

function TrackStep({ bank, onAccountReady }: { bank: string; onAccountReady: () => void }) {
  const [phase, setPhase] = useState(1);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 2200);
    const t2 = setTimeout(() => setPhase(3), 4400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const stages = ["Submitted", "Reviewing", "Approved", "Ready"];

  return (
    <div className="px-5 pt-1 pb-4 space-y-5">
      <div>
        <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui">Step 4 of 4</p>
        <h2 className="text-white text-[24px] font-display font-bold leading-tight mt-1">
          Application submitted
        </h2>
        <p className="text-white-60 text-[13px] mt-1 font-ui">Here's where things stand:</p>
      </div>

      <CCard delay={0.05}>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-3 right-3 top-3 h-0.5 bg-white/10" />
          {stages.map((s, i) => {
            const done = i < phase;
            const current = i === phase;
            return (
              <div key={s} className="flex-1 flex flex-col items-center relative z-10">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    done
                      ? "bg-gradient-lemon border-black text-black shadow-lemon"
                      : current
                        ? "bg-lemon/20 border-lemon text-lemon"
                        : "border-white/20 bg-navy text-white-30"
                  }`}
                  style={current ? { animation: "pulse-ring 2s infinite" } : undefined}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : ""}
                </div>
                <p
                  className={`mt-2 text-[10px] font-display font-bold text-center ${
                    done || current ? "text-white" : "text-white-40"
                  }`}
                >
                  {s}
                </p>
              </div>
            );
          })}
        </div>
      </CCard>

      <CCard delay={0.1}>
        <div className="mb-2">
          <Pill variant={phase >= 3 ? "lemon" : "ghost"}>
            {phase >= 3 ? "Approved" : "Under review"}
          </Pill>
        </div>
        <p className="text-white text-[14px] font-ui leading-relaxed">
          {phase >= 3
            ? `Your ${bank} account is being activated.`
            : `Documents are being checked. Usually 1–3 business days.`}
        </p>
      </CCard>

      <CCard delay={0.15} className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-lemon flex items-center justify-center shadow-lemon flex-shrink-0">
          <Bell size={18} className="text-black" strokeWidth={2.6} />
        </div>
        <div className="flex-1">
          <p className="text-white text-[13px] font-display font-bold">Push when it's ready</p>
          <p className="text-white-60 text-[11px] font-ui">We'll ping you the second your card lands.</p>
        </div>
      </CCard>

      <CButton onClick={onAccountReady}>
        I got my card <Check size={18} />
      </CButton>
    </div>
  );
}

/* ───────── SUCCESS ───────── */

function SuccessStep({ bank, onContinue }: { bank: string; onContinue: () => void }) {
  useEffect(() => {
    celebrate();
    const t = setTimeout(onContinue, 3500);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center bg-black">
      <Cleo pose="celebrating" size={120} />
      <h1 className="mt-6 text-white text-[28px] font-display font-extrabold">Account opened</h1>
      <p className="mt-2 text-white-60 text-[14px] font-ui">{bank} is ready to roll.</p>

      <CCard tone="lemon" className="mt-6 w-full text-center !p-6">
        <p className="text-black text-[16px] font-display font-bold">Quest complete</p>
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-black text-[40px] font-display font-extrabold mt-1"
        >
          +150 XP
        </motion.p>
        <div className="mt-4">
          <ProgressBar value={4} max={4} />
          <p className="text-black/70 text-[12px] mt-2 font-ui font-bold">Level 1 — 100% complete</p>
        </div>
      </CCard>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 bg-lilac/15 border border-lilac/40 rounded-xl px-3 py-2 text-lilac text-[13px] font-display font-bold"
      >
        Level 2 — Taxes unlocked
      </motion.div>

      <div className="mt-8 w-full">
        <CButton onClick={onContinue}>
          Back to your quest map <ArrowRight size={18} />
        </CButton>
      </div>
    </div>
  );
}
