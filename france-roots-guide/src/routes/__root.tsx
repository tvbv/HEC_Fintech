import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CleoCompanion } from "@/components/concierge/CleoCompanion";
import { Cleo } from "@/components/concierge/Cleo";
import { motion, AnimatePresence } from "framer-motion";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-silver">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#040F0F" },
      { title: "Concierge — Your guide to life in France" },
      {
        name: "description",
        content:
          "Concierge is your warm, gamified guide to banking, taxes and benefits when settling in France.",
      },
      { name: "author", content: "Concierge" },
      { property: "og:title", content: "Concierge — Your guide to life in France" },
      {
        property: "og:description",
        content: "A friendly companion for banking, taxes and benefits in France.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Concierge — Your guide to life in France" },
      { name: "description", content: "Concierge guides newcomers through France with gamified financial and administrative support." },
      { property: "og:description", content: "Concierge guides newcomers through France with gamified financial and administrative support." },
      { name: "twitter:description", content: "Concierge guides newcomers through France with gamified financial and administrative support." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/55c977ad-68c9-4034-803b-84c1e2ec4537/id-preview-51b0725c--ad938315-38ac-4f6e-b2d9-d5b7c6a5d6a6.lovable.app-1777139668819.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/55c977ad-68c9-4034-803b-84c1e2ec4537/id-preview-51b0725c--ad938315-38ac-4f6e-b2d9-d5b7c6a5d6a6.lovable.app-1777139668819.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { pathname } = useLocation();
  const [showSplash, setShowSplash] = useState(false);

  // Show the brand loading animation on every fresh open of the app
  // (once per browser tab session), unless we're already on splash/onboarding/loading.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("concierge:openSplash");
    const skipRoutes = ["/", "/onboarding", "/loading"];
    if (!seen && !skipRoutes.includes(pathname)) {
      setShowSplash(true);
      sessionStorage.setItem("concierge:openSplash", "1");
      const t = setTimeout(() => setShowSplash(false), 2200);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Outlet />
      <CleoCompanion />
      <AnimatePresence>
        {showSplash && <AppOpenSplash key="splash" />}
      </AnimatePresence>
    </>
  );
}

function AppOpenSplash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Lemon ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(248,255,161,0.15) 0%, transparent 60%)",
        }}
      />

      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-lemon/40"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2.4], opacity: [0.6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
          style={{ width: 140, height: 140 }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="relative flex flex-col items-center gap-4"
      >
        <Cleo pose="waving" mood="happy" size={110} />
        <p className="font-display font-black tracking-[3px] text-[12px] uppercase text-lemon">
          Concierge
        </p>
      </motion.div>
    </motion.div>
  );
}
