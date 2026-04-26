import type { BuildingId } from "./theme";
import { STATIC_BANK_RECOS } from "./api";

// ---------------------------------------------------------------------------
// i18n helpers
// ---------------------------------------------------------------------------
type I18nStr = { fr: string; en: string };
const sel = (s: I18nStr, lang: string) => (lang === "en" ? s.en : s.fr);

// ---------------------------------------------------------------------------
// AIDS catalog (names are brand names — kept as-is; descriptions bilingual)
// ---------------------------------------------------------------------------
export interface AidEntry {
  id: string;
  name: string;
  description: string;
  conditions: string;
  url: string;
  monthly_value: number;
  category: "logement" | "famille" | "santé" | "emploi" | "énergie" | "jeune" | "handicap";
}

export const AIDS_CATALOG: AidEntry[] = [
  {
    id: "apl",
    name: "APL — Aide Personnalisée au Logement",
    description: "Aide versée directement à ton propriétaire pour réduire ton loyer mensuel.",
    conditions: "Locataire d'un logement conventionné, revenus modestes.",
    url: "https://www.caf.fr/aides-et-services/s-informer-sur-les-aides/logement/l-aide-personnalisee-au-logement-apl",
    monthly_value: 220,
    category: "logement",
  },
  {
    id: "visale",
    name: "Visale — Garantie loyer impayé",
    description: "Service de cautionnement gratuit pour les locataires sans garant.",
    conditions: "Moins de 30 ans ou salarié en CDI depuis moins de 6 mois.",
    url: "https://www.visale.fr",
    monthly_value: 0,
    category: "logement",
  },
  {
    id: "mobili-pass",
    name: "Mobili-Pass — Aide à la mobilité",
    description: "Aide d'Action Logement pour les salariés du secteur privé qui déménagent pour un emploi.",
    conditions: "Salarié d'une entreprise cotisant à Action Logement.",
    url: "https://www.actionlogement.fr/le-mobili-pass",
    monthly_value: 0,
    category: "logement",
  },
  {
    id: "af",
    name: "Allocations Familiales",
    description: "Versement mensuel pour les familles avec deux enfants ou plus à charge.",
    conditions: "Résider en France, avoir au moins deux enfants à charge.",
    url: "https://www.caf.fr/aides-et-services/s-informer-sur-les-aides/enfance-et-jeunesse/les-allocations-familiales",
    monthly_value: 184,
    category: "famille",
  },
  {
    id: "paje",
    name: "PAJE — Prestation d'Accueil du Jeune Enfant",
    description: "Aide pour les parents d'enfants de moins de 3 ans (garde, crèche…).",
    conditions: "Enfant de moins de 3 ans, conditions de ressources.",
    url: "https://www.caf.fr/aides-et-services/s-informer-sur-les-aides/enfance-et-jeunesse/la-prestation-d-accueil-du-jeune-enfant-paje",
    monthly_value: 185,
    category: "famille",
  },
  {
    id: "css",
    name: "Complémentaire Santé Solidaire (CSS)",
    description: "Mutuelle gratuite ou quasi-gratuite pour les personnes à faibles revenus.",
    conditions: "Revenus en dessous du plafond, résidence stable en France.",
    url: "https://www.complementaire-sante-solidaire.gouv.fr",
    monthly_value: 40,
    category: "santé",
  },
  {
    id: "aide-audition",
    name: "100% Santé Audiologie",
    description: "Prothèses auditives intégralement remboursées par la Sécurité Sociale et les mutuelles.",
    conditions: "Prescription médicale, prestataire agréé.",
    url: "https://www.ameli.fr/assure/remboursements/rembourse/optique-dentaire-audition/audioprotheses",
    monthly_value: 0,
    category: "santé",
  },
  {
    id: "are",
    name: "ARE — Allocation de Retour à l'Emploi",
    description: "Indemnité chômage versée après perte involontaire d'emploi.",
    conditions: "Avoir travaillé au moins 6 mois sur les 24 derniers mois, inscription à France Travail.",
    url: "https://www.pole-emploi.fr/candidat/mes-droits-aux-aides-et-allocations/a-chaque-situation-son-allocation/les-allocations-chomage/lare-allocation-daide-au-retour.html",
    monthly_value: 1200,
    category: "emploi",
  },
  {
    id: "prime-activite",
    name: "Prime d'Activité",
    description: "Complément de revenus pour les travailleurs aux salaires modestes.",
    conditions: "Travailler et avoir des revenus inférieurs à environ 1 800 € net/mois.",
    url: "https://www.caf.fr/aides-et-services/s-informer-sur-les-aides/emploi-et-formation/la-prime-d-activite",
    monthly_value: 160,
    category: "emploi",
  },
  {
    id: "mva",
    name: "MaPrimeRénov' — Économies d'énergie",
    description: "Aide pour financer des travaux de rénovation énergétique dans ton logement.",
    conditions: "Propriétaire occupant, logement de plus de 15 ans.",
    url: "https://www.maprimerenov.gouv.fr",
    monthly_value: 0,
    category: "énergie",
  },
  {
    id: "cheque-energie",
    name: "Chèque Énergie",
    description: "Aide annuelle pour payer tes factures d'énergie ou financer des travaux.",
    conditions: "Revenus fiscaux faibles, envoi automatique sans démarche.",
    url: "https://chequeenergie.gouv.fr",
    monthly_value: 20,
    category: "énergie",
  },
  {
    id: "pass-culture",
    name: "Pass Culture 18 ans",
    description: "300 € crédités sur l'appli pour des activités culturelles (concerts, livres, cinéma…).",
    conditions: "Avoir 18 ans, résider en France.",
    url: "https://pass.culture.fr",
    monthly_value: 0,
    category: "jeune",
  },
  {
    id: "garantie-jeunes",
    name: "Contrat d'Engagement Jeune",
    description: "Accompagnement intensif vers l'emploi avec allocation mensuelle.",
    conditions: "16 à 25 ans (29 ans pour les personnes en situation de handicap), sans emploi ni formation.",
    url: "https://www.1jeune1solution.gouv.fr/contrat-engagement-jeune",
    monthly_value: 500,
    category: "jeune",
  },
  {
    id: "aah",
    name: "AAH — Allocation Adulte Handicapé",
    description: "Revenu de subsistance pour les personnes en situation de handicap.",
    conditions: "Taux d'incapacité d'au moins 80 % (ou 50–79 % avec restriction au marché du travail).",
    url: "https://www.caf.fr/aides-et-services/s-informer-sur-les-aides/handicap/l-allocation-aux-adultes-handicapes-aah",
    monthly_value: 971,
    category: "handicap",
  },
  {
    id: "rqth",
    name: "RQTH — Reconnaissance Qualité Travailleur Handicapé",
    description: "Statut qui ouvre droit à des aménagements de poste et protections spécifiques.",
    conditions: "Handicap reconnu par la MDPH.",
    url: "https://travail-emploi.gouv.fr/emploi-et-insertion/emploi-et-handicap/article/la-reconnaissance-de-la-qualite-de-travailleur-handicape-rqth",
    monthly_value: 0,
    category: "handicap",
  },
];

