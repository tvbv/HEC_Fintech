import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Bell,
  Globe2,
  Lock,
  MessageCircle,
  Pencil,
  LogOut,
  ChevronRight,
  Plus,
  Zap,
} from "lucide-react";
import { CCard, Pill } from "@/components/concierge/CCard";
import { BottomNav } from "@/components/concierge/BottomNav";
import { Cleo, CleoBubble } from "@/components/concierge/Cleo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { onboarding, xp, streak, questsDone, reset } = useApp();
  const navigate = useNavigate();
  const initial = onboarding.name.charAt(0).toUpperCase();

  return (
    <div className="mobile-shell pb-32 bg-black min-h-screen relative">
      <div className="absolute inset-0 pointer-events-none bg-gradient-jungle-glow opacity-70" />

      <div
        className="px-5 pt-6 pb-2 flex flex-col items-center relative z-10"
        style={{ paddingTop: "max(28px, env(safe-area-inset-top))" }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-lemon/40 blur-2xl" />
          <div className="relative h-[88px] w-[88px] rounded-full bg-gradient-lemon border-4 border-black flex items-center justify-center shadow-lemon-lg">
            <span className="text-black text-[36px] font-display font-extrabold">{initial}</span>
          </div>
        </motion.div>
        <h1 className="text-white text-[24px] font-display font-bold mt-3">{onboarding.name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Pill variant="lemon">Level 1 · Newcomer</Pill>
          <Pill variant="ghost">
            <Zap size={11} /> {xp} XP
          </Pill>
        </div>
      </div>

      <div className="px-5 mt-5 relative z-10">
        <CCard delay={0.05}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat n={questsDone} l="Quests done" />
            <Stat n={`${streak}🔥`} l="Day streak" />
            <Stat n="€200" l="€ unlocked" />
          </div>
        </CCard>
      </div>

      <div className="px-5 mt-5 relative z-10">
        <p className="text-white-60 text-[10px] uppercase tracking-[2px] font-ui font-bold mb-2">
          Your countries
        </p>
        <CCard delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="text-[28px]">{onboarding.fromCountryFlag}</div>
            <div className="flex-1">
              <p className="text-white-60 text-[10px] uppercase tracking-[1.5px] font-ui font-bold">
                Home
              </p>
              <p className="text-white text-[14px] font-display font-bold">
                {onboarding.fromCountry}
              </p>
            </div>
            <div className="text-white-30 text-2xl">→</div>
            <div className="text-[28px] ring-2 ring-lemon rounded-full p-0.5">🇫🇷</div>
            <div className="flex-1">
              <p className="text-lemon text-[10px] uppercase tracking-[1.5px] font-ui font-bold">
                Current
              </p>
              <p className="text-white text-[14px] font-display font-bold">France</p>
            </div>
          </div>
          <button className="mt-3 text-white-60 text-[12px] flex items-center gap-1 font-ui font-semibold">
            <Plus size={13} /> Add another country
          </button>
        </CCard>
      </div>

      <div className="px-5 mt-5 relative z-10">
        <CCard delay={0.15} className="!p-0 overflow-hidden">
          <Row icon={<Bell size={18} />} label="Notifications" />
          <Divider />
          <Row icon={<Globe2 size={18} />} label="Language (English)" />
          <Divider />
          <Row icon={<Lock size={18} />} label="Privacy & data" />
          <Divider />
          <Row icon={<MessageCircle size={18} />} label="Help & support" />
          <Divider />
          <Row icon={<Pencil size={18} />} label="Update my profile" />
        </CCard>
      </div>

      <div className="px-5 mt-5 relative z-10">
        <CleoBubble
          side="left"
          pose="celebrating"
          tone="tip"
          size={56}
          text={
            <>
              Proud of you, {onboarding.name} 🌟 Three days in a row — keep that streak alive!
            </>
          }
        />
      </div>

      <div className="px-5 mt-5 relative z-10">
        <button
          onClick={() => {
            reset();
            navigate({ to: "/" });
          }}
          className="w-full flex items-center justify-center gap-2 py-3 text-coral-red font-display font-bold text-[14px] border border-coral-red/30 rounded-2xl bg-coral-red/5 active:scale-95 transition"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ n, l }: { n: React.ReactNode; l: string }) {
  return (
    <div>
      <p className="text-lemon text-[22px] font-display font-extrabold">{n}</p>
      <p className="text-white-60 text-[10px] mt-0.5 uppercase tracking-wider font-ui font-bold">
        {l}
      </p>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full px-5 py-4 flex items-center gap-3 text-left active:bg-white/5 transition">
      <span className="h-9 w-9 rounded-xl bg-lemon/15 border border-lemon/30 text-lemon flex items-center justify-center">
        {icon}
      </span>
      <span className="text-white text-[14px] flex-1 font-ui font-semibold">{label}</span>
      <ChevronRight size={16} className="text-white-40" />
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-white/8 mx-5" />;
}
