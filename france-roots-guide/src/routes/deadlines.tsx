import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Check } from "lucide-react";
import { CCard, Pill } from "@/components/concierge/CCard";
import { BottomNav } from "@/components/concierge/BottomNav";
import { CleoBubble } from "@/components/concierge/Cleo";

export const Route = createFileRoute("/deadlines")({
  component: Deadlines,
});

const FILTERS = ["All", "Urgent", "Tax", "Benefits", "Admin"] as const;

const ITEMS = [
  {
    cat: "Tax" as const,
    title: "Tax declaration (Form 2042)",
    desc: "First-year paper declaration. Mail to Centre des Finances Publiques.",
    days: 36,
    urgency: "urgent" as const,
    done: false,
    href: "/level/taxes",
  },
  {
    cat: "Benefits" as const,
    title: "CAF housing renewal",
    desc: "Confirm your income and address with CAF to keep monthly aid.",
    days: 51,
    urgency: "soon" as const,
    done: false,
    href: "/level/benefits",
  },
  {
    cat: "Admin" as const,
    title: "Carte de séjour renewal",
    desc: "Apply 2 months before expiry on your local préfecture's site.",
    days: 109,
    urgency: "fine" as const,
    done: false,
    href: "/dashboard",
  },
  {
    cat: "Admin" as const,
    title: "Update RIB with employer",
    desc: "Send your new French IBAN once your bank account is open.",
    days: 14,
    urgency: "urgent" as const,
    done: true,
    href: "/dashboard",
  },
];

const borderTone = {
  urgent: "!border-l-coral-red",
  soon: "!border-l-warn-yellow",
  fine: "!border-l-lemon",
} as const;

const textTone = {
  urgent: "text-coral-red",
  soon: "text-warn-yellow",
  fine: "text-lemon",
} as const;

function Deadlines() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const filtered = ITEMS.filter(
    (i) =>
      filter === "All" ||
      i.cat === filter ||
      (filter === "Urgent" && i.urgency === "urgent"),
  );

  return (
    <div className="mobile-shell pb-32 bg-black min-h-screen relative">
      <div className="absolute inset-0 pointer-events-none bg-gradient-jungle-glow opacity-60" />

      <header
        className="px-5 pt-4 pb-2 relative z-10 flex items-center justify-between"
        style={{ paddingTop: "max(18px, env(safe-area-inset-top))" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-lemon" />
            <p className="text-lemon text-[10px] font-bold uppercase tracking-[2px] font-ui">
              Stay on top
            </p>
          </div>
          <h1 className="text-white text-[24px] font-display font-bold leading-tight mt-1">
            Upcoming deadlines 🗓
          </h1>
        </div>
      </header>

      <div className="px-5 mt-3 mb-4 relative z-10">
        <CleoBubble
          side="left"
          pose="guiding"
          tone="dark"
          size={56}
          text={
            <>
              Don't miss these — I'll remind you. <b>Tax declaration</b> first, it's the closest 🚨
            </>
          }
        />
      </div>

      <div className="px-5 mb-4 overflow-x-auto scrollbar-hide relative z-10">
        <div className="flex gap-2 w-max">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[12px] font-display font-bold transition border ${
                filter === f
                  ? "bg-lemon text-black border-black/20 shadow-lemon"
                  : "bg-navy text-white-60 border-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3 relative z-10">
        {filtered.length === 0 && (
          <CCard>
            <p className="text-white text-center text-[14px] font-ui">
              Nothing here. Cleo says: enjoy a coffee ☕
            </p>
          </CCard>
        )}
        {filtered.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <CCard className={`border-l-4 ${borderTone[item.urgency]}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill variant={item.urgency === "urgent" ? "danger" : item.urgency === "soon" ? "warn" : "lemon"}>
                      {item.cat}
                    </Pill>
                    {item.done && (
                      <span className="text-lemon text-[11px] flex items-center gap-1 font-ui font-bold">
                        <Check size={11} strokeWidth={3} /> Done
                      </span>
                    )}
                  </div>
                  <p className="text-white text-[15px] font-display font-bold">{item.title}</p>
                  <p className="text-white-60 text-[12px] mt-1 font-ui leading-snug">{item.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[22px] font-display font-extrabold ${textTone[item.urgency]}`}>
                    {item.days}
                  </p>
                  <p className="text-white-40 text-[10px] uppercase tracking-wider font-ui font-bold">
                    days
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                {item.done ? (
                  <span className="text-white-60 text-[12px] font-ui font-semibold">
                    ✓ Already handled
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="text-lemon text-[13px] font-display font-bold flex items-center gap-1"
                  >
                    Start quest <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </CCard>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
