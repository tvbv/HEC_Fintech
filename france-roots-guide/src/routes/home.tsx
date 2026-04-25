import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Lock,
  Star,
  Crown,
  Trophy,
  Flame,
  Zap,
  Building2,
  FileText,
  Gift,
  Home,
  HeartPulse,
  Languages,
  Train,
  PiggyBank,
  Settings,
  Check,
} from "lucide-react";
import { CCard, ProgressBar, Pill } from "@/components/concierge/CCard";
import { Cleo, CleoBubble } from "@/components/concierge/Cleo";
import { BottomNav } from "@/components/concierge/BottomNav";
import { useApp } from "@/lib/store";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: QuestMap,
});

interface QuestNode {
  id: string;
  type: "lesson" | "checkpoint" | "boss";
  title: string;
  Icon: LucideIcon;
  href: string;
  status: "done" | "current" | "locked";
}

interface Section {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  status: "active" | "locked" | "done";
  comingSoon?: boolean;
  nodes: QuestNode[];
}

function QuestMap() {
  const { onboarding, xp, streak, quest } = useApp();
  const xpToNext = 500;

  const bankSelected = !!quest.bankSelected;
  const bankApplied = !!quest.bankApplied;
  const bankActive = !!quest.bankActive;
  const taxesFiled = !!quest.taxesFiled;

  const sections: Section[] = [
    {
      id: "banking",
      level: 1,
      title: "Banking",
      subtitle: "Open a French account",
      Icon: Building2,
      status: "active",
      nodes: [
        { id: "n1", type: "checkpoint", title: "Welcome", Icon: Star, href: "/level/banking", status: "done" },
        { id: "n2", type: "lesson", title: "Pick your bank", Icon: Building2, href: "/level/banking", status: bankSelected ? "done" : "current" },
        { id: "n3", type: "lesson", title: "Apply online", Icon: FileText, href: "/level/banking", status: bankApplied ? "done" : bankSelected ? "current" : "locked" },
        { id: "n4", type: "boss", title: "Get your card", Icon: Crown, href: "/level/banking", status: bankActive ? "done" : bankApplied ? "current" : "locked" },
      ],
    },
    {
      id: "taxes",
      level: 2,
      title: "Taxes",
      subtitle: "Declare without crying",
      Icon: FileText,
      status: bankActive ? "active" : "locked",
      nodes: [
        { id: "t1", type: "lesson", title: "Tax basics", Icon: FileText, href: "/level/taxes", status: bankActive ? (taxesFiled ? "done" : "current") : "locked" },
        { id: "t2", type: "lesson", title: "Find your bracket", Icon: Zap, href: "/level/taxes", status: taxesFiled ? "done" : "locked" },
        { id: "t3", type: "boss", title: "File your return", Icon: Crown, href: "/level/taxes", status: taxesFiled ? "done" : "locked" },
      ],
    },
    {
      id: "benefits",
      level: 3,
      title: "Benefits",
      subtitle: "Money the state owes you",
      Icon: Gift,
      status: taxesFiled ? "active" : "locked",
      nodes: [
        { id: "b1", type: "lesson", title: "Find your perks", Icon: Gift, href: "/level/benefits", status: taxesFiled ? "current" : "locked" },
        { id: "b2", type: "boss", title: "Claim €1,200/yr", Icon: Crown, href: "/level/benefits", status: "locked" },
      ],
    },
    {
      id: "housing",
      level: 4,
      title: "Housing",
      subtitle: "Rent like a local",
      Icon: Home,
      status: "locked",
      comingSoon: true,
      nodes: [
        { id: "h1", type: "lesson", title: "Lease decoded", Icon: FileText, href: "/home", status: "locked" },
        { id: "h2", type: "lesson", title: "Insurance basics", Icon: Home, href: "/home", status: "locked" },
        { id: "h3", type: "boss", title: "Get your keys", Icon: Crown, href: "/home", status: "locked" },
      ],
    },
    {
      id: "health",
      level: 5,
      title: "Healthcare",
      subtitle: "Sécu & Carte Vitale",
      Icon: HeartPulse,
      status: "locked",
      comingSoon: true,
      nodes: [
        { id: "hc1", type: "lesson", title: "How sécu works", Icon: HeartPulse, href: "/home", status: "locked" },
        { id: "hc2", type: "boss", title: "Carte Vitale unlocked", Icon: Crown, href: "/home", status: "locked" },
      ],
    },
    {
      id: "lang",
      level: 6,
      title: "Language",
      subtitle: "Survival French",
      Icon: Languages,
      status: "locked",
      comingSoon: true,
      nodes: [
        { id: "l1", type: "lesson", title: "Café phrases", Icon: Languages, href: "/home", status: "locked" },
      ],
    },
    {
      id: "transport",
      level: 7,
      title: "Transport",
      subtitle: "Métro, Vélib & beyond",
      Icon: Train,
      status: "locked",
      comingSoon: true,
      nodes: [
        { id: "tr1", type: "lesson", title: "Navigo card", Icon: Train, href: "/home", status: "locked" },
      ],
    },
    {
      id: "retire",
      level: 8,
      title: "Retirement",
      subtitle: "Long-term game plan",
      Icon: PiggyBank,
      status: "locked",
      comingSoon: true,
      nodes: [
        { id: "r1", type: "lesson", title: "PER basics", Icon: PiggyBank, href: "/home", status: "locked" },
      ],
    },
  ];

  return (
    <div className="mobile-shell pb-32 relative bg-black min-h-screen">
      {/* Ambient lemon/lilac glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-jungle-glow opacity-90" />

      {/* Top bar */}
      <header
        className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 relative z-10"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <Link to="/profile" className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="relative">
            <Cleo pose="waving" mood="happy" size={48} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-lemon rounded-full border-2 border-black" />
          </div>
          <div>
            <p className="text-white-40 text-[10px] font-bold uppercase tracking-[2px] font-ui">
              Bonjour
            </p>
            <h2 className="text-white text-[18px] font-display font-bold leading-tight">
              {onboarding.name}
            </h2>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <StatChip Icon={Flame} value={streak} accent="coral" />
          <StatChip Icon={Zap} value={xp} accent="lemon" />
          <Link
            to="/profile"
            className="h-9 w-9 rounded-full bg-navy border border-white/10 flex items-center justify-center text-white-60 active:scale-95"
          >
            <Settings size={16} />
          </Link>
        </div>
      </header>

      {/* Level summary card */}
      <div className="px-5 mb-5 relative z-10">
        <CCard tone="hero" delay={0.1} className="!p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-lemon flex items-center justify-center shadow-lemon">
              <Crown size={20} className="text-black" strokeWidth={2.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui">
                Level 1 · Newcomer
              </p>
              <p className="text-white text-[15px] font-display font-bold">
                {xp} <span className="text-white-40">/ {xpToNext} XP</span>
              </p>
            </div>
            <Pill variant="lemon">
              <Trophy size={11} />
              {Math.round((xp / xpToNext) * 100)}%
            </Pill>
          </div>
          <ProgressBar value={xp} max={xpToNext} tone="lemon" />
        </CCard>
      </div>

      {/* Map background — abstract dot grid */}
      <MapBackdrop />

      {/* Sections */}
      <div className="relative z-10">
        {sections.map((section, sIdx) => (
          <SectionBlock key={section.id} section={section} index={sIdx} />
        ))}
      </div>

      {/* Final reward */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="flex flex-col items-center mt-8 mb-12 relative z-10"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-lemon/40 blur-2xl animate-glow-pulse" />
          <div className="relative h-24 w-24 rounded-[28px] bg-gradient-lemon border border-black/20 flex items-center justify-center shadow-lemon-lg">
            <Trophy size={42} className="text-black" strokeWidth={2.4} />
          </div>
        </div>
        <p className="text-white text-[12px] font-display font-bold uppercase tracking-[2px] mt-3">
          Final Reward
        </p>
        <p className="text-white-60 text-[12px] font-medium">
          Become a France Pro 🇫🇷
        </p>
      </motion.div>

      <BottomNav />
    </div>
  );
}

/* -------------------- Section -------------------- */

function SectionBlock({ section, index }: { section: Section; index: number }) {
  const isLocked = section.status === "locked";
  const offsets = [0, 64, 88, 32, -48, -84, -56, 24, 60];

  return (
    <div className="relative">
      <SectionBanner section={section} index={index} />

      <div className="relative px-4 pt-2 pb-6">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {section.nodes.map((_, i) => {
            if (i === section.nodes.length - 1) return null;
            const nodeHeight = 116;
            const y1 = 30 + i * nodeHeight + 70;
            const y2 = 30 + (i + 1) * nodeHeight + 5;
            const x1 = 50 + ((offsets[i] ?? 0) / 320) * 50;
            const x2 = 50 + ((offsets[i + 1] ?? 0) / 320) * 50;
            return (
              <path
                key={i}
                d={`M ${x1}% ${y1} Q ${(x1 + x2) / 2}% ${(y1 + y2) / 2 + 14} ${x2}% ${y2}`}
                stroke={isLocked ? "rgba(255,255,255,0.10)" : "rgba(248,255,161,0.55)"}
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
                fill="none"
              />
            );
          })}
        </svg>

        <div className="relative space-y-[40px] pt-3">
          {section.nodes.map((node, i) => (
            <div key={node.id} className="flex justify-center">
              <PathNode
                node={node}
                offsetX={offsets[i] ?? 0}
                delay={i * 0.05}
                isCurrent={node.status === "current"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionBanner({ section }: { section: Section; index: number }) {
  const isLocked = section.status === "locked";
  const isComingSoon = !!section.comingSoon;
  const Icon = section.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-5 my-4"
    >
      <div
        className={`relative rounded-[22px] p-4 border overflow-hidden ${
          isLocked
            ? "bg-navy/50 border-white/8"
            : "bg-navy border-lemon/30"
        } shadow-deep`}
      >
        {!isLocked && (
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-lemon/20 blur-2xl pointer-events-none" />
        )}
        <div className="flex items-center gap-3 relative">
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isLocked
                ? "bg-black/30 border-white/10 text-white-30"
                : "bg-gradient-lemon border-black/20 text-black shadow-lemon"
            }`}
          >
            {isLocked ? <Lock size={20} /> : <Icon size={22} strokeWidth={2.4} />}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-[10px] font-bold uppercase tracking-[2px] font-ui ${
                isLocked ? "text-white-30" : "text-lemon"
              }`}
            >
              Section {section.level}
            </p>
            <p
              className={`text-[16px] font-display font-bold leading-tight truncate ${
                isLocked ? "text-white-40" : "text-white"
              }`}
            >
              {section.title}
            </p>
            <p className={`text-[11px] font-medium truncate ${isLocked ? "text-white-30" : "text-white-60"}`}>
              {section.subtitle}
            </p>
          </div>
          {isComingSoon ? (
            <Pill variant="lilac">Soon</Pill>
          ) : isLocked ? (
            <Pill variant="ghost">
              <Lock size={10} />
              Locked
            </Pill>
          ) : (
            <Pill variant="lemon">
              <span className="h-1.5 w-1.5 rounded-full bg-lemon animate-pulse" />
              Active
            </Pill>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------- Helpers -------------------- */

function StatChip({
  Icon,
  value,
  accent,
}: {
  Icon: LucideIcon;
  value: number;
  accent: "coral" | "lemon";
}) {
  const tone =
    accent === "coral"
      ? "bg-coral-red/15 text-coral-red border-coral-red/40"
      : "bg-lemon/15 text-lemon border-lemon/40";
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`${tone} border px-2.5 py-1 rounded-full flex items-center gap-1 text-[12px] font-bold font-ui`}
    >
      <Icon size={13} strokeWidth={2.6} />
      {value}
    </motion.div>
  );
}

function MapBackdrop() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18]"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 430 1800"
    >
      <defs>
        <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#F8FFA1" opacity="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid)" />
    </svg>
  );
}

function PathNode({
  node,
  offsetX,
  delay,
  isCurrent,
}: {
  node: QuestNode;
  offsetX: number;
  delay: number;
  isCurrent: boolean;
}) {
  const locked = node.status === "locked";
  const done = node.status === "done";
  const isBoss = node.type === "boss";
  const Icon = node.Icon;

  let bgClass = "bg-navy";
  let borderClass = "border-white/10";
  let iconColor = "text-white-30";
  let shadowStyle = "0 4px 0 rgba(0,0,0,0.4)";

  if (locked) {
    bgClass = "bg-navy/60";
    borderClass = "border-white/8";
    iconColor = "text-white-30";
    shadowStyle = "0 4px 0 rgba(0,0,0,0.3)";
  } else if (done) {
    bgClass = "bg-gradient-lemon";
    borderClass = "border-black/20";
    iconColor = "text-black";
    shadowStyle = "0 5px 0 #B8C144, 0 14px 28px -8px rgba(248,255,161,0.5)";
  } else if (isCurrent) {
    bgClass = isBoss ? "bg-gradient-lemon" : "bg-gradient-lemon";
    borderClass = "border-black/20";
    iconColor = "text-black";
    shadowStyle = "0 6px 0 #B8C144, 0 16px 32px -8px rgba(248,255,161,0.6)";
  }

  const size = isBoss ? 88 : 76;

  const Inner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
      style={{ transform: `translateX(${offsetX}px)` }}
      className="relative flex flex-col items-center"
    >
      {/* Pulse ring on current */}
      {isCurrent && (
        <span
          className="absolute rounded-full"
          style={{
            width: size + 12,
            height: size + 12,
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            border: "3px solid rgba(248,255,161,0.5)",
            animation: "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
          }}
        />
      )}

      {/* Cleo START tag */}
      {isCurrent && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2 }}
          className="absolute -top-9 bg-lemon text-black text-[10px] font-display font-bold tracking-[1.5px] px-3 py-1 rounded-full border-2 border-black shadow-lemon"
        >
          START
        </motion.div>
      )}

      <Link to={node.href}>
        <motion.div
          whileTap={!locked ? { scale: 0.92, y: 3 } : undefined}
          className={`relative rounded-full ${bgClass} border-2 ${borderClass} flex items-center justify-center transition-all`}
          style={{
            width: size,
            height: size,
            boxShadow: shadowStyle,
          }}
        >
          {locked ? (
            <Lock size={isBoss ? 30 : 26} className={iconColor} strokeWidth={2.4} />
          ) : done ? (
            <Check size={isBoss ? 36 : 30} className={iconColor} strokeWidth={3.2} />
          ) : (
            <Icon size={isBoss ? 36 : 30} className={iconColor} strokeWidth={2.4} />
          )}

          {isBoss && !locked && (
            <span className="absolute -top-2 -right-2 h-7 w-7 bg-black rounded-full border-2 border-lemon flex items-center justify-center">
              <Crown size={13} className="text-lemon" strokeWidth={2.6} />
            </span>
          )}
        </motion.div>
      </Link>

      <p
        className={`mt-2 text-[11px] font-display font-bold text-center max-w-[110px] leading-tight ${
          locked ? "text-white-30" : done ? "text-lemon" : "text-white"
        }`}
      >
        {node.title}
      </p>
    </motion.div>
  );

  return Inner;
}