// ---------------------------------------------------------------------------
// Recommendation type (with optional English tagline)
// ---------------------------------------------------------------------------
export interface Recommendation {
  name: string;
  tagline: string;
  tagline_en?: string;
  url: string;
  rating: number;
  badge?: string;
  metrics: { label: string; label_en?: string; value: string }[];
}

// ---------------------------------------------------------------------------
// Bilingual building content
// ---------------------------------------------------------------------------
interface BilingualHeroWord { text: I18nStr; color: string }
interface BilingualStoryCard { title: I18nStr; body: I18nStr; variant: "vivid" | "dark"; color: string }
interface BilingualGuideStep { title: I18nStr; body: I18nStr }

interface BilingualBuildingContent {
  hero: { words: BilingualHeroWord[] };
  intro: I18nStr;
  cleoMessage: I18nStr;
  recos: Recommendation[];
  brands: { name: string; color: string }[];
  story: BilingualStoryCard[];
  guide: BilingualGuideStep[];
  trackerNodes: I18nStr[];
  celebration: { title: { text: I18nStr; color: string }[]; xp: number };
}

// Resolved (flat) type used by components
export interface BuildingContent {
  hero: { words: { text: string; color: string }[] };
  intro: string;
  cleoMessage: string;
  recos: Recommendation[];
  brands: { name: string; color: string }[];
  story: { title: string; body: string; variant: "vivid" | "dark"; color: string }[];
  guide: { title: string; body: string }[];
  trackerNodes: string[];
  celebration: { title: { text: string; color: string }[]; xp: number };
}

function resolve(c: BilingualBuildingContent, lang: string): BuildingContent {
  return {
    hero: { words: c.hero.words.map((w) => ({ text: sel(w.text, lang), color: w.color })) },
    intro: sel(c.intro, lang),
    cleoMessage: sel(c.cleoMessage, lang),
    recos: c.recos,
    brands: c.brands,
    story: c.story.map((s) => ({ ...s, title: sel(s.title, lang), body: sel(s.body, lang) })),
    guide: c.guide.map((g) => ({ title: sel(g.title, lang), body: sel(g.body, lang) })),
    trackerNodes: c.trackerNodes.map((n) => sel(n, lang)),
    celebration: { title: c.celebration.title.map((w) => ({ text: sel(w.text, lang), color: w.color })), xp: c.celebration.xp },
  };
}

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const LEMON = "#FACC15";
const PURPLE = "#A78BFA";
const PINK = "#F472B6";
const GREEN = "#4ADE80";
const BLUE = "#60A5FA";
const ORANGE = "#FB923C";
const RED = "#F87171";
const TEAL = "#38BDF8";

// ---------------------------------------------------------------------------
// Bilingual recommendations
// ---------------------------------------------------------------------------
const housingRecos: Recommendation[] = [
  {
    name: "Visale",
    tagline: "Garant gratuit de l'État — idéal sans garant personnel",
    tagline_en: "Free government guarantor — perfect if you have no personal guarantor",
    url: "https://www.visale.fr",
    rating: 4.8,
    badge: "MEILLEUR MATCH",
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Délai", label_en: "Delay", value: "48h" }, { label: "Note", label_en: "Score", value: "4.8" }],
  },
  {
    name: "SeLoger",
    tagline: "N°1 des annonces immobilières — location et achat",
    tagline_en: "France's #1 property listing site — rentals & sales",
    url: "https://www.seloger.com",
    rating: 4.2,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Annonces", label_en: "Listings", value: "+500k" }, { label: "Note", label_en: "Score", value: "4.2" }],
  },
  {
    name: "Lokaviz",
    tagline: "Logements étudiants et jeunes actifs — prix abordables",
    tagline_en: "Student & young professional housing — affordable rates",
    url: "https://www.lokaviz.fr",
    rating: 3.9,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Profil", label_en: "For", value: "Étudiants / Students" }, { label: "Note", label_en: "Score", value: "3.9" }],
  },
];

const workRecos: Recommendation[] = [
  {
    name: "France Travail",
    tagline: "Inscription obligatoire — ouvre tes droits au chômage et à l'accompagnement",
    tagline_en: "Mandatory registration — activates your unemployment rights & support",
    url: "https://www.francetravail.fr",
    rating: 4.5,
    badge: "PRIORITAIRE",
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Délai", label_en: "Delay", value: "24h" }, { label: "Note", label_en: "Score", value: "4.5" }],
  },
  {
    name: "LinkedIn",
    tagline: "Réseau professionnel — 15M+ offres, networking, profil visible",
    tagline_en: "Professional network — 15M+ jobs, networking, visible profile",
    url: "https://www.linkedin.com/jobs",
    rating: 4.4,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Offres FR", label_en: "FR Jobs", value: "500k+" }, { label: "Note", label_en: "Score", value: "4.4" }],
  },
  {
    name: "Welcome to the Jungle",
    tagline: "Startups & scale-ups — transparence totale sur les entreprises",
    tagline_en: "Startups & scale-ups — full transparency on company culture",
    url: "https://www.welcometothejungle.com",
    rating: 4.3,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Culture", label_en: "Profile", value: "Startup" }, { label: "Note", label_en: "Score", value: "4.3" }],
  },
];

