import { useState } from "react";
import { useApp, type Biberon } from "@/lib/store";
import { CleoCharacter } from "@/components/CleoCharacter";
import { PlusIcon, CloseIcon } from "@/components/icons";
import { BottomSheet } from "@/components/BottomSheet";
import { CountUp } from "@/components/CountUp";
import { useTranslation } from "react-i18next";

export function ChildrenSection() {
  const { t } = useTranslation();
  const { biberons, addBiberon, addBiberonSavings } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const total = biberons.reduce((s, b) => s + b.savings, 0);

  return (
    <section className="px-5 mb-8">
      <h2 className="font-display font-bold text-white text-xl mb-1">{t("children.title")}</h2>
      <p className="text-white/50 italic text-sm mb-4">{t("children.subtitle")}</p>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x">
        {biberons.map((b) => (
          <BiberonCard key={b.id} biberon={b} onClick={() => setOpenId(b.id)} />
        ))}
        <button
          onClick={() => setOpenAdd(true)}
          className="shrink-0 w-[140px] h-[200px] rounded-2xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 text-white/40 hover:border-[var(--lemon)] hover:text-[var(--lemon)] transition-colors"
        >
          <PlusIcon size={24} />
          <span className="text-xs font-label">{t("children.add")}</span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: "var(--vivid-green)" }}>
        <p className="text-white/80 text-xs uppercase tracking-wider font-label">{t("children.total")}</p>
        <p className="font-display font-black text-white text-3xl mt-1">
          €<CountUp to={total} />
        </p>
      </div>

      <AddSavingsSheet
        open={!!openId}
        onClose={() => setOpenId(null)}
        biberon={biberons.find((b) => b.id === openId)}
        onAdd={(amount) => { if (openId) addBiberonSavings(openId, amount); setOpenId(null); }}
      />
      <AddChildSheet open={openAdd} onClose={() => setOpenAdd(false)} onAdd={(c) => { addBiberon(c); setOpenAdd(false); }} />
    </section>
  );
}

function BiberonCard({ biberon, onClick }: { biberon: Biberon; onClick: () => void }) {
  const pct = Math.min(100, (biberon.savings / biberon.goal) * 100);
  const isFull = pct >= 100;
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-[140px] h-[200px] rounded-2xl bg-[#1C1C1E] p-3 flex flex-col items-center text-center snap-start animate-scale-in"
    >
      <p className="font-display font-bold text-white text-sm leading-tight">{biberon.child_name}</p>
      <p className="text-white/40 text-[10px] italic mb-2">
        {new Date(biberon.date_of_birth).toLocaleDateString("fr-FR")}
      </p>
      {/* biberon SVG */}
      <div className="relative w-[70px] h-[100px]">
        <svg viewBox="0 0 70 100" className="absolute inset-0">
          {/* tétine */}
          <rect x="28" y="0" width="14" height="6" rx="2" fill="#fff" />
          <rect x="22" y="6" width="26" height="8" rx="3" fill="rgba(255,255,255,0.6)" />
          {/* corps */}
          <rect x="14" y="14" width="42" height="80" rx="4" fill="none" stroke="#fff" strokeWidth="2" />
          {/* lait */}
          <defs>
            <clipPath id={`clip-${biberon.id}`}>
              <rect x="16" y="16" width="38" height="76" rx="2" />
            </clipPath>
          </defs>
          <g clipPath={`url(#clip-${biberon.id})`}>
            <rect x="16" y={92 - (76 * pct) / 100} width="38" height={(76 * pct) / 100} fill="var(--lemon)" />
            {/* vague */}
            <path
              d={`M 16 ${92 - (76 * pct) / 100} q 9.5 -4 19 0 t 19 0 v 6 h -38 z`}
              fill="var(--lemon)"
              opacity="0.85"
            >
              <animate attributeName="d" dur="2s" repeatCount="indefinite"
                values={`M 16 ${92 - (76 * pct) / 100} q 9.5 -4 19 0 t 19 0 v 6 h -38 z;
                        M 16 ${92 - (76 * pct) / 100} q 9.5 4 19 0 t 19 0 v 6 h -38 z;
                        M 16 ${92 - (76 * pct) / 100} q 9.5 -4 19 0 t 19 0 v 6 h -38 z`} />
            </path>
          </g>
          {/* graduation marks */}
          {[25, 50, 75].map((g) => (
            <line key={g} x1="16" y1={16 + (76 * (100 - g)) / 100} x2="22" y2={16 + (76 * (100 - g)) / 100} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          ))}
        </svg>
        {isFull && <div className="absolute -top-1 -right-1 text-lg">✨</div>}
      </div>
      <p className="font-label font-bold text-[var(--lemon)] text-sm mt-2">€{biberon.savings.toLocaleString("fr-FR")}</p>
      <p className="text-white/40 text-[10px]">/ €{biberon.goal.toLocaleString("fr-FR")}</p>
    </button>
  );
}

