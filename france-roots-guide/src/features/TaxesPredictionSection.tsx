import { useApp } from "@/lib/store";
import { CountUp } from "@/components/CountUp";

const FR_MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function lastNMonths(n: number): string[] {
  const out: string[] = []; const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${FR_MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  }
  return out;
}

// Barème impôt 2024 simplifié (célibataire)
const BRACKETS = [
  { up: 11294, rate: 0 },
  { up: 28797, rate: 0.11 },
  { up: 82341, rate: 0.30 },
  { up: 177106, rate: 0.41 },
  { up: Infinity, rate: 0.45 },
];

function computeTax(annualNet: number) {
  // estimation : on convertit net → revenu imposable en gros (× 0.9 abattement 10%)
  const taxable = Math.max(0, annualNet * 0.9);
  let tax = 0; let prev = 0; let marginal = 0;
  for (const b of BRACKETS) {
    if (taxable > b.up) {
      tax += (b.up - prev) * b.rate; prev = b.up; marginal = b.rate;
    } else {
      tax += (taxable - prev) * b.rate; marginal = b.rate; break;
    }
  }
  const avgRate = taxable > 0 ? tax / taxable : 0;
  return { tax: Math.max(0, Math.round(tax)), avgRate, marginal };
}

const STEPS = [
  { title: "Demande ton numéro fiscal (SPI)", body: "Au SIP local ou via impots.gouv.fr — formulaire 2043. Délai : 15j." },
  { title: "Crée ton espace particulier", body: "Sur impots.gouv.fr avec ton SPI + référence d'avis." },
  { title: "Première déclaration en mai", body: "Tous tes revenus mondiaux. Conventions fiscales évitent la double imposition." },
  { title: "Choisis ton mode de paiement", body: "Mensualisation ou trimestrialisation à activer dans ton espace." },
  { title: "Ajuste ton taux à la source", body: "Personnalisé, neutre ou individualisé pour les couples." },
];

export function TaxesPredictionSection() {
  const { payslips } = useApp();
  const months = lastNMonths(12);
  const uploaded = months.map((m) => payslips[m]).filter((p) => p?.uploaded);
  const monthsCount = uploaded.length;
  const avgNet = monthsCount ? uploaded.reduce((s, p) => s + (p?.net ?? 0), 0) / monthsCount : 0;
  const annualNet = Math.round(avgNet * 12);
  const { tax, avgRate, marginal } = computeTax(annualNet);

  return (
    <section className="px-5 mb-8">
      <h2 className="font-display font-bold text-white text-xl mb-1">Ta projection impôts</h2>
      <p className="text-white/50 italic text-sm mb-4">
        {monthsCount > 0 ? `Basée sur ${monthsCount} bulletin(s) uploadé(s).` : "Upload tes bulletins dans Travail pour activer la projection."}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-4" style={{ background: "var(--lilac)" }}>
          <p className="text-black/60 text-[10px] uppercase tracking-wider font-label">Revenu annuel</p>
          <p className="font-display font-black text-black text-2xl">€<CountUp to={annualNet} /></p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "var(--vivid-orange)" }}>
          <p className="text-white/80 text-[10px] uppercase tracking-wider font-label">Impôt estimé</p>
          <p className="font-display font-black text-white text-2xl">€<CountUp to={tax} /></p>
        </div>
        <div className="rounded-2xl p-4 bg-[#1C1C1E]">
          <p className="text-white/50 text-[10px] uppercase tracking-wider font-label">Taux moyen</p>
          <p className="font-display font-black text-white text-2xl">{(avgRate * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl p-4 bg-[#1C1C1E]">
          <p className="text-white/50 text-[10px] uppercase tracking-wider font-label">Taux marginal</p>
          <p className="font-display font-black text-white text-2xl">{(marginal * 100).toFixed(0)}%</p>
        </div>
      </div>

      <h3 className="font-display font-bold text-white mb-2 mt-6">Étapes officielles</h3>
      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 bg-[#1C1C1E] flex items-start gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "var(--lilac)", color: "#000" }}>{i + 1}</div>
            <div>
              <p className="font-label font-semibold text-white text-sm">{s.title}</p>
              <p className="text-white/60 italic text-xs mt-0.5">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