const taxesRecos: Recommendation[] = [
  {
    name: "impots.gouv.fr",
    tagline: "Site officiel — déclare tes revenus, consulte ton espace fiscal",
    tagline_en: "Official site — file your taxes, access your personal tax dashboard",
    url: "https://www.impots.gouv.fr",
    rating: 4.6,
    badge: "OFFICIEL",
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Type", label_en: "Type", value: "Gouvernement" }, { label: "Note", label_en: "Score", value: "4.6" }],
  },
  {
    name: "Indy",
    tagline: "Comptabilité automatisée pour freelances et TNS",
    tagline_en: "Automated accounting for freelancers & self-employed",
    url: "https://www.indy.fr",
    rating: 4.3,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Dès 0€/mois" }, { label: "Profil", label_en: "For", value: "Freelance" }, { label: "Note", label_en: "Score", value: "4.3" }],
  },
  {
    name: "Mes Impôts Simplifié",
    tagline: "Simulateur de déclaration — estime ton impôt avant de déclarer",
    tagline_en: "Tax simulator — estimate your tax bill before filing",
    url: "https://simulateur-ir-ifi.impots.gouv.fr",
    rating: 4.1,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Type", label_en: "Type", value: "Simulateur / Simulator" }, { label: "Note", label_en: "Score", value: "4.1" }],
  },
];

const insuranceRecos: Recommendation[] = [
  {
    name: "Alan",
    tagline: "Mutuelle 100% digitale — remboursements en 24h via l'app",
    tagline_en: "100% digital health insurance — reimbursements in 24h via the app",
    url: "https://alan.com",
    rating: 4.7,
    badge: "MEILLEUR MATCH",
    metrics: [{ label: "Coût", label_en: "Cost", value: "Dès 12€/mois" }, { label: "Délai rembours.", label_en: "Reimbursement", value: "24h" }, { label: "Note", label_en: "Score", value: "4.7" }],
  },
  {
    name: "Luko",
    tagline: "Assurance habitation en 2 minutes — 100% en ligne",
    tagline_en: "Home insurance in 2 minutes — 100% online",
    url: "https://www.luko.eu",
    rating: 4.4,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Dès 5€/mois" }, { label: "Souscription", label_en: "Sign-up", value: "2 min" }, { label: "Note", label_en: "Score", value: "4.4" }],
  },
  {
    name: "MGEN",
    tagline: "Mutuelle solide pour salariés — couverture complète optique & dentaire",
    tagline_en: "Solid health cover for employees — full optical & dental coverage",
    url: "https://www.mgen.fr",
    rating: 4.2,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Selon salaire / Income-based" }, { label: "Profil", label_en: "For", value: "Salarié / Employee" }, { label: "Note", label_en: "Score", value: "4.2" }],
  },
];

const transportRecos: Recommendation[] = [
  {
    name: "Navigo Mois",
    tagline: "Abonnement mensuel illimité Île-de-France — métro, RER, bus",
    tagline_en: "Unlimited monthly pass for Île-de-France — metro, RER, bus",
    url: "https://www.iledefrance-mobilites.fr",
    rating: 4.8,
    badge: "INCONTOURNABLE",
    metrics: [{ label: "Coût", label_en: "Cost", value: "86€/mois" }, { label: "Zones", label_en: "Zones", value: "1-5" }, { label: "Note", label_en: "Score", value: "4.8" }],
  },
  {
    name: "Vélib' Métropole",
    tagline: "Vélo en libre-service 24h/24 — idéal pour le dernier km",
    tagline_en: "24/7 bike-share — perfect for the last mile",
    url: "https://www.velib-metropole.fr",
    rating: 4.3,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Dès 3€/mois" }, { label: "Stations", label_en: "Stations", value: "+1400" }, { label: "Note", label_en: "Score", value: "4.3" }],
  },
  {
    name: "Lime",
    tagline: "Trottinettes & vélos électriques — à la minute",
    tagline_en: "E-scooters & e-bikes — pay by the minute",
    url: "https://www.li.me/fr-fr",
    rating: 4.0,
    metrics: [{ label: "Coût", label_en: "Cost", value: "0,25€/min" }, { label: "Type", label_en: "Type", value: "Free-floating" }, { label: "Note", label_en: "Score", value: "4.0" }],
  },
];

const retirementRecos: Recommendation[] = [
  {
    name: "Assurance Retraite",
    tagline: "Consulte ton relevé de carrière et estime ta future pension",
    tagline_en: "Check your career statement and estimate your future pension",
    url: "https://www.lassuranceretraite.fr",
    rating: 4.7,
    badge: "OFFICIEL",
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Type", label_en: "Type", value: "Gouvernement" }, { label: "Note", label_en: "Score", value: "4.7" }],
  },
  {
    name: "PER Individuel (Linxea)",
    tagline: "Plan Épargne Retraite — défiscalise jusqu'à 10% de tes revenus",
    tagline_en: "Individual Retirement Savings Plan — tax-exempt up to 10% of income",
    url: "https://www.linxea.com/epargne-retraite/per",
    rating: 4.4,
    metrics: [{ label: "Coût", label_en: "Cost", value: "0 frais gestion" }, { label: "Avantage", label_en: "Benefit", value: "Tax savings" }, { label: "Note", label_en: "Score", value: "4.4" }],
  },
  {
    name: "Mon compte retraite",
    tagline: "Espace officiel multi-régimes — tous tes droits en un seul endroit",
    tagline_en: "Official multi-scheme portal — all your pension rights in one place",
    url: "https://www.info-retraite.fr",
    rating: 4.3,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Régimes", label_en: "Schemes", value: "Tous / All" }, { label: "Note", label_en: "Score", value: "4.3" }],
  },
];

const childrenRecos: Recommendation[] = [
  {
    name: "CAF — Allocations Familiales",
    tagline: "Déclare tes enfants et touche les allocations dès le 2ème mois",
    tagline_en: "Register your children and receive benefits from the 2nd month",
    url: "https://www.caf.fr",
    rating: 4.6,
    badge: "PRIORITAIRE",
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Délai", label_en: "Delay", value: "2 mois / months" }, { label: "Note", label_en: "Score", value: "4.6" }],
  },
  {
    name: "Mon Enfant.fr",
    tagline: "Trouver une crèche, une assistante maternelle, un EAJE près de chez toi",
    tagline_en: "Find a nursery, childminder or early childhood centre near you",
    url: "https://www.monenfant.fr",
    rating: 4.2,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Type", label_en: "Type", value: "Official directory" }, { label: "Note", label_en: "Score", value: "4.2" }],
  },
  {
    name: "Ameli — Carnet de santé",
    tagline: "Suivi vaccinal et médecin traitant pour tes enfants",
    tagline_en: "Vaccination tracking and GP registration for your children",
    url: "https://www.ameli.fr",
    rating: 4.4,
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Service", label_en: "Service", value: "Assurance Maladie" }, { label: "Note", label_en: "Score", value: "4.4" }],
  },
];

