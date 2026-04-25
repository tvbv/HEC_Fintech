import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { IconMap, IconChartBar, IconBell, IconPerson } from "./Icons";

const items = [
  { to: "/home", label: "My Path", Icon: IconMap },
  { to: "/dashboard", label: "Dashboard", Icon: IconChartBar },
  { to: "/deadlines", label: "Deadlines", Icon: IconBell },
  { to: "/profile", label: "Profile", Icon: IconPerson },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 glass-dark border-t border-lemon/10"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-stretch justify-around px-2 pt-2 pb-1">
        {items.map(({ to, label, Icon }) => {
          const active =
            pathname === to || (to === "/home" && pathname.startsWith("/level"));
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-2 py-1 flex-1 transition-transform active:scale-95 relative"
            >
              <Icon size={22} className={active ? "text-lemon" : "text-white-40"} />
              <span
                className={`text-[11px] font-ui font-semibold ${active ? "text-lemon" : "text-white-40"}`}
              >
                {label}
              </span>
              {active && (
                <motion.span
                  layoutId="navActiveDot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-lemon"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
