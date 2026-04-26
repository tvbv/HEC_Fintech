import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/lib/store";
import { fetchBankRecommendations, getBankRecommendations, STATIC_BANK_RECOS } from "@/lib/api";
import type { Recommendation } from "@/lib/buildings";
import { buildingThemes, type BuildingId } from "@/lib/theme";
import { BUILDING_CONTENT } from "@/lib/buildings";
import { CleoCharacter } from "@/components/CleoCharacter";
import { CheckIcon, ChevronIcon, StarIcon, CloseIcon } from "@/components/icons";
import { Confetti } from "@/components/Confetti";
import { CountUp } from "@/components/CountUp";
import { ChildrenSection } from "@/features/ChildrenSection";
import { PayslipsSection } from "@/features/PayslipsSection";
import { RetirementSection } from "@/features/RetirementSection";
import { AidsSection } from "@/features/AidsSection";
import { TaxesPredictionSection } from "@/features/TaxesPredictionSection";
import { ComparatorButton } from "@/features/ComparatorSheet";

export const Route = createFileRoute("/building/$id")({
  component: BuildingScreen,
});

const VALID: BuildingId[] = ["bank", "taxes", "housing", "insurance", "transport", "work", "retirement", "children", "aids"];

function BuildingScreen() {
  const { id } = useParams({ from: "/building/$id" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const buildingId = id as BuildingId;
  if (!VALID.includes(buildingId)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <button onClick={() => navigate({ to: "/city" })} className="underline">{t("common.back")}</button>
      </div>
    );
  }
  const content = BUILDING_CONTENT[buildingId as Exclude<BuildingId, "airport">];
  const theme = buildingThemes[buildingId];
  const { buildingProgress, toggleStep, completeBuilding, completedBuildings, onboarding } = useApp();
  const checked = buildingProgress[buildingId] ?? [];
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [dynamicRecos, setDynamicRecos] = useState<Recommendation[] | null>(null);
  const isDone = completedBuildings.includes(buildingId);

  const recos = dynamicRecos ?? content.recos;

  const startScan = () => {
    setScanning(true);
    if (buildingId === "bank") {
      fetchBankRecommendations(onboarding)
        .then((r) => { setDynamicRecos(r); })
        .catch(() => { /* garde les recos statiques en fallback */ })
        .finally(() => { setScanning(false); setScanned(true); });
    } else {
      setTimeout(() => { setScanning(false); setScanned(true); }, 4000);
    }
  };

  const finish = () => {
    setCelebrating(true);
    completeBuilding(buildingId);
    setTimeout(() => navigate({ to: "/city" }), 2800);
  };

  return (
    <main className="relative min-h-screen pb-24 bg-[#0A0A0A]">
      {celebrating && <Confetti />}

      {/* close */}
      <button
        onClick={() => navigate({ to: "/city" })}
        className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20"
      >
        <CloseIcon size={18} />
      </button>

      {/* hero */}
      <section
        className="relative px-5 pt-12 pb-10 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${theme.color}22 0%, transparent 100%)` }}
      >
        <h1 className="font-display font-black text-5xl leading-[1.05] mb-4">
          {content.hero.words.map((w, i) => (
            <span key={i} style={{ color: w.color }}>{w.text}{i < content.hero.words.length - 1 ? " " : ""}</span>
          ))}
        </h1>
        <p className="text-white/60 italic mb-6">{content.intro}</p>
        <CleoCharacter state="GUIDING" message={content.cleoMessage} size={56} />
      </section>

      {/* B - story cards */}
      <section className="px-5 mb-8 space-y-3">
        <h2 className="font-display font-bold text-white text-xl mb-3">{t("building.what_to_know")}</h2>
        {content.story.map((s, i) => (
          <article
            key={i}
            className="rounded-2xl p-5 animate-fade-in"
            style={{
              background: s.variant === "vivid" ? s.color : "var(--bg-surface)",
              animationDelay: `${i * 80}ms`,
            }}
          >
            <h3 className="font-display font-bold text-[17px] mb-1" style={{ color: s.variant === "vivid" ? "#fff" : "#fff" }}>
              {s.title}
            </h3>
            <p className="text-sm italic font-body" style={{ color: s.variant === "vivid" ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)" }}>
              {s.body}
            </p>
          </article>
        ))}
      </section>

      {buildingId === "work" && <PayslipsSection />}
      {buildingId === "taxes" && <TaxesPredictionSection />}
      {buildingId === "retirement" && <RetirementSection />}
      {buildingId === "children" && <ChildrenSection />}
      {buildingId === "aids" && <AidsSection />}

      {/* C - scan IA */}
      <section className="px-5 mb-8">
        <div className="rounded-3xl p-6 bg-[#1C1C1E] text-center">
          {!scanned && !scanning && (
            <>
              <p className="font-display font-bold text-white text-lg mb-2">{t("building.find_best")}</p>
              <p className="text-white/50 italic text-sm mb-4">{t("building.ai_scanning", { count: content.brands.length })}</p>
              <button
                onClick={startScan}
                className="px-6 py-3 rounded-2xl font-label font-semibold"
                style={{ background: theme.color, color: theme.textColor }}
              >
                {t("building.launch_analysis")}
              </button>
            </>
          )}
          {scanning && (
            <div className="py-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {content.brands.map((b, i) => {
                  const angle = (i / content.brands.length) * 360;
                  return (
                    <div
                      key={b.name}
                      className="absolute top-1/2 left-1/2 px-2 py-1 bg-white rounded-md text-[10px] font-bold animate-spin-slow"
                      style={{
                        color: b.color,
                        transform: `rotate(${angle}deg) translateY(-60px) rotate(-${angle}deg)`,
                        animation: "spin-slow 6s linear infinite",
                      }}
                    >
                      {b.name}
                    </div>
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <CleoCharacter state="THINKING" size={48} />
                </div>
              </div>
              <p className="text-white/70 italic text-sm">{t("building.analyzing")}</p>
            </div>
          )}
          {scanned && (
            <div className="flex flex-col items-center gap-3 animate-fade-in">
              <p className="font-display font-bold text-xl" style={{ color: theme.color }}>
                {t("building.best_choices")}
              </p>
              <ComparatorButton recos={recos} brands={content.brands} themeColor={theme.color} />
            </div>
          )}
        </div>
      </section>

      {/* D - recommandations */}
      {scanned && (
        <section className="px-5 mb-8 space-y-3 animate-fade-in">
          {recos.map((r, i) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl p-5 transition-transform hover:scale-[1.01]"
              style={{
                background: i === 0 ? "var(--vivid-purple)" : "var(--bg-surface)",
                border: i === 1 ? "1px solid var(--lemon)" : i === 2 ? "1px solid var(--lilac)" : "none",
              }}
            >
              {r.badge && (
                <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-2" style={{ background: "var(--lemon)", color: "#000" }}>
                  {r.badge}
                </div>
              )}
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display font-bold text-white text-lg">{r.name}</h3>
                <div className="flex items-center gap-0.5 text-[var(--lemon)]">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <StarIcon key={k} filled={k < Math.round(r.rating)} size={12} />
                  ))}
                </div>
              </div>
              <p className="text-white/70 italic text-sm mb-3">{r.tagline}</p>
              <div className="grid grid-cols-3 gap-2">
                {r.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg bg-black/30 px-2 py-2">
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">{m.label}</p>
                    <p className="text-white font-bold text-sm">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 inline-block px-4 py-2 rounded-xl text-sm font-label font-semibold" style={{ background: "var(--lemon)", color: "#000" }}>
                {t("building.choose")}
              </div>
            </a>
          ))}
        </section>
      )}

      {/* E - guide */}
      {scanned && (
        <section className="px-5 mb-8 animate-fade-in">
          <h2 className="font-display font-bold text-white text-xl mb-3">{t("building.step_by_step")}</h2>
          <div className="space-y-2">
            {content.guide.map((g, i) => {
              const stepId = `step-${i}`;
              const done = checked.includes(stepId);
              const variant = i % 2 === 0 ? "vivid" : "dark";
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: variant === "vivid" ? `${theme.color}33` : "var(--bg-surface)" }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: theme.color, color: theme.textColor }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label font-semibold text-white text-sm">{g.title}</p>
                    <p className="text-white/60 italic text-xs mt-0.5">{g.body}</p>
                  </div>
                  <button
                    onClick={() => toggleStep(buildingId, stepId)}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      background: done ? "var(--lemon)" : "transparent",
                      border: done ? "none" : "2px solid rgba(255,255,255,0.2)",
                      color: done ? "#000" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {done && <CheckIcon size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* F - tracker */}
      {scanned && (
        <section className="px-5 mb-8 animate-fade-in">
          <h2 className="font-display font-bold text-white text-xl mb-4">{t("building.progression")}</h2>
          <div className="flex items-center justify-between">
            {content.trackerNodes.map((n, i) => {
              const reached = checked.includes(`step-${i}`);
              const nextReached = checked.includes(`step-${i + 1}`);
              return (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: reached ? theme.color : "var(--bg-surface)",
                        color: reached ? theme.textColor : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {reached ? "✓" : i + 1}
                    </div>
                    <span className="text-[10px] font-label text-white/60">{n}</span>
                  </div>
                  {i < content.trackerNodes.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 -mt-4" style={{ background: reached && nextReached ? theme.color : "rgba(255,255,255,0.1)" }} />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* G - finish */}
      {scanned && (
        <section className="px-5 mb-12 animate-fade-in">
          <button
            onClick={finish}
            disabled={isDone}
            className="w-full py-4 rounded-2xl font-display font-bold text-base"
            style={{
              background: isDone ? "var(--bg-surface)" : "var(--lemon)",
              color: isDone ? "rgba(255,255,255,0.4)" : "#000",
            }}
          >
            {isDone ? t("building.already_done") : t("building.mark_done")}
          </button>
        </section>
      )}

      {/* Celebration overlay */}
      {celebrating && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0A0A0A]/95 backdrop-blur animate-fade-in px-6">
          <CleoCharacter state="CELEBRATING" size={100} />
          <h1 className="font-display font-black text-5xl text-center my-6">
            {content.celebration.title.map((w, i) => (
              <span key={i} style={{ color: w.color }}>{w.text}{i < content.celebration.title.length - 1 ? " " : ""}</span>
            ))}
          </h1>
          <div className="px-6 py-4 rounded-2xl" style={{ background: "var(--vivid-purple)", color: "#fff" }}>
            <p className="font-display font-black text-2xl">+<CountUp to={content.celebration.xp} /> XP</p>
          </div>
        </div>
      )}
    </main>
  );
}
