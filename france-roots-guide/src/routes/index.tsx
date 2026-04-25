import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Cleo } from "@/components/concierge/Cleo";
import { ParisSkyline } from "@/components/concierge/ParisSkyline";
import { CButton } from "@/components/concierge/CButton";
import { IconArrowRight, IconKey } from "@/components/concierge/Icons";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate();
  const onboarded = useApp((s) => s.onboarded);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (onboarded) navigate({ to: "/home", replace: true });
  }, [onboarded, navigate]);

  const handleStart = () => {
    setFlash(true);
    setTimeout(() => navigate({ to: "/onboarding" }), 220);
  };

  // Floating particles
  const particles = [...Array(8)].map((_, i) => ({
    x: 20 + (i * 47) % 360,
    y: 80 + (i * 71) % 380,
    size: 3 + (i % 4),
    color: i % 3 === 0 ? "#F8FFA1" : i % 3 === 1 ? "#A8A3F8" : "#FFFFFF",
    delay: i * 0.3,
  }));

  return (
    <div className="mobile-shell relative overflow-hidden bg-black">
      {/* Top-right lilac ambient glow */}
      <div
        className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,163,248,0.10) 0%, transparent 70%)" }}
      />

      {/* Paris skyline at bottom */}
      <ParisSkyline height="42%" animate />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.4,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: 2.2 + p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] px-6">
        {/* Cleo drops in at 38% from top */}
        <div className="flex-1 flex flex-col items-center justify-center w-full pt-20">
          <motion.div
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 130, damping: 12, delay: 0.9 }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 0.9, 1] }}
              transition={{ duration: 0.4, delay: 1.5, times: [0, 0.3, 0.6, 1] }}
            >
              <Cleo pose="idle" mood="happy" size={120} />
            </motion.div>

            {/* Star burst from Cleo's key */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-lemon"
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * 70,
                    y: Math.sin(angle) * 70,
                    opacity: [0, 1, 0],
                    scale: [0, 1.4, 0],
                  }}
                  transition={{ duration: 0.6, delay: 1.4 + i * 0.02 }}
                />
              );
            })}
          </motion.div>

          {/* Wordmark */}
          <div className="mt-10 flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7, type: "spring" }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(248,255,161,0.6) 0%, transparent 70%)", transform: "scale(1.8)" }}
              />
              <IconKey size={32} className="text-lemon relative" />
            </motion.div>
            <h1 className="font-display font-black text-white text-[44px] tracking-[-2px] leading-none flex">
              {"Concierge".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ delay: 1.8, opacity: { duration: 2, repeat: Infinity, delay: 2 } }}
            className="mt-4 text-lemon text-[16px] font-body font-normal text-center"
          >
            Your guide to life in France
          </motion.p>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm pb-10 z-10"
          style={{ paddingBottom: "max(40px, env(safe-area-inset-bottom))" }}
        >
          <CButton onClick={handleStart} variant="primary">
            Start my journey
            <IconArrowRight size={18} />
          </CButton>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8 }}
            className="w-full mt-3 text-white-40 text-[14px] font-body py-2"
          >
            Already have an account? <span className="text-lemon">Sign in</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Lemon flash on tap */}
      {flash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-lemon z-50 pointer-events-none"
        />
      )}
    </div>
  );
}
