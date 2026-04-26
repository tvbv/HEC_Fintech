import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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

interface HowToEntry { steps: string[]; where: string; delay: string }

const HOW_TO_DATA: Record<string, { fr: HowToEntry; en: HowToEntry }> = {
  "Carte d'identité / ID Card": {
    fr: { where: "Mairie ou France Identité (app)", delay: "3-6 semaines", steps: [
      "Prendre RDV en mairie (rdv-mairie.fr)",
      "Pré-remplir en ligne sur ants.gouv.fr",
      "Apporter : justificatif domicile, photos, ancien titre",
      "Récupérer en mairie sur convocation",
    ]},
    en: { where: "Town hall or France Identité app", delay: "3-6 weeks", steps: [
      "Book an appointment at the town hall (rdv-mairie.fr)",
      "Pre-fill the form online at ants.gouv.fr",
      "Bring: proof of address, photos, old ID",
      "Collect at the town hall on notification",
    ]},
  },
  "Passeport / Passport": {
    fr: { where: "Mairie habilitée", delay: "4-8 semaines", steps: [
      "Pré-demande en ligne sur ants.gouv.fr",
      "Acheter timbre fiscal (86 € adulte)",
      "RDV mairie avec photos + justif domicile",
      "Retrait sur convocation SMS",
    ]},
    en: { where: "Authorised town hall", delay: "4-8 weeks", steps: [
      "Start online application at ants.gouv.fr",
      "Buy tax stamp (€86 adult)",
      "Town hall appointment with photos + proof of address",
      "Collect on SMS notification",
    ]},
  },
  "Visa": {
    fr: { where: "Consulat France pays d'origine", delay: "2-12 semaines", steps: [
      "Identifier ton type de visa sur france-visas.gouv.fr",
      "Constituer le dossier (revenus, motif, assurance)",
      "RDV consulat / VFS",
      "Récupérer ton visa apposé sur passeport",
    ]},
    en: { where: "French consulate in home country", delay: "2-12 weeks", steps: [
      "Identify your visa type at france-visas.gouv.fr",
      "Build your file (income, purpose, insurance)",
      "Book consulate / VFS appointment",
      "Collect visa stamped on passport",
    ]},
  },
  "Titre de séjour / Residence permit": {
    fr: { where: "Préfecture ou ANEF", delay: "2-6 mois", steps: [
      "Démarche en ligne sur administration-etrangers-en-france.interieur.gouv.fr",
      "Apporter passeport + photos + justif + acte naissance traduit",
      "Payer timbres fiscaux (200 € env.)",
      "Recevoir récépissé puis carte par courrier sécurisé",
    ]},
    en: { where: "Préfecture or ANEF online", delay: "2-6 months", steps: [
      "Apply online at administration-etrangers-en-france.interieur.gouv.fr",
      "Bring passport + photos + proof of address + translated birth certificate",
      "Pay tax stamps (~€200)",
      "Receive receipt then card by secure mail",
    ]},
  },
  "Justificatif de domicile / Proof of address": {
    fr: { where: "Fournisseur (EDF, SFR, bailleur)", delay: "Immédiat", steps: [
      "Télécharger une facture <3 mois (EDF, internet, mobile)",
      "Ou attestation d'hébergement + ID hébergeant + son justif",
      "Ou quittance de loyer signée bailleur",
    ]},
    en: { where: "Utility provider or landlord", delay: "Immediate", steps: [
      "Download a bill <3 months old (EDF, internet, mobile)",
      "Or host certificate + host ID + their proof of address",
      "Or signed rent receipt from landlord",
    ]},
  },
  "RIB / Bank details": {
    fr: { where: "Ta banque", delay: "Immédiat après ouverture", steps: [
      "Ouvrir un compte (voir bâtiment Banque)",
      "Récupérer le RIB PDF dans l'app",
      "Imprimer ou partager via lien",
    ]},
    en: { where: "Your bank", delay: "Immediate after opening", steps: [
      "Open an account (see Bank building)",
      "Download the RIB PDF in the app",
      "Print or share via link",
    ]},
  },
  "Numéro fiscal / Tax number": {
    fr: { where: "Centre des Finances Publiques", delay: "5-15 jours", steps: [
      "Aller sur impots.gouv.fr → 'Demande d'accès'",
      "Remplir formulaire 2043 ou 2042",
      "Joindre ID + justif domicile + acte de naissance",
      "Recevoir SPI par courrier",
      "Activer espace en ligne sur impots.gouv.fr",
    ]},
    en: { where: "Tax office (Centre des Finances Publiques)", delay: "5-15 days", steps: [
      "Go to impots.gouv.fr → 'Demande d'accès'",
      "Fill in form 2043 or 2042",
      "Attach ID + proof of address + birth certificate",
      "Receive tax number by post",
      "Activate online account at impots.gouv.fr",
    ]},
  },
  "Attestation employeur / Employer certificate": {
    fr: { where: "Service RH", delay: "1-7 jours", steps: [
      "Demander par mail au RH",
      "Préciser l'usage (logement, banque, visa)",
      "Récupérer signée + tampon",
    ]},
    en: { where: "HR department", delay: "1-7 days", steps: [
      "Request by email from HR",
      "Specify the purpose (housing, bank, visa)",
      "Collect signed with company stamp",
    ]},
  },
  "Carte Vitale / Health card": {
    fr: { where: "CPAM (Sécurité sociale)", delay: "1-3 mois", steps: [
      "Créer compte ameli.fr",
      "Envoyer formulaire S1106 + RIB + ID + acte naissance",
      "Recevoir n° provisoire de Sécu",
      "Photo + courrier de la CPAM = Carte Vitale",
    ]},
    en: { where: "CPAM (Social Security)", delay: "1-3 months", steps: [
      "Create account on ameli.fr",
      "Send form S1106 + bank details + ID + birth certificate",
      "Receive provisional Social Security number",
      "Photo + CPAM letter = Carte Vitale",
    ]},
  },
  "Acte de naissance / Birth certificate": {
    fr: { where: "Mairie de naissance / SCEC Nantes", delay: "1-3 semaines", steps: [
      "Demande en ligne service-public.fr",
      "Préciser : copie intégrale, extrait avec/sans filiation",
      "Apostille ou traduction si étranger",
      "Recevoir par courrier",
    ]},
    en: { where: "Town hall of birth / SCEC Nantes", delay: "1-3 weeks", steps: [
      "Request online at service-public.fr",
      "Specify: full copy or extract with/without parentage",
      "Apostille or translation if foreign",
      "Receive by post",
    ]},
  },
  "Permis de conduire / Driving licence": {
    fr: { where: "ANTS ou auto-école", delay: "2-3 mois", steps: [
      "Étranger : demande d'échange dans l'année (ants.gouv.fr)",
      "FR : inscription auto-école, code (~30€), conduite (~1500€)",
      "Examen théorique puis pratique",
      "Permis dématérialisé puis envoyé",
    ]},
    en: { where: "ANTS or driving school", delay: "2-3 months", steps: [
      "Foreign licence: request exchange within the year (ants.gouv.fr)",
      "French licence: driving school, theory test (~€30), practical (~€1500)",
      "Theory then practical exam",
      "Digital licence then posted",
    ]},
  },
  "Casier judiciaire / Criminal record": {
    fr: { where: "Casier Judiciaire National", delay: "1-2 semaines", steps: [
      "Demande gratuite sur casier-judiciaire.justice.gouv.fr",
      "Renseigner état civil + lieu de naissance",
      "Recevoir bulletin par courrier ou téléchargement",
    ]},
    en: { where: "National Criminal Record Office", delay: "1-2 weeks", steps: [
      "Free request at casier-judiciaire.justice.gouv.fr",
      "Enter civil status + place of birth",
      "Receive certificate by post or download",
    ]},
  },
  "Diplômes traduits / Translated diplomas": {
    fr: { where: "Traducteur assermenté", delay: "1-3 semaines", steps: [
      "Trouver traducteur sur annuaire-traducteur-assermente.fr",
      "Envoyer scan diplômes",
      "Récupérer traduction tamponnée",
      "Demander reconnaissance via ENIC-NARIC France",
    ]},
    en: { where: "Certified translator", delay: "1-3 weeks", steps: [
      "Find a translator at annuaire-traducteur-assermente.fr",
      "Send scanned diplomas",
      "Collect stamped translation",
      "Request recognition via ENIC-NARIC France",
    ]},
  },
  "Numéro de Sécu provisoire / Provisional SS number": {
    fr: { where: "CPAM", delay: "Immédiat", steps: [
      "Aller en CPAM avec ID + acte naissance",
      "Récupérer NIR provisoire (commence par 7 ou 8)",
      "Utilisable immédiatement chez médecins",
    ]},
    en: { where: "CPAM", delay: "Immediate", steps: [
      "Go to CPAM with ID + birth certificate",
      "Receive provisional NIR number (starts with 7 or 8)",
      "Usable immediately at doctors",
    ]},
  },
};

