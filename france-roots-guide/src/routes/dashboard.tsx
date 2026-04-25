import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, TrendingUp, Sparkles, CalendarClock, Compass } from "lucide-react";
import { CCard, Pill, ProgressBar } from "@/components/concierge/CCard";
import { BottomNav } from "@/components/concierge/BottomNav";
import { Cleo } from "@/components/concierge/Cleo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { quest, questsDone, onboarding } = useApp();
  const hasBank = quest.bankActive;
  const total = hasBank ? "4,280" : "1,800";

  return (
    <div className="mobile-shell pb-32 bg-black min-h-screen relative">
      <div className="absolute inset-0 pointer-events-none bg-gradient-jungle-glow opacity-70" />

      {/* Header */}
      <header
        className="px-5 pt-4 pb-3 relative z-10 flex items-center justify-between"
        style={{ paddingTop: "max(18px, env(safe-area-inset-top))" }}
      >
        <div>
          <p className="text-white-40 text-[10px] font-bold uppercase tracking-[2px] font-ui">
            Today · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </p>
          <h1 className="text-white text-[24px] font-display font-bold leading-tight">
            Your money picture 📊
          </h1>
        </div>
        <Cleo pose="guiding" size={48} />
      </header>

      <div className="px-5 space-y-4 relative z-10">
        {/* Hero balance */}
        <CCard tone="hero" delay={0.05} className="!p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-lemon/20 blur-3xl" />
          <div className="flex items-center justify-between relative">
            <p className="text-white-60 text-[10px] uppercase tracking-[2px] font-ui font-bold">
              Total across accounts
            </p>
            <Pill variant="lemon">EUR / UAH</Pill>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-[44px] font-display font-extrabold mt-1 tracking-tight"
          >
            €{total}
          </motion.p>
          <div className="mt-3 flex flex-wrap gap-2">
            {hasBank && (
              <span className="bg-lemon/15 border border-lemon/30 text-lemon text-[12px] rounded-full px-3 py-1.5 font-ui font-bold">
                🇫🇷 N26 €2,480
              </span>
            )}
            <span className="bg-white/10 border border-white/15 text-white text-[12px] rounded-full px-3 py-1.5 font-ui font-bold">
              {onboarding.fromCountryFlag} Monobank €1,800
            </span>
          </div>
          <p className="text-white-40 text-[11px] mt-3 font-ui">Last synced: just now</p>
        </CCard>

        {/* Income / expenses */}
        <CCard delay={0.1}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-lemon" />
            <p className="text-white-60 text-[10px] uppercase tracking-[2px] font-ui font-bold">
              This month
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white-60 text-[12px] font-ui">💰 Income</p>
              <p className="text-lemon text-[22px] font-display font-extrabold">€2,200</p>
            </div>
            <div>
              <p className="text-white-60 text-[12px] font-ui">💸 Expenses</p>
              <p className="text-coral-red text-[22px] font-display font-extrabold">€1,620</p>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full overflow-hidden flex bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "58%" }}
              transition={{ duration: 0.8 }}
              className="h-full bg-lemon"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "42%" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="h-full bg-coral-red"
            />
          </div>
        </CCard>

        {/* Unclaimed benefits */}
        <CCard delay={0.15}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-lemon" />
              <h3 className="text-white text-[15px] font-display font-bold">Unclaimed benefits</h3>
            </div>
            <Pill variant="lemon">€1,200/yr</Pill>
          </div>
          <div className="space-y-2">
            {[
              { n: "CAF — Housing", v: "€200/mo", emoji: "🏠" },
              { n: "Prime d'Activité", v: "€150/mo", emoji: "🛒" },
            ].map((b) => (
              <Link
                key={b.n}
                to="/level/benefits"
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-xl px-3 py-2.5 border border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{b.emoji}</span>
                  <div>
                    <p className="text-white text-[13px] font-display font-bold">{b.n}</p>
                    <p className="text-white-60 text-[11px] font-ui">{b.v}</p>
                  </div>
                </div>
                <span className="text-lemon text-[12px] font-bold flex items-center gap-1">
                  Claim <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </CCard>

        {/* Deadlines */}
        <CCard delay={0.2}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={16} className="text-lemon" />
            <h3 className="text-white text-[15px] font-display font-bold">Upcoming deadlines</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { c: "bg-coral-red", n: "Tax declaration", d: "May 31 · 36 days" },
              { c: "bg-warn-yellow", n: "CAF renewal", d: "Jun 15 · 51 days" },
              { c: "bg-lemon", n: "Carte de séjour", d: "Aug 12 · 109 days" },
            ].map((d) => (
              <div key={d.n} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${d.c} shadow-lemon`} />
                <p className="text-white text-[13px] flex-1 font-ui font-semibold">{d.n}</p>
                <p className="text-white-60 text-[11px] font-ui">{d.d}</p>
              </div>
            ))}
          </div>
        </CCard>

        {/* Cleo suggests */}
        <CCard delay={0.25} className="border-l-4 !border-l-lemon">
          <div className="flex items-start gap-3">
            <Cleo pose="guiding" size={48} animated={false} />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={12} className="text-lemon" />
                <p className="text-lemon text-[10px] uppercase tracking-[2px] font-ui font-bold">
                  Cleo suggests
                </p>
              </div>
              <p className="text-white text-[14px] leading-snug font-ui font-semibold italic">
                You could be receiving <b className="text-lemon not-italic">€350/month</b> in
                benefits already. Apply to CAF first — it unlocks 2 other aids automatically.
              </p>
              <Link
                to="/level/benefits"
                className="text-lemon text-[13px] font-display font-bold mt-2 inline-flex items-center gap-1"
              >
                Show me how <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </CCard>

        {/* Journey */}
        <CCard delay={0.3}>
          <div className="flex items-center gap-2 mb-2">
            <Compass size={16} className="text-lemon" />
            <p className="text-white text-[14px] font-display font-bold">
              Your journey: {questsDone} of 12 quests
            </p>
          </div>
          <ProgressBar value={questsDone} max={12} className="mt-2" tone="lemon" />
          <Link
            to="/home"
            className="mt-3 inline-flex items-center gap-1 text-lemon font-display font-bold text-[13px]"
          >
            Continue your quest <ArrowRight size={14} />
          </Link>
        </CCard>
      </div>

      <BottomNav />
    </div>
  );
}
