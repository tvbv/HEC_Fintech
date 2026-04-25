import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CCardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: boolean;
  delay?: number;
  animate?: boolean;
  tone?: "default" | "navy" | "lemon" | "lilac" | "pink" | "hero" | "yellow" | "mint" | "coral" | "ink" | "dark" | "forest";
}

/**
 * Premium card — navy on black with deep shadow & inset highlight.
 * tone="lemon"|"lilac"|"pink" → solid colored card with #000 text.
 */
export function CCard({
  className,
  highlight,
  delay = 0,
  animate = true,
  tone = "navy",
  children,
  ...rest
}: CCardProps) {
  const Comp: any = animate ? motion.div : "div";
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as any },
      }
    : {};

  const toneClass = {
    default: "card-navy text-white",
    navy: "card-navy text-white",
    hero: "card-hero text-white",
    lemon: "bg-gradient-lemon text-black border border-black/15 shadow-lemon",
    lilac: "bg-gradient-lilac text-black border border-black/15 shadow-lilac",
    pink: "bg-gradient-pink text-black border border-black/15 shadow-pink",
    yellow: "bg-gradient-lemon text-black border border-black/15 shadow-lemon",
    mint: "card-navy text-white",
    coral: "bg-coral-red text-white border border-black/15",
    ink: "bg-black text-white border border-white/10",
    dark: "card-navy text-white",
    forest: "card-hero text-white",
  }[tone];

  return (
    <Comp
      {...motionProps}
      className={cn(
        "rounded-[20px] p-5 relative overflow-hidden",
        toneClass,
        highlight && "ring-2 ring-lemon",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = "lemon",
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: "lemon" | "lilac" | "pink" | "sky" | "yellow" | "mint" | "dark";
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillColor = {
    lemon: "bg-lemon",
    sky: "bg-lemon",
    yellow: "bg-lemon",
    mint: "bg-lemon",
    lilac: "bg-lilac",
    pink: "bg-pink",
    dark: "bg-white",
  }[tone];
  return (
    <div
      className={cn(
        "w-full h-1.5 rounded-full bg-white-10 overflow-hidden",
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", fillColor)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function Pill({
  children,
  variant = "lemon",
  className,
}: {
  children: React.ReactNode;
  variant?: "lemon" | "lilac" | "pink" | "outline" | "ghost" | "warn" | "danger" | "dark"
    | "coral" | "silver" | "yellow" | "mint" | "ink" | "forest";
  className?: string;
}) {
  const styles = {
    lemon: "bg-lemon/12 text-lemon border-lemon/40",
    lilac: "bg-lilac/15 text-lilac border-lilac/40",
    pink: "bg-pink/15 text-pink border-pink/40",
    outline: "bg-transparent text-white border-white/30",
    ghost: "bg-white/5 text-white-60 border-white/10",
    warn: "bg-warn-yellow/15 text-warn-yellow border-warn-yellow/40",
    danger: "bg-coral-red/15 text-coral-red border-coral-red/40",
    dark: "bg-black text-lemon border-lemon/40",
    /* legacy */
    coral: "bg-lemon/12 text-lemon border-lemon/40",
    silver: "bg-white/5 text-white-60 border-white/10",
    yellow: "bg-lemon/12 text-lemon border-lemon/40",
    mint: "bg-lemon/12 text-lemon border-lemon/40",
    ink: "bg-black text-white border-white/20",
    forest: "bg-lemon text-black border-black",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-[1px] uppercase border font-ui",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** XP badge with lightning icon */
export function XPBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("xp-badge", className)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3 L4 14 H11 L9 21 L20 10 H13 Z" />
      </svg>
      {value} XP
    </span>
  );
}