const EMPLOYMENT_OPTIONS_DATA = [
  { id: "salaried", labelFr: "Salarié·e", labelEn: "Employed", emoji: "💼" },
  { id: "freelance", labelFr: "Freelance", labelEn: "Freelance", emoji: "🚀" },
  { id: "student", labelFr: "Étudiant·e", labelEn: "Student", emoji: "🎓" },
  { id: "searching", labelFr: "Recherche d'emploi", labelEn: "Job-seeking", emoji: "🔍" },
];

const NATIONALITIES_SHORT = [
  { code: "FR", flag: "🇫🇷" }, { code: "UA", flag: "🇺🇦" }, { code: "US", flag: "🇺🇸" },
  { code: "GB", flag: "🇬🇧" }, { code: "DE", flag: "🇩🇪" }, { code: "ES", flag: "🇪🇸" },
  { code: "IT", flag: "🇮🇹" }, { code: "PT", flag: "🇵🇹" }, { code: "MA", flag: "🇲🇦" }, { code: "DZ", flag: "🇩🇿" },
];

function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { onboarding, uploadedDocuments, removeDocument, addDocument, reset, setOnboarding } = useApp();
  const [openMyDocs, setOpenMyDocs] = useState(false);
  const [openHowTo, setOpenHowTo] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const lang = i18n.language === "en" ? "en" : "fr";

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((f) => {
      if (f.size > 10 * 1024 * 1024) return;
      if (!/\.(pdf|jpg|jpeg|png|webp|txt)$/i.test(f.name)) return;
      addDocument({ name: f.name, type: "official" });
    });
  };

  const initial = (onboarding.first_name ?? "?")[0]?.toUpperCase();
  const howToCount = Object.keys(HOW_TO_DATA).length;

  return (
    <main className="min-h-screen pb-28 bg-[#0A0A0A]">
      <header className="px-5 pt-8 pb-6 rounded-b-[32px]" style={{ background: "var(--vivid-purple)" }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-display font-black text-2xl" style={{ background: "var(--lemon)", color: "#000" }}>
            {initial}
          </div>
          <div className="flex-1">
            <p className="font-display font-black text-white text-2xl">
              {onboarding.first_name ?? "You"} {onboarding.last_name ?? ""}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-label">{t("profile.level")}</span>
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
            <p className="font-label font-semibold text-white">{t("profile.my_docs")}</p>
            <p className="text-white/50 italic text-xs">{t("profile.my_docs_sub", { count: uploadedDocuments.length })}</p>
          </div>
          <ChevronIcon className="text-white/40" />
        </button>

        <button onClick={() => setOpenHowTo(true)} className="w-full rounded-2xl p-4 bg-[#1C1C1E] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--lilac)]" style={{ background: "rgba(168,163,248,0.12)" }}>
            ?
          </div>
          <div className="flex-1 text-left">
            <p className="font-label font-semibold text-white">{t("profile.how_to")}</p>
            <p className="text-white/50 italic text-xs">{t("profile.how_to_sub", { count: howToCount })}</p>
          </div>
          <ChevronIcon className="text-white/40" />
        </button>
      </section>

      <section className="px-5 mt-6 space-y-2">
        {[
          { labelKey: "profile.lang_label", val: t("profile.lang_value") },
          { labelKey: "profile.privacy", val: "→" },
          { labelKey: "profile.help", val: "→" },
          { labelKey: "profile.edit_profile", val: "→", action: () => setOpenEdit(true) },
        ].map((r) => (
          <button key={r.labelKey} onClick={r.action} className="w-full rounded-xl p-4 bg-[#1C1C1E] flex items-center justify-between">
            <span className="font-label text-white text-sm">{t(r.labelKey)}</span>
            <span className="text-white/40 text-sm">{r.val}</span>
          </button>
        ))}
        <button
          onClick={() => { reset(); navigate({ to: "/" }); }}
          className="w-full rounded-xl p-4 text-center font-label font-semibold"
          style={{ background: "rgba(255,59,48,0.15)", color: "var(--vivid-red)" }}>
          {t("profile.reset")}
        </button>
      </section>

      {/* My documents sheet */}
      <BottomSheet open={openMyDocs} onClose={() => setOpenMyDocs(false)} title={t("profile.my_docs")}>
        <label className="block rounded-2xl p-5 text-center cursor-pointer mb-4"
          style={{ background: "var(--bg-elevated)", border: "2px dashed var(--lemon)" }}>
          <input type="file" multiple className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <UploadIcon className="text-[var(--lemon)] mx-auto mb-2" size={24} />
          <p className="font-label font-semibold text-white text-sm">{t("profile.add_doc")}</p>
          <p className="text-white/40 text-xs italic mt-1">{t("profile.upload_hint")}</p>
        </label>
        {uploadedDocuments.length === 0 ? (
          <p className="text-white/50 italic text-sm">{t("profile.no_docs")}</p>
        ) : (
          <div className="space-y-2">
            {uploadedDocuments.map((d) => (
              <div key={d.id} className="rounded-xl p-3 bg-[#0A0A0A] flex items-center gap-3">
                <DocIcon className="text-[var(--lemon)]" />
                <div className="flex-1 min-w-0">
                  <p className="font-label font-semibold text-white text-sm truncate">{d.name}</p>
                  <p className="text-[var(--vivid-green)] text-xs">{t("profile.ai_analyzed")}</p>
                </div>
                <button onClick={() => removeDocument(d.id)} className="text-[var(--vivid-red)] text-xs font-label">{t("profile.delete")}</button>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>

      {/* How-to guides sheet */}
      <BottomSheet open={openHowTo} onClose={() => setOpenHowTo(false)} title={t("profile.how_to")}>
        <div className="space-y-2">
          {Object.entries(HOW_TO_DATA).map(([key, entry]) => {
            const info = entry[lang];
            const displayName = lang === "en" ? key.split(" / ")[1] ?? key : key.split(" / ")[0];
            const has = uploadedDocuments.some((u) => u.name.toLowerCase().includes(displayName.toLowerCase().slice(0, 4)));
            const isOpen = expanded === key;
            return (
              <div key={key} className="rounded-xl overflow-hidden" style={{ background: has ? "var(--vivid-green)" : "#1C1C1E" }}>
                <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full p-3 flex items-center justify-between text-left">
                  <span className="font-label font-semibold text-white text-sm">{has && "✓ "}{displayName}</span>
                  <ChevronIcon size={14} className={`text-white/60 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 bg-black/20">
                    <div className="flex gap-3 mb-3 mt-2 text-xs flex-wrap">
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

      {/* Edit profile sheet */}
      <BottomSheet open={openEdit} onClose={() => setOpenEdit(false)} title={t("profile.edit_profile")}>
        <EditForm onboarding={onboarding} setOnboarding={setOnboarding} lang={lang} />
      </BottomSheet>

      <BottomNav />
    </main>
  );
}

function EditForm({ onboarding, setOnboarding, lang }: { onboarding: any; setOnboarding: (d: any) => void; lang: string }) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const region = FRANCE_REGIONS.find((r) => r.id === onboarding.region);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-white/50 italic text-xs">{t("profile.firstname")}</label>
        <input value={onboarding.first_name ?? ""} onChange={(e) => setOnboarding({ first_name: e.target.value })}
          className="w-full mt-1 bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none focus:border-[var(--lemon)]" />
      </div>
      <div>
        <label className="text-white/50 italic text-xs">{t("profile.lastname")}</label>
        <input value={onboarding.last_name ?? ""} onChange={(e) => setOnboarding({ last_name: e.target.value })}
          className="w-full mt-1 bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none focus:border-[var(--lemon)]" />
      </div>
      <div>
        <label className="text-white/50 italic text-xs">{t("profile.dob")}</label>
        <input type="date" value={onboarding.date_of_birth ?? ""} onChange={(e) => setOnboarding({ date_of_birth: e.target.value })}
          className="w-full mt-1 bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none focus:border-[var(--lemon)]" />
      </div>

      <div>
        <label className="text-white/50 italic text-xs mb-2 block">{t("profile.nationality")}</label>
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
        <label className="text-white/50 italic text-xs mb-2 block">{t("profile.region_city")}</label>
        <select value={onboarding.region ?? ""} onChange={(e) => setOnboarding({ region: e.target.value, city: "" })}
          className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 rounded-xl text-white font-body italic outline-none">
          <option value="">{t("profile.choose_region")}</option>
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
        <label className="text-white/50 italic text-xs mb-2 block">{t("profile.status")}</label>
        <div className="grid grid-cols-2 gap-2">
          {EMPLOYMENT_OPTIONS_DATA.map((opt) => {
            const active = onboarding.employment_status === opt.id;
            return (
              <button key={opt.id}
                onClick={() => setOnboarding({ employment_status: opt.id, is_job_seeking: opt.id === "searching" })}
                className="rounded-xl p-3 text-left flex items-center gap-2 transition-all"
                style={{ background: active ? "var(--lemon)" : "var(--bg-elevated)", color: active ? "#000" : "#fff" }}>
                <span className="text-lg">{opt.emoji}</span>
                <span className="font-label font-medium text-sm">{lang === "en" ? opt.labelEn : opt.labelFr}</span>
              </button>
            );
          })}
        </div>
        {onboarding.is_job_seeking && (
          <p className="text-white/60 italic text-xs mt-2 animate-fade-in">{t("profile.job_seeking_hint")}</p>
        )}
      </div>

      <button onClick={save}
        className="w-full py-3.5 rounded-2xl font-label font-semibold transition-all"
        style={{ background: saved ? "var(--vivid-green)" : "var(--lemon)", color: saved ? "#fff" : "#000" }}>
        {saved ? t("profile.saved") : t("profile.save")}
      </button>
    </div>
  );
}
