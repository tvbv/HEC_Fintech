import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import { Cleo } from "./Cleo";
import { IconClose } from "./Icons";
import { sendChat, type ChatMessage } from "@/lib/api";
import { useApp } from "@/lib/store";

const HIDE_ON = new Set(["/", "/onboarding", "/loading"]);

const WELCOME: ChatMessage = {
  role: "assistant",
  content: "Hey! I'm Cleo. Ask me anything about banking, admin, visas, taxes — wherever you're headed. I'll look it up in real time.",
};

export function CleoCompanion() {
  const { pathname } = useLocation();
  const { profileId } = useApp();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hidden = HIDE_ON.has(pathname);

  // Auto-open after 8 seconds of inactivity on a page
  useEffect(() => {
    if (hidden) return;
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, [pathname, hidden]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  if (hidden) return null;

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const userMessage: ChatMessage = { role: "user", content: msg };
    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      // Send full history minus the welcome message (which is UI-only)
      const apiHistory = updatedHistory.filter((m) => !(m === WELCOME));
      const { reply } = await sendChat(
        profileId ?? 0,
        msg,
        // exclude the just-added user message from history (it's the current message)
        apiHistory.slice(0, -1),
      );
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch {
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "Oops, I couldn't reach the server. Try again in a sec." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      className="fixed z-30 pointer-events-none"
      style={{
        bottom: "calc(86px + env(safe-area-inset-bottom, 0px))",
        right: "max(12px, calc((100vw - 430px) / 2 + 12px))",
      }}
    >
      <div className="relative pointer-events-auto">

        {/* Chat panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 12, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.93 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[68px] right-0 w-[300px] flex flex-col rounded-[20px] rounded-br-[6px] bg-[#0d0d14] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden"
              style={{ maxHeight: "420px" }}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 bg-[#141420]">
                <div className="scale-75 -ml-1">
                  <Cleo pose="idle" mood="happy" size={36} animated />
                </div>
                <div className="flex-1">
                  <p className="text-white text-[13px] font-bold font-display leading-none">Cleo</p>
                  <p className="text-white/40 text-[11px] font-body mt-0.5">Your relocation concierge</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-full bg-white/8 flex items-center justify-center text-white/60 active:scale-90 transition-transform"
                >
                  <IconClose size={12} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5" style={{ minHeight: 0 }}>
                {history.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-[14px] text-[12.5px] font-body leading-snug ${
                        msg.role === "user"
                          ? "bg-lemon text-black rounded-br-[4px]"
                          : "bg-white/8 text-white rounded-bl-[4px]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="px-3.5 py-2.5 rounded-[14px] rounded-bl-[4px] bg-white/8">
                      <span className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-white/40"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-2.5 border-t border-white/8 bg-[#141420] flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Cleo anything..."
                  disabled={loading}
                  className="flex-1 h-9 px-3 rounded-[10px] bg-white/8 text-white text-[12.5px] font-body placeholder:text-white/30 outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="h-9 w-9 rounded-[10px] bg-lemon flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M13 1L1 7l5 1.5L7 13l6-12z" fill="black" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Cleo button */}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -4, 0] }}
          transition={{ y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }}
          className="relative h-14 w-14 rounded-full bg-lemon flex items-center justify-center shadow-lemon"
          style={{ border: "2px solid #000" }}
          aria-label="Open Cleo chat"
        >
          <span className="absolute inset-0 rounded-full animate-pulse-lemon pointer-events-none" />
          <div className="scale-[0.7]">
            <Cleo pose="idle" mood="happy" size={56} animated />
          </div>
        </motion.button>

      </div>
    </div>
  );
}
