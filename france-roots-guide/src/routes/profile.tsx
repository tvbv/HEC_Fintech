import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { CleoCharacter } from "@/components/CleoCharacter";
import { BottomNav } from "@/components/BottomNav";
import { BottomSheet } from "@/components/BottomSheet";
import { DocIcon, ChevronIcon, UploadIcon } from "@/components/icons";
import { FRANCE_REGIONS } from "@/components/FranceMap";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profil — Concierge" }] }),
  component: Profile,
});

const HOW_TO: Record<string, { steps: string[]; where: string; delay: string }> = {
  "Carte d'identité": { where: "Mairie ou France Identité (app)", delay: "3-6 semaines", steps: [
    "Prendre RDV en mairie (rdv-mairie.fr)",
    "Pré-remplir en ligne sur ants.gouv.fr",
    "Apporter : justificatif domicile, photos, ancien titre",
    "Récupérer en mairie sur convocation",
  ]},
  "Passeport": { where: "Mairie habilitée", delay: "4-8 semaines", steps: [
    "Pré-demande en ligne sur ants.gouv.fr",
    "Acheter timbre fiscal (86 € adulte)",
    "RDV mairie avec photos + justif domicile",
    "Retrait sur convocation SMS",
  ]},
  "Visa": { where: "Consulat France pays d'origine", delay: "2-12 semaines", steps: [
    "Identifier ton type de visa sur france-visas.gouv.fr",
    "Constituer le dossier (revenus, motif, assurance)",
    "RDV consulat / VFS",
    "Récupérer ton visa apposé sur passeport",
  ]},
  "Titre de séjour": { where: "Préfecture ou ANEF", delay: "2-6 mois", steps: [
    "Démarche en ligne sur administration-etrangers-en-france.interieur.gouv.fr",
    "Apporter passeport + photos + justif + acte naissance traduit",
    "Payer timbres fiscaux (200 € env.)",
    "Recevoir récépissé puis carte par courrier sécurisé",
  ]},
  "Justificatif de domicile": { where: "Fournisseur (EDF, SFR, bailleur)", delay: "Immédiat", steps: [
    "Télécharger une facture <3 mois (EDF, internet, mobile)",
    "Ou attestation d'hébergement + ID hébergeant + son justif",
    "Ou quittance de loyer signée bailleur",
  ]},
  "RIB français": { where: "Ta banque", delay: "Immédiat après ouverture", steps: [
    "Ouvrir un compte (voir bâtiment Banque)",
    "Récupérer le RIB PDF dans l'app",
    "Imprimer ou partager via lien",
  ]},
  "Numéro fiscal (SPI)": { where: "Centre des Finances Publiques", delay: "5-15 jours", steps: [
    "Aller sur impots.gouv.fr → 'Demande d'accès'",
    "Remplir formulaire 2043 ou 2042",
    "Joindre ID + justif domicile + acte de naissance",
    "Recevoir SPI par courrier",
    "Activer espace en ligne sur impots.gouv.fr",
  ]},
  "Attestation employeur": { where: "Service RH", delay: "1-7 jours", steps: [
    "Demander par mail au RH",
    "Préciser l'usage (logement, banque, visa)",
    "Récupérer signée + tampon",
  ]},
  "Carte Vitale": { where: "CPAM (Sécurité sociale)", delay: "1-3 mois", steps: [
    "Créer compte ameli.fr",
    "Envoyer formulaire S1106 + RIB + ID + acte naissance",
    "Recevoir n° provisoire de Sécu",
    "Photo + courrier de la CPAM = Carte Vitale",
  ]},
  "Acte de naissance": { where: "Mairie de naissance / SCEC Nantes", delay: "1-3 semaines", steps: [
    "Demande en ligne service-public.fr",
    "Préciser : copie intégrale, extrait avec/sans filiation",
    "Apostille ou traduction si étranger",
    "Recevoir par courrier",
  ]},
  "Permis de conduire": { where: "ANTS ou auto-école", delay: "2-3 mois", steps: [
    "Étranger : demande d'échange dans l'année (ants.gouv.fr)",
    "FR : inscription auto-école, code (~30€), conduite (~1500€)",
    "Examen théorique puis pratique",
    "Permis dématérialisé puis envoyé",
  ]},
  "Casier judiciaire (B3)": { where: "Casier Judiciaire National", delay: "1-2 semaines", steps: [
    "Demande gratuite sur casier-judiciaire.justice.gouv.fr",
    "Renseigner état civil + lieu de naissance",
    "Recevoir bulletin par courrier ou téléchargement",
  ]},
  "Diplômes traduits": { where: "Traducteur assermenté", delay: "1-3 semaines", steps: [
    "Trouver traducteur sur annuaire-traducteur-assermente.fr",
    "Envoyer scan diplômes",
    "Récupérer traduction tamponnée",
    "Demander reconnaissance via ENIC-NARIC France",
  ]},
  "Numéro de Sécu provisoire": { where: "CPAM", delay: "Immédiat", steps: [
    "Aller en CPAM avec ID + acte naissance",
    "Récupérer NIR provisoire (commence par 7 ou 8)",
    "Utilisable immédiatement chez médecins",
  ]},
};

