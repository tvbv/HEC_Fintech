import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Cleo } from "@/components/concierge/Cleo";
import { IconBank, IconDocument, IconCalculator, IconGift } from "@/components/concierge/Icons";

export const Route = createFileRoute("/loading")({
  component: LoadingScreen,
});

const MESSAGES = [
  "Scanning the French system for you...",
  "Finding what you're entitled to...",
  "Building your personal quest map...",
  "C'est presque prêt — almost there!",
];

const ORBIT_ICONS = [IconBank, IconDocument, IconCalculator, IconGift];

function LoadingScreen() {
  const navigate = useNavigate();
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const total = 4000;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);
      if (elapsed >= total) {
        clearInterval(tick);
        setFlash(true);
        setTimeout(() => navigate({ to: "/home" }), 500);
      }
    }, 40);
    return () => clearInterval(tick);
  }, [navigate]);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mobile-shell relative bg-black overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Lemon ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(248,255,161,0.10) 0%, transparent 60%)" }}
      />

      {/* Cleo + orbiting icons */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        {ORBIT_ICONS.map((Icon, i) => {
          const angle = (i / ORBIT_ICONS.length) * 360;
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ width: 0, height: 0, transformOrigin: "center" }}
              animate={{ rotate: [angle, angle + 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                style={{ transform: `translateX(110px)` }}
                animate={{ rotate: [-angle, -angle - 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div
                  className="h-11 w-11 rounded-full bg-navy border border-lemon/40 flex items-center justify-center text-lemon"
                  style={{ boxShadow: "0 0 16px rgba(248,255,161,0.25)" }}
                >
                  <Icon size={20} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
        <Cleo pose="thinking" mood="focused" size={100} />
      </div>

      {/* Cycling message */}
      <div className="h-12 mt-10 flex items-center justify-center">
        <motion.p
          key={msgIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
          className="text-white-80 text-[16px] font-body italic text-center"
        >
          {MESSAGES[msgIdx]}
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-full max-w-[280px] h-1.5 rounded-full bg-white-10 overflow-hidden">
        <motion.div
          className="h-full bg-lemon rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-white-40 text-[11px] font-ui font-bold uppercase tracking-[1.5px]">
        {Math.floor(progress)}%
      </p>

      {/* Final flash */}
      {flash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-lemon z-50 pointer-events-none"
        />
      )}
    </div>
  );
}
