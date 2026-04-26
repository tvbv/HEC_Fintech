import { useEffect } from "react";
import { CloseIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  heightPercent?: number;
}

export function BottomSheet({ open, onClose, children, title, heightPercent = 80 }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-[#1C1C1E] rounded-t-[28px] flex flex-col overflow-hidden animate-slide-in-right"
        style={{ height: `${heightPercent}vh`, animation: "slide-in-right 0.42s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="flex items-center justify-between p-5 pb-3 shrink-0">
          <div className="flex-1">
            {title && <h2 className="font-display font-bold text-xl text-white">{title}</h2>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
