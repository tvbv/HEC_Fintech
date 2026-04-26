import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import "@/lib/i18n";
import { I18nextProvider } from "react-i18next";
import i18n, { setLanguage, getLanguage } from "@/lib/i18n";
import { useState } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "Concierge — Ta ville t'attend" },
      { name: "description", content: "Concierge : ville gamifiée pour t'installer en France. Banque, impôts, logement, assurance, transport, travail, enfants." },
      { name: "theme-color", content: "#0A0A0A" },
      { property: "og:title", content: "Concierge — Ta ville t'attend" },
      { property: "og:description", content: "Ville gamifiée pour t'installer en France." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
  return (
    <I18nextProvider i18n={i18n}>
      <Outlet />
      <CleoChatLazy />
      <LanguageToggle />
    </I18nextProvider>
  );
}

function LanguageToggle() {
  const [lang, setLang] = useState<"fr" | "en">(getLanguage());
  const toggle = () => {
    const next = lang === "fr" ? "en" : "fr";
    setLanguage(next);
    setLang(next);
  };
  return (
    <button
      onClick={toggle}
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all active:scale-95"
      style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
    >
      <span style={{ fontSize: "1rem" }}>{lang === "fr" ? "🇬🇧" : "🇫🇷"}</span>
      {lang === "fr" ? "EN" : "FR"}
    </button>
  );
}

import { CleoChat } from "@/components/CleoChat";
function CleoChatLazy() {
  return <CleoChat />;
}