function Profile() {
  const navigate = useNavigate();
  const { onboarding, uploadedDocuments, removeDocument, addDocument, reset, setOnboarding } = useApp();
  const [openMyDocs, setOpenMyDocs] = useState(false);
  const [openHowTo, setOpenHowTo] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((f) => {
      if (f.size > 10 * 1024 * 1024) return;
      if (!/\.(pdf|jpg|jpeg|png|webp|txt)$/i.test(f.name)) return;
      addDocument({ name: f.name, type: "official" });
    });
  };

  const initial = (onboarding.first_name ?? "?")[0]?.toUpperCase();

  return (
    <main className="min-h-screen pb-28 bg-[#0A0A0A]">
      <header className="px-5 pt-8 pb-6 rounded-b-[32px]" style={{ background: "var(--vivid-purple)" }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-display font-black text-2xl" style={{ background: "var(--lemon)", color: "#000" }}>
            {initial}
          </div>
          <div className="flex-1">
            <p className="font-display font-black text-white text-2xl">
              {onboarding.first_name ?? "Toi"} {onboarding.last_name ?? ""}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-label">Niveau Explorer</span>
          </div>
          <CleoCharacter state="IDLE" size={48} />
        </div>
      </header>

      <section className="px-5 mt-6 space-y-3">
        <button onClick={() => setOpenMyDocs(true)} className="w-full rounded-2xl p-4 bg-[#1C1C1E] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--lemon)]" style={{ background: "rgba(248,255,161,0.1)" }}>
            <DocIcon />
          </div>
          <div className="flex-1 text-left">
            <p className="font-label font-semibold text-white">Mes documents</p>
            <p className="text-white/50 italic text-xs">{uploadedDocuments.length} fichier(s) — tap pour gérer & uploader</p>
          </div>
          <ChevronIcon className="text-white/40" />
        </button>

        <button onClick={() => setOpenHowTo(true)} className="w-full rounded-2xl p-4 bg-[#1C1C1E] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--lilac)]" style={{ background: "rgba(168,163,248,0.12)" }}>
            ?
          </div>
          <div className="flex-1 text-left">
            <p className="font-label font-semibold text-white">Comment obtenir mes documents</p>
            <p className="text-white/50 italic text-xs">{Object.keys(HOW_TO).length} guides pas-à-pas</p>
          </div>
          <ChevronIcon className="text-white/40" />
        </button>
      </section>

      <section className="px-5 mt-6 space-y-2">
        {[
          { label: "Langue", val: "Français" },
          { label: "Confidentialité", val: "→" },
          { label: "Aide", val: "→" },
          { label: "Modifier le profil", val: "→", action: () => setOpenEdit(true) },
        ].map((r) => (
          <button key={r.label} onClick={r.action} className="w-full rounded-xl p-4 bg-[#1C1C1E] flex items-center justify-between">
            <span className="font-label text-white text-sm">{r.label}</span>
            <span className="text-white/40 text-sm">{r.val}</span>
          </button>
        ))}
        <button onClick={() => { reset(); navigate({ to: "/" }); }} className="w-full rounded-xl p-4 text-center font-label font-semibold" style={{ background: "rgba(255,59,48,0.15)", color: "var(--vivid-red)" }}>
          Réinitialiser & déconnexion
        </button>
      </section>

      <BottomSheet open={openMyDocs} onClose={() => setOpenMyDocs(false)} title="Mes documents">
        <label className="block rounded-2xl p-5 text-center cursor-pointer mb-4"
          style={{ background: "var(--bg-elevated)", border: "2px dashed var(--lemon)" }}>
          <input type="file" multiple className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <UploadIcon className="text-[var(--lemon)] mx-auto mb-2" size={24} />
          <p className="font-label font-semibold text-white text-sm">Ajouter des documents</p>
          <p className="text-white/40 text-xs italic mt-1">Multi-fichiers — PDF, JPG, PNG, WEBP — 10 MB max</p>
        </label>
        {uploadedDocuments.length === 0 ? (
          <p className="text-white/50 italic text-sm">Aucun document uploadé pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {uploadedDocuments.map((d) => (
              <div key={d.id} className="rounded-xl p-3 bg-[#0A0A0A] flex items-center gap-3">
                <DocIcon className="text-[var(--lemon)]" />
                <div className="flex-1 min-w-0">
                  <p className="font-label font-semibold text-white text-sm truncate">{d.name}</p>
                  <p className="text-[var(--vivid-green)] text-xs">Analysé IA ✓</p>
                </div>
                <button onClick={() => removeDocument(d.id)} className="text-[var(--vivid-red)] text-xs font-label">Supprimer</button>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={openHowTo} onClose={() => setOpenHowTo(false)} title="Comment obtenir mes documents">
        <div className="space-y-2">
          {Object.entries(HOW_TO).map(([doc, info]) => {
            const has = uploadedDocuments.some((u) => u.name.toLowerCase().includes(doc.toLowerCase().slice(0, 4)));
            const isOpen = expanded === doc;
            return (
              <div key={doc} className="rounded-xl overflow-hidden" style={{ background: has ? "var(--vivid-green)" : "#1C1C1E" }}>
                <button onClick={() => setExpanded(isOpen ? null : doc)} className="w-full p-3 flex items-center justify-between text-left">
                  <span className="font-label font-semibold text-white text-sm">{has && "✓ "}{doc}</span>
                  <ChevronIcon size={14} className={`text-white/60 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 bg-black/20">
                    <div className="flex gap-3 mb-3 mt-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white/80">📍 {info.where}</span>
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white/80">⏱ {info.delay}</span>
                    </div>
                    <ol className="space-y-2">
                      {info.steps.map((s, i) => (
                        <li key={i} className="text-white/80 text-xs italic flex gap-2">
                          <span className="font-bold text-[var(--lemon)] not-italic">{i + 1}.</span>{s}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      <BottomSheet open={openEdit} onClose={() => setOpenEdit(false)} title="Modifier le profil">
        <EditForm onboarding={onboarding} setOnboarding={setOnboarding} />
      </BottomSheet>

      <BottomNav />
    </main>
  );
}

const EMPLOYMENT_OPTIONS = [
  { id: "salaried", label: "Salarié·e", emoji: "💼" },
  { id: "freelance", label: "Freelance", emoji: "🚀" },
  { id: "student", label: "Étudiant·e", emoji: "🎓" },
  { id: "searching", label: "Recherche d'emploi", emoji: "🔍" },
];

const NATIONALITIES_SHORT = [
  { code: "FR", flag: "🇫🇷" }, { code: "UA", flag: "🇺🇦" }, { code: "US", flag: "🇺🇸" },
  { code: "GB", flag: "🇬🇧" }, { code: "DE", flag: "🇩🇪" }, { code: "ES", flag: "🇪🇸" },
  { code: "IT", flag: "🇮🇹" }, { code: "PT", flag: "🇵🇹" }, { code: "MA", flag: "🇲🇦" }, { code: "DZ", flag: "🇩🇿" },
];

function EditForm({ onboarding, setOnboarding }: { onboarding: any; setOnboarding: (d: any) => void }) {
  const [saved, setSaved] = useState(false);
  const region = FRANCE_REGIONS.find((r) => r.id === onboarding.region);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-white/50 italic text-xs">Prénom</label>
        <input value={onboarding.first_name ?? ""} onChange={(e) => setOnboarding({ first_name: e.target.value })}
          className="w-full mt-1 bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none focus:border-[var(--lemon)]" />
      </div>
      <div>
        <label className="text-white/50 italic text-xs">Nom</label>
        <input value={onboarding.last_name ?? ""} onChange={(e) => setOnboarding({ last_name: e.target.value })}
          className="w-full mt-1 bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none focus:border-[var(--lemon)]" />
      </div>
      <div>
        <label className="text-white/50 italic text-xs">Date de naissance</label>
        <input type="date" value={onboarding.date_of_birth ?? ""} onChange={(e) => setOnboarding({ date_of_birth: e.target.value })}
          className="w-full mt-1 bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none focus:border-[var(--lemon)]" />
      </div>

      <div>
        <label className="text-white/50 italic text-xs mb-2 block">Nationalité</label>
        <div className="flex flex-wrap gap-2">
          {NATIONALITIES_SHORT.map((n) => {
            const active = onboarding.nationality === n.code;
            return (
              <button key={n.code} onClick={() => setOnboarding({ nationality: n.code })}
                className="px-3 py-2 rounded-full text-lg transition-all"
                style={{ background: active ? "var(--lemon)" : "var(--bg-elevated)" }}>
                {n.flag}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-white/50 italic text-xs mb-2 block">Région & ville</label>
        <select value={onboarding.region ?? ""} onChange={(e) => setOnboarding({ region: e.target.value, city: "" })}
          className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none">
          <option value="">— Choisir une région —</option>
          {FRANCE_REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {region && (
          <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
            {region.cities.map((c) => {
              const active = onboarding.city === c;
              return (
                <button key={c} onClick={() => setOnboarding({ city: c })}
                  className="px-3 py-1.5 rounded-full text-xs font-label"
                  style={{ background: active ? "var(--lemon)" : "var(--bg-elevated)", color: active ? "#000" : "#fff" }}>
                  {active ? "✓ " : ""}{c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="text-white/50 italic text-xs mb-2 block">Statut</label>
        <div className="grid grid-cols-2 gap-2">
          {EMPLOYMENT_OPTIONS.map((opt) => {
            const active = onboarding.employment_status === opt.id;
            return (
              <button key={opt.id}
                onClick={() => setOnboarding({ employment_status: opt.id, is_job_seeking: opt.id === "searching" })}
                className="rounded-xl p-3 text-left flex items-center gap-2 transition-all"
                style={{ background: active ? "var(--lemon)" : "var(--bg-elevated)", color: active ? "#000" : "#fff" }}>
                <span className="text-lg">{opt.emoji}</span>
                <span className="font-label font-medium text-sm">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {onboarding.is_job_seeking && (
          <p className="text-white/60 italic text-xs mt-2 animate-fade-in">
            🔍 On ne te demandera plus de bulletin de paie pour les mois sans activité.
          </p>
        )}
      </div>

      <button onClick={save}
        className="w-full py-3.5 rounded-2xl font-label font-semibold transition-all"
        style={{ background: saved ? "var(--vivid-green)" : "var(--lemon)", color: saved ? "#fff" : "#000" }}>
        {saved ? "✓ Enregistré" : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
