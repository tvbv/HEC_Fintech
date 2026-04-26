import { Link, useLocation } from "@tanstack/react-router";
import { HomeIcon, ChartIcon, CalendarIcon, UserIcon } from "./icons";

const items = [
  { to: "/city", label: "Ma Ville", icon: HomeIcon },
  { to: "/dashboard", label: "Dashboard", icon: ChartIcon },
  { to: "/deadlines", label: "Échéances", icon: CalendarIcon },
  { to: "/profile", label: "Profil", icon: UserIcon },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-lg border-t border-white/5">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((it) => {
          const active = loc.pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
              style={{ color: active ? "var(--lemon)" : "rgba(255,255,255,0.5)" }}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium tracking-wide">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
