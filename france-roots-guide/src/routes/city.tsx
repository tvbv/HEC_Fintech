import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { BUILDING_PATH_ORDER } from "@/config/buildingPath";
import { buildingThemes, buildingRequiredDocs, type BuildingId } from "@/lib/theme";

/** Même ordre que partout ailleurs — import direct du fichier config pour l’écran /city. */
const buildingOrder: BuildingId[] = [...BUILDING_PATH_ORDER] as BuildingId[];
import { AmbientGlobe } from "@/components/AmbientGlobe";
import { CleoCharacter } from "@/components/CleoCharacter";
import { BuildingSVG } from "@/components/BuildingSVG";
import { LockIcon, CheckIcon } from "@/components/icons";
import { HammerIcon } from "@/components/HammerIcon";
import { BottomNav } from "@/components/BottomNav";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/city")({
  head: () => ({
    meta: [
      { title: "Ma Ville — Concierge" },
      { name: "description", content: "Ta ville gamifiée. Avance bâtiment par bâtiment." },
    ],
  }),
  component: City,
});

const ROW_H = 180;
const VIEW_W = 360;

function City() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { onboarding, completedBuildings, xp, uploadedDocuments, unlockBuildingChain } = useApp();
  const [shakeId, setShakeId] = useState<BuildingId | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const stateOf = (id: BuildingId): "locked" | "unlocked" | "done" => {
    if (completedBuildings.includes(id)) return "done";
    const idx = buildingOrder.indexOf(id);
    const prev = buildingOrder[idx - 1];
    if (idx === 0 || (prev && completedBuildings.includes(prev))) return "unlocked";
    return "locked";
  };

  // Vérifie si l'utilisateur a les docs nécessaires pour débloquer un bâtiment via marteau
  const canUnlockWithDocs = (id: BuildingId) => {
    if (id === "airport") return false;
    const req = buildingRequiredDocs[id as Exclude<BuildingId, "airport">];
    if (!req || req.length === 0) return false;
    return req.every((needle) =>
      uploadedDocuments.some((d) => d.name.toLowerCase().includes(needle.toLowerCase()))
    );
  };

  const handleTap = (id: BuildingId) => {
    if (id === "airport") return;
    // Buildings are always consultable, even if locked (read-only preview)
    navigate({ to: "/building/$id", params: { id } });
  };

  const handleHammer = (id: BuildingId, e: React.MouseEvent) => {
    e.stopPropagation();
    unlockBuildingChain(id);
    setToast(t("city.hammer_toast", { name: buildingThemes[id].name }));
    setTimeout(() => setToast(null), 2600);
  };

  // points serpent (zigzag)
  const points = buildingOrder.map((_, i) => ({
    x: i % 2 === 0 ? VIEW_W * 0.28 : VIEW_W * 0.72,
    y: ROW_H / 2 + i * ROW_H,
  }));

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const midY = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  }, "");

  const totalH = points[points.length - 1].y + ROW_H / 2;
  const completedCount = completedBuildings.length;

  // Position du logo "Je suis là" : sur le dernier bâtiment complété (ou airport)
  const logoIdx = Math.max(0, completedCount - 1);
  const logoPos = points[Math.min(logoIdx, points.length - 1)];

  return (
    <main className="relative min-h-screen pb-28">
      <AmbientGlobe />

      <header className="sticky top-0 z-30 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/5 px-5 py-3 flex items-center gap-3">
        <CleoCharacter state="IDLE" size={36} />
        <div className="flex-1">
          <p className="font-display font-bold text-white text-lg leading-tight">
            {t("city.hello", { name: onboarding.first_name ?? "👋" })}
          </p>
          <p className="text-white/40 text-xs italic">
            {onboarding.city ? t("city.welcome_to", { city: onboarding.city }) : t("city.welcome_default")}
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-label font-bold" style={{ background: "var(--lemon)", color: "#000" }}>
          {t("city.xp", { xp })}
        </div>
      </header>

      <div className="relative z-10 px-5 pt-6">
        <h1 className="font-display font-black text-3xl mb-1">
          <span style={{ color: "var(--lemon)" }}>{t("city.title_a")}</span>{" "}
          <span style={{ color: "#fff" }}>{t("city.title_b")}</span>{" "}
          <span style={{ color: "var(--lilac)" }}>{t("city.title_c")}</span>
        </h1>
        <p className="text-white/50 italic text-sm mb-6">
          {t("city.progress", { done: completedCount, total: buildingOrder.length })}
        </p>

        <div className="relative mx-auto" style={{ width: VIEW_W, height: totalH }}>
          <svg viewBox={`0 0 ${VIEW_W} ${totalH}`} className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--lemon)" />
                <stop offset="100%" stopColor="var(--lilac)" />
              </linearGradient>
            </defs>

            {/* Tous les segments en pointillés */}
            <path d={pathD} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 10" />

            {/* Segments complétés : pointillés colorés */}
            {points.slice(1).map((p, i) => {
              const isDone = i + 1 <= completedCount;
              if (!isDone) return null;
              const prev = points[i];
              const midY = (prev.y + p.y) / 2;
              return (
                <path key={i} d={`M ${prev.x} ${prev.y} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`}
                  fill="none" stroke="url(#pathGrad)" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 8" />
              );
            })}

            {/* Segment actif animé */}
            {completedCount < points.length - 1 && (() => {
              const i = completedCount;
              const prev = points[i];
              const p = points[i + 1] ?? prev;
              const midY = (prev.y + p.y) / 2;
              return (
                <path d={`M ${prev.x} ${prev.y} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`}
                  fill="none" stroke="var(--lemon)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 8"
                  opacity="0.65" />
              );
            })()}
          </svg>

          {/* Logo "Je suis là" positionné sur le dernier bâtiment complété */}
          <div
            className="absolute z-20 transition-all duration-700 ease-out pointer-events-none"
            style={{ left: logoPos.x, top: logoPos.y - 70, transform: "translateX(-50%)" }}
          >
            <div className="relative">
              <div className="px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-float"
                style={{ background: "var(--lemon)", color: "#000" }}>
                <span className="text-base">📍</span>
                <span className="font-label font-bold text-[11px] uppercase tracking-wide">{t("city.here_label")}</span>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 rotate-45" style={{ background: "var(--lemon)" }} />
            </div>
          </div>

          {buildingOrder.map((id, i) => {
            const theme = buildingThemes[id];
            const s = stateOf(id);
            const isShaking = shakeId === id;
            const p = points[i];
            const showHammer = s === "locked" && canUnlockWithDocs(id);

            // Bâtiment "airport" = panneau "Je suis là" plutôt qu'un building
            if (id === "airport") {
              return (
                <div
                  key={id}
                  className="absolute"
                  style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)", width: 140 }}
                >
                  <div className="rounded-3xl p-3 text-center"
                    style={{ background: "var(--vivid-purple)", border: "2px solid var(--lemon)" }}>
                    <div className="flex justify-center mb-1">
                      <CleoCharacter state={s === "done" ? "CELEBRATING" : "TALKING"} size={56} />
                    </div>
                    <p className="font-display font-black text-white text-sm leading-tight">Concierge</p>
                    <p className="font-label text-white/80 text-[10px] italic">Ton point de départ</p>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={id}
                onClick={() => handleTap(id)}
                className={`absolute ${isShaking ? "animate-shake" : ""}`}
                style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)", width: 140 }}
              >
                <div
                  className={`relative rounded-3xl p-3 transition-all ${s === "unlocked" ? "animate-pulse-glow" : ""}`}
                  style={{
                    background: s === "locked" ? "var(--bg-surface)" : `${theme.color}26`,
                    border: s === "unlocked" ? `2px solid ${theme.color}` : "2px solid transparent",
                    // @ts-expect-error css var
                    "--glow-color": theme.color,
                  }}
                >
                  {s === "done" && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center z-10 animate-scale-in"
                      style={{ background: "var(--lemon)", color: "#000" }}>
                      <CheckIcon size={14} />
                    </div>
                  )}
                  {s === "locked" && !showHammer && (
                    <div className="absolute top-2 right-2 text-white/40">
                      <LockIcon size={14} />
                    </div>
                  )}
                  <div className="flex justify-center mb-1">
                    <div className={s === "unlocked" ? "animate-float" : ""}>
                      <BuildingSVG id={id} color={theme.color} state={s} size={84} />
                    </div>
                  </div>
                  <p className="font-display font-bold text-center text-sm"
                    style={{ color: s === "locked" ? "rgba(255,255,255,0.3)" : "#fff" }}>
                    {theme.name}
                  </p>
                </div>

                {/* Marteau : déblocage par documents */}
                {showHammer && (
                  <span
                    onClick={(e) => handleHammer(id, e)}
                    className="absolute -right-3 top-2 w-9 h-9 rounded-full flex items-center justify-center animate-pulse-glow z-20 cursor-pointer"
                    style={{
                      background: "var(--lemon)", color: "#000",
                      // @ts-expect-error css var
                      "--glow-color": "var(--lemon)",
                    }}
                    title="Tu as les documents — débloque !"
                  >
                    <HammerIcon size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 inset-x-0 z-40 flex justify-center px-5 animate-fade-in">
          <div className="px-4 py-3 rounded-2xl font-label text-sm max-w-xs text-center" style={{ background: "var(--vivid-purple)", color: "#fff" }}>
            {toast}
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
