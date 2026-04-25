import { useRouter } from "@tanstack/react-router";
import { IconArrowLeft } from "./Icons";

interface TopBarProps {
  title?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  progress?: { value: number; max: number };
  variant?: "light" | "dark";
  step?: { current: number; total: number };
}

export function TopBar({ title, right, onBack, showBack = true, progress, step }: TopBarProps) {
  const router = useRouter();
  const handleBack = () => (onBack ? onBack() : router.history.back());

  return (
    <div
      className="sticky top-0 z-30 px-5 pb-3 glass-dark"
      style={{ paddingTop: "max(14px, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center gap-3 h-11">
        {showBack ? (
          <button
            onClick={handleBack}
            aria-label="Back"
            className="h-10 w-10 -ml-1 rounded-full flex items-center justify-center transition-all active:scale-95 bg-white-10 text-white"
          >
            <IconArrowLeft size={20} />
          </button>
        ) : (
          <div className="w-2" />
        )}

        {step ? (
          <div className="flex-1 flex items-center justify-center gap-1.5">
            {Array.from({ length: step.total }).map((_, i) => {
              const done = i < step.current - 1;
              const active = i === step.current - 1;
              return (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    active ? "w-7 bg-lemon" : done ? "w-2 bg-lemon/60" : "w-2 bg-navy"
                  }`}
                />
              );
            })}
          </div>
        ) : progress ? (
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white-10">
            <div
              className="h-full bg-lemon rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(progress.value / progress.max) * 100}%` }}
            />
          </div>
        ) : (
          <div className="flex-1 text-center text-[15px] font-bold font-display truncate text-white">
            {title}
          </div>
        )}

        <div className="min-w-[40px] flex justify-end items-center text-white-40 text-[12px] font-ui">
          {step ? `Step ${step.current} of ${step.total}` : right}
        </div>
      </div>
    </div>
  );
}