function AddSavingsSheet({ open, onClose, biberon, onAdd }: { open: boolean; onClose: () => void; biberon?: Biberon; onAdd: (amount: number) => void }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [freq, setFreq] = useState<"once" | "monthly">("once");
  if (!biberon) return null;
  return (
    <BottomSheet open={open} onClose={onClose} title={t("children.savings_for", { name: biberon.child_name })} heightPercent={60}>
      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider font-label mb-2 block">{t("children.amount")}</label>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-[#0A0A0A] px-4 py-4 rounded-xl text-white text-2xl font-display font-bold outline-none border-2 border-transparent focus:border-[var(--lemon)]"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider font-label mb-2 block">{t("children.frequency")}</label>
          <div className="flex gap-2">
            {([["once", t("children.once")], ["monthly", t("children.monthly")]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setFreq(id)}
                className="flex-1 py-3 rounded-xl font-label font-medium"
                style={{ background: freq === id ? "var(--lemon)" : "var(--bg-elevated)", color: freq === id ? "#000" : "#fff" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { const n = parseInt(amount, 10); if (n > 0) { onAdd(n); setAmount(""); } }}
          disabled={!amount || parseInt(amount, 10) <= 0}
          className="w-full py-4 rounded-2xl font-display font-bold disabled:opacity-40"
          style={{ background: "var(--lemon)", color: "#000" }}
        >
          {t("children.add_to_savings")}
        </button>
      </div>
    </BottomSheet>
  );
}

function AddChildSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (c: { child_name: string; date_of_birth: string; goal: number }) => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [goal, setGoal] = useState("5000");
  return (
    <BottomSheet open={open} onClose={onClose} title={t("children.new_child")} heightPercent={60}>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("children.firstname")} className="w-full bg-[#0A0A0A] px-4 py-3.5 rounded-xl text-white outline-none border-2 border-transparent focus:border-[var(--lemon)] font-body italic" />
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#0A0A0A] px-4 py-3.5 rounded-xl text-white outline-none border-2 border-transparent focus:border-[var(--lemon)] font-body" />
        <div>
          <label className="text-white/60 text-xs uppercase tracking-wider font-label block mb-2">{t("children.goal")}</label>
          <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-[#0A0A0A] px-4 py-3.5 rounded-xl text-white outline-none border-2 border-transparent focus:border-[var(--lemon)] font-body" />
        </div>
        <button
          onClick={() => { if (name && dob) onAdd({ child_name: name, date_of_birth: dob, goal: parseInt(goal, 10) || 5000 }); }}
          disabled={!name || !dob}
          className="w-full py-4 rounded-2xl font-display font-bold disabled:opacity-40"
          style={{ background: "var(--lemon)", color: "#000" }}
        >
          {t("children.add_btn")}
        </button>
      </div>
    </BottomSheet>
  );
}
