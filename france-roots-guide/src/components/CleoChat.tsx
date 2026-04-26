import { useState, useRef, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { useApp } from "@/lib/store";
import { CleoCharacter } from "./CleoCharacter";
import { CloseIcon } from "./icons";
import { chatWithCleo } from "@/utils/chat.functions";

const HIDDEN_ROUTES = ["/", "/onboarding", "/generating"];

export function CleoChat() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { chatMessages, appendChat, onboarding, completedBuildings, uploadedDocuments, userBenefits } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, open]);

  if (HIDDEN_ROUTES.includes(loc.pathname)) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    appendChat({ role: "user", content: text, ts: Date.now() });
    setLoading(true);
    try {
      const res = await chatWithCleo({
        data: {
          messages: [...chatMessages, { role: "user" as const, content: text }].map(({ role, content }) => ({ role, content })),
          context: {
            first_name: onboarding.first_name,
            nationality: onboarding.nationality,
            employment_status: onboarding.employment_status,
            completed_buildings: completedBuildings,
            documents_count: uploadedDocuments.length,
            benefits: userBenefits.map((b) => b.name),
          },
        },
      });
      if (res.reply) appendChat({ role: "assistant", content: res.reply, ts: Date.now() });
      else appendChat({ role: "assistant", content: `Désolé, ${res.error}`, ts: Date.now() });
    } catch {
      appendChat({ role: "assistant", content: "Oups, j'ai eu un souci réseau.", ts: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl animate-float"
          style={{ background: "var(--lemon)", boxShadow: "0 0 25px rgba(248,255,161,0.5)" }}
          aria-label="Ouvrir le chat"
        >
          <CleoCharacter state="IDLE" size={42} />
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-md h-[80vh] bg-[#1C1C1E] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-fade-in">
            <header className="flex items-center gap-3 p-4 border-b border-white/5">
              <CleoCharacter state="TALKING" size={38} />
              <div className="flex-1">
                <p className="font-display font-bold text-white">Cléo</p>
                <p className="text-white/40 italic text-xs">Ta concierge IA</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
                <CloseIcon size={18} />
              </button>
            </header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/60 italic text-sm mb-4">Salut {onboarding.first_name ?? "toi"} 👋<br/>Demande-moi n'importe quoi sur ton installation en France.</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Comment avoir un RIB ?", "C'est quoi le SPI ?", "J'ai droit aux APL ?"].map((q) => (
                      <button key={q} onClick={() => setInput(q)} className="px-3 py-1.5 rounded-full text-xs bg-white/10 text-white">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                    style={{
                      background: m.role === "user" ? "var(--lemon)" : "var(--bg-elevated)",
                      color: m.role === "user" ? "#000" : "#fff",
                    }}
                  >
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_a]:text-[var(--lilac)]">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-[var(--bg-elevated)] flex gap-1">
                    {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-white/5 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Écris à Cléo…"
                className="flex-1 bg-[#0A0A0A] rounded-full px-4 py-3 text-white placeholder:text-white/30 outline-none text-sm"
                maxLength={500}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="px-5 rounded-full font-label font-semibold text-sm disabled:opacity-40"
                style={{ background: "var(--lemon)", color: "#000" }}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