const aidsRecos: Recommendation[] = [
  {
    name: "Mes Droits Sociaux",
    tagline: "Simulateur officiel — découvre toutes les aides auxquelles tu as droit",
    tagline_en: "Official simulator — discover all the benefits you are eligible for",
    url: "https://www.mesdroitssociaux.gouv.fr",
    rating: 4.8,
    badge: "INCONTOURNABLE",
    metrics: [{ label: "Coût", label_en: "Cost", value: "Gratuit / Free" }, { label: "Type", label_en: "Type", value: "Official simulator" }, { label: "Note", label_en: "Score", value: "4.8" }],
  },
  {
    name: "CAF — APL",
    tagline: "Aide au logement — jusqu'à 380€/mois selon ton loyer et tes revenus",
    tagline_en: "Housing benefit — up to €380/month depending on rent and income",
    url: "https://www.caf.fr/aides-et-services/s-informer-sur-les-aides/logement",
    rating: 4.6,
    metrics: [{ label: "Max", label_en: "Max", value: "~380€/mois" }, { label: "Délai", label_en: "Delay", value: "~4 semaines / weeks" }, { label: "Note", label_en: "Score", value: "4.6" }],
  },
  {
    name: "Complémentaire Santé Solidaire",
    tagline: "Mutuelle gratuite ou quasi-gratuite pour revenus modestes",
    tagline_en: "Free or near-free health top-up for low-income residents",
    url: "https://www.complementaire-sante-solidaire.gouv.fr",
    rating: 4.5,
    metrics: [{ label: "Coût", label_en: "Cost", value: "0-30€/mois" }, { label: "Accès", label_en: "Access", value: "Automatique / Automatic" }, { label: "Note", label_en: "Score", value: "4.5" }],
  },
];

// ---------------------------------------------------------------------------
// Raw bilingual content
// ---------------------------------------------------------------------------
const RAW_CONTENT: Record<Exclude<BuildingId, "airport">, BilingualBuildingContent> = {
  bank: {
    hero: { words: [
      { text: { fr: "Ta", en: "Your" }, color: LEMON },
      { text: { fr: "banque", en: "ideal" }, color: "#fff" },
      { text: { fr: "idéale.", en: "bank." }, color: LEMON },
    ]},
    intro: {
      fr: "Ouvrir un compte dans un nouveau pays, c'est la première étape. On t'aide à choisir la bonne.",
      en: "Opening a bank account in a new country is your first step. We help you pick the right one.",
    },
    cleoMessage: {
      fr: "Chaque profil a sa banque parfaite — on va trouver la tienne.",
      en: "Every profile has its perfect bank — let's find yours.",
    },
    recos: STATIC_BANK_RECOS,
    brands: [
      { name: "BNP", color: "#009FE3" }, { name: "HSBC", color: "#DB0011" },
      { name: "N26", color: "#26D07C" }, { name: "Revolut", color: "#0075EB" },
      { name: "Wise", color: "#9FE870" }, { name: "CIC", color: "#E30613" },
    ],
    story: [
      {
        title: { fr: "IBAN local indispensable", en: "Local IBAN is essential" },
        body: { fr: "Un IBAN local est exigé pour louer un appartement, recevoir un salaire ou payer des factures.", en: "A local IBAN is required to rent a flat, receive your salary or pay bills." },
        variant: "vivid", color: LEMON,
      },
      {
        title: { fr: "Banques 100 % en ligne", en: "100% online banks" },
        body: { fr: "Revolut, Wise et N26 permettent une ouverture en quelques minutes, sans adresse locale.", en: "Revolut, Wise and N26 let you open an account in minutes, with no local address required." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Banques traditionnelles", en: "Traditional banks" },
        body: { fr: "BNP, Société Générale et HSBC offrent un IBAN local mais nécessitent souvent un justificatif de domicile.", en: "BNP, Société Générale and HSBC provide a local IBAN but often require proof of address." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Choisir ta banque", en: "Choose your bank" }, body: { fr: "Compare les frais, délais d'ouverture et services disponibles pour ton profil.", en: "Compare fees, opening times and services available for your profile." } },
      { title: { fr: "Réunir les documents", en: "Gather your documents" }, body: { fr: "Passeport, visa, justificatif de domicile (si disponible).", en: "Passport, visa, proof of address (if available)." } },
      { title: { fr: "Ouvrir le compte", en: "Open the account" }, body: { fr: "En ligne ou en agence, selon la banque choisie.", en: "Online or in-branch, depending on the bank." } },
      { title: { fr: "Activer la carte", en: "Activate your card" }, body: { fr: "Effectue un premier virement ou retrait pour activer ton compte.", en: "Make your first transfer or withdrawal to activate the account." } },
    ],
    trackerNodes: [
      { fr: "Choix", en: "Choice" }, { fr: "Dossier", en: "Documents" },
      { fr: "Ouverture", en: "Opening" }, { fr: "Activation", en: "Activation" },
    ],
    celebration: { title: [{ text: { fr: "Compte", en: "Account" }, color: LEMON }, { text: { fr: "ouvert !", en: "opened!" }, color: "#fff" }], xp: 150 },
  },

  housing: {
    hero: { words: [
      { text: { fr: "Ton", en: "Your" }, color: BLUE },
      { text: { fr: "logement,", en: "home," }, color: "#fff" },
      { text: { fr: "trouvé.", en: "found." }, color: BLUE },
    ]},
    intro: {
      fr: "Trouver un logement à l'étranger peut sembler complexe. Voici les étapes clés.",
      en: "Finding housing abroad can feel daunting. Here are the key steps.",
    },
    cleoMessage: {
      fr: "Un toit, c'est la base. Commençons par là.",
      en: "A roof over your head is the foundation. Let's start there.",
    },
    recos: housingRecos,
    brands: [
      { name: "Airbnb", color: "#FF5A5F" }, { name: "Leboncoin", color: "#FF6D00" },
      { name: "SeLoger", color: "#0065B0" }, { name: "PAP", color: "#DA3832" },
    ],
    story: [
      {
        title: { fr: "Garant obligatoire", en: "Guarantor required" },
        body: { fr: "La plupart des propriétaires exigent un garant local ou un service comme Visale.", en: "Most landlords require a local guarantor or a service like Visale." },
        variant: "vivid", color: BLUE,
      },
      {
        title: { fr: "Visale gratuit", en: "Free Visale service" },
        body: { fr: "Le service gouvernemental Visale agit comme garant si tu as moins de 30 ans ou un CDI récent.", en: "The government Visale service acts as your guarantor if you're under 30 or have a recent permanent contract." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Résidence temporaire", en: "Temporary accommodation" },
        body: { fr: "Commence par une colocation ou un meublé le temps de constituer ton dossier.", en: "Start with flat-sharing or furnished accommodation while you build your file." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Définir ton budget", en: "Set your budget" }, body: { fr: "Inclus loyer + charges + caution (1 à 2 mois de loyer).", en: "Include rent + bills + deposit (1–2 months' rent)." } },
      { title: { fr: "Préparer ton dossier", en: "Prepare your file" }, body: { fr: "Passeport, contrat de travail, 3 derniers bulletins de salaire, relevés bancaires.", en: "Passport, work contract, last 3 payslips, bank statements." } },
      { title: { fr: "Obtenir un garant", en: "Get a guarantor" }, body: { fr: "Visale, garant physique ou service de cautionnement privé.", en: "Visale, a personal guarantor, or a private surety service." } },
      { title: { fr: "Signer le bail", en: "Sign the lease" }, body: { fr: "Lis attentivement le contrat. Fais l'état des lieux d'entrée.", en: "Read the contract carefully. Do the check-in inventory." } },
    ],
    trackerNodes: [
      { fr: "Budget", en: "Budget" }, { fr: "Dossier", en: "File" },
      { fr: "Garant", en: "Guarantor" }, { fr: "Signature", en: "Signing" },
    ],
    celebration: { title: [{ text: { fr: "Logement", en: "Home" }, color: BLUE }, { text: { fr: "sécurisé !", en: "secured!" }, color: "#fff" }], xp: 200 },
  },

  work: {
    hero: { words: [
      { text: { fr: "Ton", en: "Your" }, color: TEAL },
      { text: { fr: "emploi,", en: "job," }, color: "#fff" },
      { text: { fr: "légalement.", en: "legally." }, color: TEAL },
    ]},
    intro: {
      fr: "Travailler légalement dans un nouveau pays demande quelques démarches. On t'accompagne.",
      en: "Working legally in a new country requires a few steps. We've got you covered.",
    },
    cleoMessage: {
      fr: "Un contrat en règle, c'est la sécurité. Voici comment l'obtenir.",
      en: "A proper contract means security. Here's how to get one.",
    },
    recos: workRecos,
    brands: [
      { name: "LinkedIn", color: "#0A66C2" }, { name: "Indeed", color: "#2164F3" },
      { name: "APEC", color: "#D50000" }, { name: "Pôle Emploi", color: "#005F8E" },
    ],
    story: [
      {
        title: { fr: "Autorisation de travail", en: "Work authorisation" },
        body: { fr: "Selon ta nationalité, un titre de séjour mention 'salarié' ou 'travailleur temporaire' peut être nécessaire.", en: "Depending on your nationality, a residence permit mentioning 'employee' or 'temporary worker' may be required." },
        variant: "vivid", color: TEAL,
      },
      {
        title: { fr: "Numéro de Sécurité Sociale", en: "Social Security Number" },
        body: { fr: "Tu reçois un numéro provisoire à l'embauche, puis définitif sous 3 à 6 mois.", en: "You receive a provisional number when hired, then a permanent one within 3–6 months." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Contrat de travail", en: "Employment contract" },
        body: { fr: "CDI, CDD ou freelance : chaque statut a ses droits et obligations.", en: "Permanent, fixed-term or freelance: each status has its own rights and obligations." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Vérifier ton droit au travail", en: "Check your right to work" }, body: { fr: "Consulte les conditions liées à ton visa ou titre de séjour.", en: "Check the conditions linked to your visa or residence permit." } },
      { title: { fr: "S'inscrire à Pôle Emploi", en: "Register with France Travail" }, body: { fr: "Même si tu travailles déjà, l'inscription ouvre des droits.", en: "Even if already working, registration unlocks rights and benefits." } },
      { title: { fr: "Obtenir ton numéro SS", en: "Get your Social Security Number" }, body: { fr: "Ton employeur démarre la procédure à l'embauche.", en: "Your employer starts the process at the time of hiring." } },
      { title: { fr: "Comprendre ta fiche de paie", en: "Understand your payslip" }, body: { fr: "Brut, net, cotisations : décrypte chaque ligne.", en: "Gross, net, contributions: decode every line." } },
    ],
    trackerNodes: [
      { fr: "Droit", en: "Right to work" }, { fr: "Inscription", en: "Registration" },
      { fr: "Numéro SS", en: "SS Number" }, { fr: "Paie", en: "Payslip" },
    ],
    celebration: { title: [{ text: { fr: "Emploi", en: "Job" }, color: TEAL }, { text: { fr: "sécurisé !", en: "secured!" }, color: "#fff" }], xp: 180 },
  },

  taxes: {
    hero: { words: [
      { text: { fr: "Tes", en: "Your" }, color: GREEN },
      { text: { fr: "impôts,", en: "taxes," }, color: "#fff" },
      { text: { fr: "maîtrisés.", en: "under control." }, color: GREEN },
    ]},
    intro: {
      fr: "Comprendre le système fiscal de ton pays d'accueil est essentiel pour éviter les mauvaises surprises.",
      en: "Understanding your host country's tax system is essential to avoid nasty surprises.",
    },
    cleoMessage: {
      fr: "Les impôts, ça fait peur mais c'est gérable. Je t'explique.",
      en: "Taxes sound scary but are manageable. Let me explain.",
    },
    recos: taxesRecos,
    brands: [
      { name: "Impots.gouv", color: "#003189" }, { name: "Alan", color: "#5551FF" },
      { name: "Indy", color: "#FF6B35" },
    ],
    story: [
      {
        title: { fr: "Résidence fiscale", en: "Tax residency" },
        body: { fr: "Si tu passes plus de 183 jours dans un pays, tu y es généralement résident fiscal.", en: "If you spend more than 183 days in a country, you are generally a tax resident there." },
        variant: "vivid", color: GREEN,
      },
      {
        title: { fr: "Double imposition", en: "Double taxation" },
        body: { fr: "Des conventions fiscales entre pays évitent d'être taxé deux fois sur les mêmes revenus.", en: "Tax treaties between countries prevent you from being taxed twice on the same income." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Première déclaration", en: "First tax return" },
        body: { fr: "Elle couvre les revenus perçus depuis ton arrivée. L'administration fiscale envoie un guide aux nouveaux résidents.", en: "It covers income earned since your arrival. Tax authorities usually send a guide to new residents." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Déterminer ta résidence fiscale", en: "Determine your tax residency" }, body: { fr: "Vérifie les critères : durée de séjour, centre des intérêts économiques.", en: "Check the criteria: length of stay, centre of economic interests." } },
      { title: { fr: "S'inscrire aux impôts", en: "Register with the tax authority" }, body: { fr: "Crée ton espace personnel sur le site des impôts locaux.", en: "Create your personal account on the local tax authority website." } },
      { title: { fr: "Rassembler tes justificatifs", en: "Gather your documents" }, body: { fr: "Fiches de paie, relevés bancaires, quittances de loyer.", en: "Payslips, bank statements, rent receipts." } },
      { title: { fr: "Déclarer tes revenus", en: "File your tax return" }, body: { fr: "Respecte les délais — des pénalités s'appliquent en cas de retard.", en: "Meet the deadlines — penalties apply for late filing." } },
    ],
    trackerNodes: [
      { fr: "Résidence", en: "Residency" }, { fr: "Inscription", en: "Registration" },
      { fr: "Justificatifs", en: "Documents" }, { fr: "Déclaration", en: "Filing" },
    ],
    celebration: { title: [{ text: { fr: "Impôts", en: "Taxes" }, color: GREEN }, { text: { fr: "déclarés !", en: "filed!" }, color: "#fff" }], xp: 120 },
  },

  insurance: {
    hero: { words: [
      { text: { fr: "Protège-toi", en: "Protect" }, color: RED },
      { text: { fr: "dès", en: "yourself" }, color: "#fff" },
      { text: { fr: "l'arrivée.", en: "from day one." }, color: RED },
    ]},
    intro: {
      fr: "Santé, habitation, responsabilité civile : souscrire les bonnes assurances protège ta vie à l'étranger.",
      en: "Health, home, liability: getting the right insurance protects your life abroad.",
    },
    cleoMessage: {
      fr: "Une bonne assurance, c'est la tranquillité d'esprit. Voici ce dont tu as besoin.",
      en: "Good insurance is peace of mind. Here's what you need.",
    },
    recos: insuranceRecos,
    brands: [
      { name: "Alan", color: "#5551FF" }, { name: "AXA", color: "#00008F" },
      { name: "MGEN", color: "#0071BC" }, { name: "Luko", color: "#4CAF50" },
    ],
    story: [
      {
        title: { fr: "Assurance maladie obligatoire", en: "Mandatory health insurance" },
        body: { fr: "Dans la plupart des pays, une couverture santé de base est obligatoire. Informe-toi sur le délai d'affiliation.", en: "In most countries, basic health cover is compulsory. Find out the enrolment deadline." },
        variant: "vivid", color: RED,
      },
      {
        title: { fr: "Mutuelle complémentaire", en: "Supplementary health cover" },
        body: { fr: "La sécurité sociale couvre rarement 100 % des frais. Une mutuelle comble le reste.", en: "Social security rarely covers 100% of costs. A top-up policy covers the rest." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Assurance habitation", en: "Home insurance" },
        body: { fr: "Obligatoire pour les locataires dans de nombreux pays. Couvre dégâts des eaux, vol, incendie.", en: "Mandatory for tenants in many countries. Covers water damage, theft and fire." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "S'affilier à la sécurité sociale", en: "Join the social security system" }, body: { fr: "Dès ton arrivée, contacte l'organisme local de protection sociale.", en: "As soon as you arrive, contact the local social protection agency." } },
      { title: { fr: "Choisir une mutuelle", en: "Choose a top-up plan" }, body: { fr: "Compare les garanties santé, remboursements optique/dentaire.", en: "Compare health guarantees, optical and dental reimbursements." } },
      { title: { fr: "Souscrire l'assurance habitation", en: "Take out home insurance" }, body: { fr: "Nécessaire avant la remise des clés de ton logement.", en: "Required before you receive the keys to your home." } },
      { title: { fr: "Vérifier ta responsabilité civile", en: "Check your liability cover" }, body: { fr: "Souvent incluse dans la mutuelle ou l'assurance habitation.", en: "Often included in your top-up or home insurance policy." } },
    ],
    trackerNodes: [
      { fr: "Sécu", en: "Social sec." }, { fr: "Mutuelle", en: "Top-up" },
      { fr: "Habitation", en: "Home ins." }, { fr: "RC", en: "Liability" },
    ],
    celebration: { title: [{ text: { fr: "Bien", en: "Well" }, color: RED }, { text: { fr: "protégé !", en: "protected!" }, color: "#fff" }], xp: 130 },
  },

  transport: {
    hero: { words: [
      { text: { fr: "Bouge", en: "Move" }, color: ORANGE },
      { text: { fr: "librement", en: "freely" }, color: "#fff" },
      { text: { fr: "partout.", en: "everywhere." }, color: ORANGE },
    ]},
    intro: {
      fr: "Permis de conduire, transports en commun, vélo ou voiture : organise tes déplacements.",
      en: "Driving licence, public transport, bike or car: organise your mobility.",
    },
    cleoMessage: {
      fr: "La mobilité, c'est la liberté. Voici tes options.",
      en: "Mobility is freedom. Here are your options.",
    },
    recos: transportRecos,
    brands: [
      { name: "SNCF", color: "#C0001A" }, { name: "RATP", color: "#009AA6" },
      { name: "BlaBlaCar", color: "#00B2EE" }, { name: "Lime", color: "#00D068" },
    ],
    story: [
      {
        title: { fr: "Échange de permis", en: "Licence exchange" },
        body: { fr: "Si ton pays d'origine a une convention avec le pays d'accueil, tu peux échanger ton permis sans repasser les examens.", en: "If your home country has an agreement with the host country, you can exchange your licence without retaking the test." },
        variant: "vivid", color: ORANGE,
      },
      {
        title: { fr: "Transports en commun", en: "Public transport" },
        body: { fr: "Abonnements mensuels souvent moins chers que la voiture pour les trajets urbains.", en: "Monthly passes are often cheaper than a car for urban commutes." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Vélo et trottinettes", en: "Bikes & scooters" },
        body: { fr: "Dans les grandes villes, les vélos en libre-service et trottinettes électriques complètent l'offre.", en: "In big cities, bike-share and e-scooters complement public transport perfectly." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Vérifier l'échange de permis", en: "Check licence exchange" }, body: { fr: "Renseigne-toi auprès de la préfecture ou équivalent local.", en: "Contact the local prefect's office or equivalent authority." } },
      { title: { fr: "S'abonner aux transports", en: "Buy a transport pass" }, body: { fr: "Carte mensuelle ou annuelle avec réductions selon ton statut.", en: "Monthly or annual pass with discounts depending on your status." } },
      { title: { fr: "Ouvrir un compte vélo/trottinette", en: "Sign up for bikes/scooters" }, body: { fr: "Véligo, Vélib', Lime : quelques euros par mois.", en: "Véligo, Vélib', Lime: a few euros a month." } },
      { title: { fr: "Assurer ton véhicule", en: "Insure your vehicle" }, body: { fr: "Obligatoire si tu roules en voiture ou moto.", en: "Mandatory if you drive a car or motorbike." } },
    ],
    trackerNodes: [
      { fr: "Permis", en: "Licence" }, { fr: "Abonnement", en: "Pass" },
      { fr: "Vélo", en: "Bike" }, { fr: "Assurance", en: "Insurance" },
    ],
    celebration: { title: [{ text: { fr: "Mobilité", en: "Mobility" }, color: ORANGE }, { text: { fr: "débloquée !", en: "unlocked!" }, color: "#fff" }], xp: 100 },
  },

  children: {
    hero: { words: [
      { text: { fr: "Tes", en: "Your" }, color: PINK },
      { text: { fr: "enfants,", en: "children," }, color: "#fff" },
      { text: { fr: "bien suivis.", en: "well looked after." }, color: PINK },
    ]},
    intro: {
      fr: "École, santé, aides familiales : tout ce qu'il faut pour que tes enfants s'épanouissent.",
      en: "School, health, family benefits: everything your children need to thrive.",
    },
    cleoMessage: {
      fr: "Pour tes enfants, on ne laisse rien au hasard.",
      en: "When it comes to your children, we leave nothing to chance.",
    },
    recos: childrenRecos,
    brands: [
      { name: "CAF", color: "#0065B0" }, { name: "PAJE", color: "#DA3832" },
      { name: "APL", color: "#005F8E" },
    ],
    story: [
      {
        title: { fr: "Scolarité obligatoire", en: "Compulsory schooling" },
        body: { fr: "L'école est obligatoire dès 3 ans dans la plupart des pays de l'UE. Inscris tes enfants dès ton arrivée.", en: "School is compulsory from age 3 in most EU countries. Enrol your children as soon as you arrive." },
        variant: "vivid", color: PINK,
      },
      {
        title: { fr: "Allocations familiales", en: "Family benefits" },
        body: { fr: "Des aides financières existent pour les familles avec enfants, sous conditions de résidence.", en: "Financial support exists for families with children, subject to residency conditions." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Suivi médical", en: "Medical follow-up" },
        body: { fr: "Calendrier vaccinal, médecin traitant : inscris tes enfants dès la première semaine.", en: "Vaccination schedule, GP: register your children in the first week." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Inscrire à l'école", en: "Enrol at school" }, body: { fr: "Contacter la mairie ou l'établissement scolaire avec les documents d'identité et de domicile.", en: "Contact the town hall or school with identity and address documents." } },
      { title: { fr: "Déclarer à la CAF", en: "Register with CAF" }, body: { fr: "Déclare la naissance ou l'arrivée de tes enfants pour déclencher les allocations.", en: "Declare the birth or arrival of your children to trigger family benefits." } },
      { title: { fr: "Trouver un pédiatre", en: "Find a paediatrician" }, body: { fr: "Choisis un médecin traitant pour tes enfants auprès de l'Assurance Maladie.", en: "Register a GP for your children with the health insurance system." } },
      { title: { fr: "Vérifier les vaccins", en: "Check vaccinations" }, body: { fr: "Certains vaccins obligatoires varient selon les pays. Mets à jour le carnet de santé.", en: "Mandatory vaccines vary by country. Update the health record." } },
    ],
    trackerNodes: [
      { fr: "École", en: "School" }, { fr: "CAF", en: "CAF" },
      { fr: "Pédiatre", en: "Paediatrician" }, { fr: "Vaccins", en: "Vaccines" },
    ],
    celebration: { title: [{ text: { fr: "Famille", en: "Family" }, color: PINK }, { text: { fr: "protégée !", en: "protected!" }, color: "#fff" }], xp: 160 },
  },

  retirement: {
    hero: { words: [
      { text: { fr: "Ta", en: "Your" }, color: PURPLE },
      { text: { fr: "retraite,", en: "retirement," }, color: "#fff" },
      { text: { fr: "sécurisée.", en: "secured." }, color: PURPLE },
    ]},
    intro: {
      fr: "Travailler à l'étranger impacte tes droits à la retraite. Anticipe dès aujourd'hui.",
      en: "Working abroad affects your pension rights. Start planning today.",
    },
    cleoMessage: {
      fr: "La retraite, ça se prépare maintenant. Voici ce qu'il faut savoir.",
      en: "Retirement planning starts now. Here's what you need to know.",
    },
    recos: retirementRecos,
    brands: [
      { name: "CNAV", color: "#003189" }, { name: "AGIRC-ARRCO", color: "#0071BC" },
      { name: "CORUM", color: "#FF6B35" },
    ],
    story: [
      {
        title: { fr: "Cotisations bifurquées", en: "Split contributions" },
        body: { fr: "Tes années de travail à l'étranger comptent, selon les accords bilatéraux de sécurité sociale.", en: "Your years of work abroad count, depending on bilateral social security agreements." },
        variant: "vivid", color: PURPLE,
      },
      {
        title: { fr: "Relevé de carrière", en: "Career statement" },
        body: { fr: "Consulte ton relevé de carrière régulièrement pour vérifier que toutes tes périodes sont comptabilisées.", en: "Check your career statement regularly to ensure all periods are recorded." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "Retraite complémentaire", en: "Supplementary pension" },
        body: { fr: "AGIRC-ARRCO pour les salariés, ou placement personnel si indépendant.", en: "AGIRC-ARRCO for employees, or personal investment if self-employed." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Consulter son relevé de carrière", en: "Check your career statement" }, body: { fr: "Crée ton espace sur le site de l'assurance retraite locale.", en: "Create your account on the local pension insurance website." } },
      { title: { fr: "Vérifier les accords bilatéraux", en: "Check bilateral agreements" }, body: { fr: "Entre ton pays d'origine et d'accueil pour la totalisation des trimestres.", en: "Between your home and host country for quarter accumulation." } },
      { title: { fr: "Épargner volontairement", en: "Save voluntarily" }, body: { fr: "PER, assurance-vie ou investissement immobilier pour compléter.", en: "PER, life insurance or property investment to supplement." } },
      { title: { fr: "Planifier le départ", en: "Plan your retirement" }, body: { fr: "Estime ton âge de départ et le montant prévisible de ta pension.", en: "Estimate your retirement age and expected pension amount." } },
    ],
    trackerNodes: [
      { fr: "Relevé", en: "Statement" }, { fr: "Accords", en: "Agreements" },
      { fr: "Épargne", en: "Savings" }, { fr: "Plan", en: "Plan" },
    ],
    celebration: { title: [{ text: { fr: "Retraite", en: "Retirement" }, color: PURPLE }, { text: { fr: "planifiée !", en: "planned!" }, color: "#fff" }], xp: 140 },
  },

  aids: {
    hero: { words: [
      { text: { fr: "Les", en: "The" }, color: GREEN },
      { text: { fr: "aides", en: "benefits" }, color: "#fff" },
      { text: { fr: "qui t'attendent.", en: "waiting for you." }, color: GREEN },
    ]},
    intro: {
      fr: "Aides au logement, allocations chômage, aides sociales : tu as peut-être droit à plus que tu ne le penses.",
      en: "Housing benefit, unemployment allowance, social aid: you may be entitled to more than you think.",
    },
    cleoMessage: {
      fr: "Des aides existent pour toi — allons les chercher ensemble.",
      en: "Benefits exist for you — let's find them together.",
    },
    recos: aidsRecos,
    brands: [
      { name: "CAF", color: "#0065B0" }, { name: "Pôle Emploi", color: "#005F8E" },
      { name: "CPAM", color: "#0071BC" }, { name: "Action Logement", color: "#E30613" },
    ],
    story: [
      {
        title: { fr: "APL — Aide au logement", en: "APL — Housing benefit" },
        body: { fr: "Si tu loues un appartement, tu peux percevoir l'APL directement sur ton loyer sous quelques semaines.", en: "If you rent, you can receive APL directly off your rent within a few weeks." },
        variant: "vivid", color: GREEN,
      },
      {
        title: { fr: "Allocations chômage", en: "Unemployment benefit" },
        body: { fr: "En cas de perte d'emploi, le ARE peut couvrir jusqu'à 75 % de ton salaire précédent.", en: "If you lose your job, ARE can cover up to 75% of your previous salary." },
        variant: "dark", color: "",
      },
      {
        title: { fr: "RSA et aides sociales", en: "RSA & social aid" },
        body: { fr: "Sous conditions de ressources et de durée de résidence, des minima sociaux sont accessibles.", en: "Subject to income and residency conditions, minimum income benefits are accessible." },
        variant: "dark", color: "",
      },
    ],
    guide: [
      { title: { fr: "Simuler tes droits", en: "Simulate your rights" }, body: { fr: "Utilise le simulateur officiel de la CAF pour connaître tes aides potentielles.", en: "Use the official CAF simulator to find out your potential benefits." } },
      { title: { fr: "Constituer ton dossier", en: "Build your file" }, body: { fr: "CAF, Pôle Emploi, CPAM : chaque organisme a ses propres formulaires.", en: "CAF, France Travail, CPAM: each body has its own forms." } },
      { title: { fr: "Déposer ta demande", en: "Submit your application" }, body: { fr: "En ligne ou en agence. Certaines aides sont rétroactives à la date de dépôt.", en: "Online or in person. Some benefits are backdated to the application date." } },
      { title: { fr: "Suivre l'avancement", en: "Track progress" }, body: { fr: "Espace personnel en ligne pour voir l'état de ta demande.", en: "Use your online personal space to check the status of your application." } },
    ],
    trackerNodes: [
      { fr: "Simulation", en: "Simulation" }, { fr: "Dossier", en: "File" },
      { fr: "Demande", en: "Application" }, { fr: "Suivi", en: "Tracking" },
    ],
    celebration: { title: [{ text: { fr: "Aides", en: "Benefits" }, color: GREEN }, { text: { fr: "obtenues !", en: "obtained!" }, color: "#fff" }], xp: 110 },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns building content resolved for the given language. */
export function getBuildingContent(lang: string): Record<Exclude<BuildingId, "airport">, BuildingContent> {
  const result = {} as Record<Exclude<BuildingId, "airport">, BuildingContent>;
  for (const key of Object.keys(RAW_CONTENT) as Exclude<BuildingId, "airport">[]) {
    result[key] = resolve(RAW_CONTENT[key], lang);
  }
  return result;
}

/** Legacy export kept for backward compatibility (defaults to French). */
export const BUILDING_CONTENT = getBuildingContent("fr");
