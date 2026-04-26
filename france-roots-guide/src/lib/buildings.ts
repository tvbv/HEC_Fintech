import type { BuildingId } from "./theme";
import { STATIC_BANK_RECOS } from "./api";

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

export interface Recommendation {
  name: string;
  tagline: string;
  url: string;
  rating: number;
  badge?: string;
  metrics: { label: string; value: string }[];
}

interface HeroWord {
  text: string;
  color: string;
}

interface StoryCard {
  title: string;
  body: string;
  variant: "vivid" | "dark";
  color: string;
}

interface GuideStep {
  title: string;
  body: string;
}

interface Brand {
  name: string;
  color: string;
}

interface BuildingContent {
  hero: { words: HeroWord[] };
  intro: string;
  cleoMessage: string;
  recos: Recommendation[];
  brands: Brand[];
  story: StoryCard[];
  guide: GuideStep[];
  trackerNodes: string[];
  celebration: { title: HeroWord[]; xp: number };
}

const LEMON = "#FACC15";
const PURPLE = "#A78BFA";
const PINK = "#F472B6";
const GREEN = "#4ADE80";
const BLUE = "#60A5FA";
const ORANGE = "#FB923C";
const RED = "#F87171";
const TEAL = "#38BDF8";

const housingRecos: Recommendation[] = [
  {
    name: "Visale",
    tagline: "Garant gratuit de l'État — idéal sans garant personnel",
    url: "https://www.visale.fr",
    rating: 4.8,
    badge: "MEILLEUR MATCH",
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Délai", value: "48h" }, { label: "Note", value: "4.8" }],
  },
  {
    name: "SeLoger",
    tagline: "N°1 des annonces immobilières — location et achat",
    url: "https://www.seloger.com",
    rating: 4.2,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Annonces", value: "+500k" }, { label: "Note", value: "4.2" }],
  },
  {
    name: "Lokaviz",
    tagline: "Logements étudiants et jeunes actifs — prix abordables",
    url: "https://www.lokaviz.fr",
    rating: 3.9,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Profil", value: "Étudiants" }, { label: "Note", value: "3.9" }],
  },
];

const workRecos: Recommendation[] = [
  {
    name: "France Travail",
    tagline: "Inscription obligatoire — ouvre tes droits au chômage et à l'accompagnement",
    url: "https://www.francetravail.fr",
    rating: 4.5,
    badge: "PRIORITAIRE",
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Délai", value: "24h" }, { label: "Note", value: "4.5" }],
  },
  {
    name: "LinkedIn",
    tagline: "Réseau professionnel — 15M+ offres, networking, profil visible",
    url: "https://www.linkedin.com/jobs",
    rating: 4.4,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Offres FR", value: "500k+" }, { label: "Note", value: "4.4" }],
  },
  {
    name: "Welcome to the Jungle",
    tagline: "Startups & scale-ups — transparence totale sur les entreprises",
    url: "https://www.welcometothejungle.com",
    rating: 4.3,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Culture", value: "Startup" }, { label: "Note", value: "4.3" }],
  },
];

const taxesRecos: Recommendation[] = [
  {
    name: "impots.gouv.fr",
    tagline: "Site officiel — déclare tes revenus, consulte ton espace fiscal",
    url: "https://www.impots.gouv.fr",
    rating: 4.6,
    badge: "OFFICIEL",
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Type", value: "Gouvernement" }, { label: "Note", value: "4.6" }],
  },
  {
    name: "Indy",
    tagline: "Comptabilité automatisée pour freelances et TNS",
    url: "https://www.indy.fr",
    rating: 4.3,
    metrics: [{ label: "Coût", value: "Dès 0€/mois" }, { label: "Profil", value: "Freelance" }, { label: "Note", value: "4.3" }],
  },
  {
    name: "Mes Impôts Simplifié",
    tagline: "Simulateur de déclaration — estime ton impôt avant de déclarer",
    url: "https://simulateur-ir-ifi.impots.gouv.fr",
    rating: 4.1,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Type", value: "Simulateur" }, { label: "Note", value: "4.1" }],
  },
];

const insuranceRecos: Recommendation[] = [
  {
    name: "Alan",
    tagline: "Mutuelle 100% digitale — remboursements en 24h via l'app",
    url: "https://alan.com",
    rating: 4.7,
    badge: "MEILLEUR MATCH",
    metrics: [{ label: "Coût", value: "Dès 12€/mois" }, { label: "Délai rembours.", value: "24h" }, { label: "Note", value: "4.7" }],
  },
  {
    name: "Luko",
    tagline: "Assurance habitation en 2 minutes — 100% en ligne",
    url: "https://www.luko.eu",
    rating: 4.4,
    metrics: [{ label: "Coût", value: "Dès 5€/mois" }, { label: "Souscription", value: "2 min" }, { label: "Note", value: "4.4" }],
  },
  {
    name: "MGEN",
    tagline: "Mutuelle solide pour salariés — couverture complète optique & dentaire",
    url: "https://www.mgen.fr",
    rating: 4.2,
    metrics: [{ label: "Coût", value: "Selon salaire" }, { label: "Profil", value: "Salarié" }, { label: "Note", value: "4.2" }],
  },
];

const transportRecos: Recommendation[] = [
  {
    name: "Navigo Mois",
    tagline: "Abonnement mensuel illimité Île-de-France — métro, RER, bus",
    url: "https://www.iledefrance-mobilites.fr",
    rating: 4.8,
    badge: "INCONTOURNABLE",
    metrics: [{ label: "Coût", value: "86€/mois" }, { label: "Zones", value: "1-5" }, { label: "Note", value: "4.8" }],
  },
  {
    name: "Vélib' Métropole",
    tagline: "Vélo en libre-service 24h/24 — idéal pour le dernier km",
    url: "https://www.velib-metropole.fr",
    rating: 4.3,
    metrics: [{ label: "Coût", value: "Dès 3€/mois" }, { label: "Stations", value: "+1400" }, { label: "Note", value: "4.3" }],
  },
  {
    name: "Lime",
    tagline: "Trottinettes & vélos électriques — à la minute",
    url: "https://www.li.me/fr-fr",
    rating: 4.0,
    metrics: [{ label: "Coût", value: "0,25€/min" }, { label: "Type", value: "Free-floating" }, { label: "Note", value: "4.0" }],
  },
];

const retirementRecos: Recommendation[] = [
  {
    name: "Assurance Retraite",
    tagline: "Consulte ton relevé de carrière et estime ta future pension",
    url: "https://www.lassuranceretraite.fr",
    rating: 4.7,
    badge: "OFFICIEL",
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Type", value: "Gouvernement" }, { label: "Note", value: "4.7" }],
  },
  {
    name: "PER Individuel (Linxea)",
    tagline: "Plan Épargne Retraite — défiscalise jusqu'à 10% de tes revenus",
    url: "https://www.linxea.com/epargne-retraite/per",
    rating: 4.4,
    metrics: [{ label: "Coût", value: "Dès 0 frais gestion" }, { label: "Avantage", value: "Défiscalisation" }, { label: "Note", value: "4.4" }],
  },
  {
    name: "Mon compte retraite",
    tagline: "Espace officiel multi-régimes — tous tes droits en un seul endroit",
    url: "https://www.info-retraite.fr",
    rating: 4.3,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Régimes", value: "Tous" }, { label: "Note", value: "4.3" }],
  },
];

const childrenRecos: Recommendation[] = [
  {
    name: "CAF — Allocations Familiales",
    tagline: "Déclare tes enfants et touche les allocations dès le 2ème mois",
    url: "https://www.caf.fr",
    rating: 4.6,
    badge: "PRIORITAIRE",
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Délai", value: "2 mois" }, { label: "Note", value: "4.6" }],
  },
  {
    name: "Mon Enfant.fr",
    tagline: "Trouver une crèche, une assistante maternelle, un EAJE près de chez toi",
    url: "https://www.monenfant.fr",
    rating: 4.2,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Type", value: "Annuaire officiel" }, { label: "Note", value: "4.2" }],
  },
  {
    name: "Ameli — Carnet de santé",
    tagline: "Suivi vaccinal et médecin traitant pour tes enfants",
    url: "https://www.ameli.fr",
    rating: 4.4,
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Service", value: "Assurance Maladie" }, { label: "Note", value: "4.4" }],
  },
];

const aidsRecos: Recommendation[] = [
  {
    name: "Mes Droits Sociaux",
    tagline: "Simulateur officiel — découvre toutes les aides auxquelles tu as droit",
    url: "https://www.mesdroitssociaux.gouv.fr",
    rating: 4.8,
    badge: "INCONTOURNABLE",
    metrics: [{ label: "Coût", value: "Gratuit" }, { label: "Type", value: "Simulateur officiel" }, { label: "Note", value: "4.8" }],
  },
  {
    name: "CAF — APL",
    tagline: "Aide au logement — jusqu'à 380€/mois selon ton loyer et tes revenus",
    url: "https://www.caf.fr/aides-et-services/s-informer-sur-les-aides/logement",
    rating: 4.6,
    metrics: [{ label: "Montant max", value: "~380€/mois" }, { label: "Délai", value: "~4 semaines" }, { label: "Note", value: "4.6" }],
  },
  {
    name: "Complémentaire Santé Solidaire",
    tagline: "Mutuelle gratuite ou quasi-gratuite pour revenus modestes",
    url: "https://www.complementaire-sante-solidaire.gouv.fr",
    rating: 4.5,
    metrics: [{ label: "Coût", value: "0-30€/mois" }, { label: "Accès", value: "Automatique" }, { label: "Note", value: "4.5" }],
  },
];

export const BUILDING_CONTENT: Record<Exclude<BuildingId, "airport">, BuildingContent> = {
  bank: {
    hero: { words: [{ text: "Ta", color: LEMON }, { text: "banque", color: "#fff" }, { text: "idéale.", color: LEMON }] },
    intro: "Ouvrir un compte dans un nouveau pays, c'est la première étape. On t'aide à choisir la bonne.",
    cleoMessage: "Chaque profil a sa banque parfaite — on va trouver la tienne.",
    recos: STATIC_BANK_RECOS,
    brands: [
      { name: "BNP", color: "#009FE3" },
      { name: "HSBC", color: "#DB0011" },
      { name: "N26", color: "#26D07C" },
      { name: "Revolut", color: "#0075EB" },
      { name: "Wise", color: "#9FE870" },
      { name: "CIC", color: "#E30613" },
    ],
    story: [
      { title: "IBAN local indispensable", body: "Un IBAN local est exigé pour louer un appartement, recevoir un salaire ou payer des factures.", variant: "vivid", color: LEMON },
      { title: "Banques 100 % en ligne", body: "Revolut, Wise et N26 permettent une ouverture en quelques minutes, sans adresse locale.", variant: "dark", color: "" },
      { title: "Banques traditionnelles", body: "BNP, Société Générale et HSBC offrent un IBAN local mais nécessitent souvent un justificatif de domicile.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Choisir ta banque", body: "Compare les frais, délais d'ouverture et services disponibles pour ton profil." },
      { title: "Réunir les documents", body: "Passeport, visa, justificatif de domicile (si disponible)." },
      { title: "Ouvrir le compte", body: "En ligne ou en agence, selon la banque choisie." },
      { title: "Activer la carte", body: "Effectue un premier virement ou retrait pour activer ton compte." },
    ],
    trackerNodes: ["Choix", "Dossier", "Ouverture", "Activation"],
    celebration: { title: [{ text: "Compte", color: LEMON }, { text: "ouvert !", color: "#fff" }], xp: 150 },
  },

  housing: {
    hero: { words: [{ text: "Ton", color: BLUE }, { text: "logement,", color: "#fff" }, { text: "trouvé.", color: BLUE }] },
    intro: "Trouver un logement à l'étranger peut sembler complexe. Voici les étapes clés.",
    cleoMessage: "Un toit, c'est la base. Commençons par là.",
    recos: housingRecos,
    brands: [
      { name: "Airbnb", color: "#FF5A5F" },
      { name: "Leboncoin", color: "#FF6D00" },
      { name: "SeLoger", color: "#0065B0" },
      { name: "PAP", color: "#DA3832" },
    ],
    story: [
      { title: "Garant obligatoire", body: "La plupart des propriétaires exigent un garant local ou un service comme Visale.", variant: "vivid", color: BLUE },
      { title: "Visale gratuit", body: "Le service gouvernemental Visale agit comme garant si tu as moins de 30 ans ou un CDI récent.", variant: "dark", color: "" },
      { title: "Résidence temporaire", body: "Commence par une colocation ou un meublé le temps de constituer ton dossier.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Définir ton budget", body: "Inclus loyer + charges + caution (1 à 2 mois de loyer)." },
      { title: "Préparer ton dossier", body: "Passeport, contrat de travail, 3 derniers bulletins de salaire, relevés bancaires." },
      { title: "Obtenir un garant", body: "Visale, garant physique ou service de cautionnement privé." },
      { title: "Signer le bail", body: "Lis attentivement le contrat. Fais l'état des lieux d'entrée." },
    ],
    trackerNodes: ["Budget", "Dossier", "Garant", "Signature"],
    celebration: { title: [{ text: "Logement", color: BLUE }, { text: "sécurisé !", color: "#fff" }], xp: 200 },
  },

  work: {
    hero: { words: [{ text: "Ton", color: TEAL }, { text: "emploi,", color: "#fff" }, { text: "légalement.", color: TEAL }] },
    intro: "Travailler légalement dans un nouveau pays demande quelques démarches. On t'accompagne.",
    cleoMessage: "Un contrat en règle, c'est la sécurité. Voici comment l'obtenir.",
    recos: workRecos,
    brands: [
      { name: "LinkedIn", color: "#0A66C2" },
      { name: "Indeed", color: "#2164F3" },
      { name: "APEC", color: "#D50000" },
      { name: "Pôle Emploi", color: "#005F8E" },
    ],
    story: [
      { title: "Autorisation de travail", body: "Selon ta nationalité, un titre de séjour mention 'salarié' ou 'travailleur temporaire' peut être nécessaire.", variant: "vivid", color: TEAL },
      { title: "Numéro de Sécurité Sociale", body: "Tu reçois un numéro provisoire à l'embauche, puis définitif sous 3 à 6 mois.", variant: "dark", color: "" },
      { title: "Contrat de travail", body: "CDI, CDD ou freelance : chaque statut a ses droits et obligations.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Vérifier ton droit au travail", body: "Consulte les conditions liées à ton visa ou titre de séjour." },
      { title: "S'inscrire à Pôle Emploi", body: "Même si tu travailles déjà, l'inscription ouvre des droits." },
      { title: "Obtenir ton numéro SS", body: "Ton employeur démarre la procédure à l'embauche." },
      { title: "Comprendre ta fiche de paie", body: "Brut, net, cotisations : décrypte chaque ligne." },
    ],
    trackerNodes: ["Droit", "Inscription", "Numéro SS", "Paie"],
    celebration: { title: [{ text: "Emploi", color: TEAL }, { text: "sécurisé !", color: "#fff" }], xp: 180 },
  },

  taxes: {
    hero: { words: [{ text: "Tes", color: GREEN }, { text: "impôts,", color: "#fff" }, { text: "maîtrisés.", color: GREEN }] },
    intro: "Comprendre le système fiscal de ton pays d'accueil est essentiel pour éviter les mauvaises surprises.",
    cleoMessage: "Les impôts, ça fait peur mais c'est gérable. Je t'explique.",
    recos: taxesRecos,
    brands: [
      { name: "Impots.gouv", color: "#003189" },
      { name: "Alan", color: "#5551FF" },
      { name: "Indy", color: "#FF6B35" },
    ],
    story: [
      { title: "Résidence fiscale", body: "Si tu passes plus de 183 jours dans un pays, tu y es généralement résident fiscal.", variant: "vivid", color: GREEN },
      { title: "Double imposition", body: "Des conventions fiscales entre pays évitent d'être taxé deux fois sur les mêmes revenus.", variant: "dark", color: "" },
      { title: "Première déclaration", body: "Elle couvre les revenus perçus depuis ton arrivée. L'administration fiscale envoie un guide aux nouveaux résidents.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Déterminer ta résidence fiscale", body: "Vérifie les critères : durée de séjour, centre des intérêts économiques." },
      { title: "S'inscrire aux impôts", body: "Crée ton espace personnel sur le site des impôts locaux." },
      { title: "Rassembler tes justificatifs", body: "Fiches de paie, relevés bancaires, quittances de loyer." },
      { title: "Déclarer tes revenus", body: "Respecte les délais — des pénalités s'appliquent en cas de retard." },
    ],
    trackerNodes: ["Résidence", "Inscription", "Justificatifs", "Déclaration"],
    celebration: { title: [{ text: "Impôts", color: GREEN }, { text: "déclarés !", color: "#fff" }], xp: 120 },
  },

  insurance: {
    hero: { words: [{ text: "Protège-toi", color: RED }, { text: "dès", color: "#fff" }, { text: "l'arrivée.", color: RED }] },
    intro: "Santé, habitation, responsabilité civile : souscrire les bonnes assurances protège ta vie à l'étranger.",
    cleoMessage: "Une bonne assurance, c'est la tranquillité d'esprit. Voici ce dont tu as besoin.",
    recos: insuranceRecos,
    brands: [
      { name: "Alan", color: "#5551FF" },
      { name: "AXA", color: "#00008F" },
      { name: "MGEN", color: "#0071BC" },
      { name: "Luko", color: "#4CAF50" },
    ],
    story: [
      { title: "Assurance maladie obligatoire", body: "Dans la plupart des pays, une couverture santé de base est obligatoire. Informe-toi sur le délai d'affiliation.", variant: "vivid", color: RED },
      { title: "Mutuelle complémentaire", body: "La sécurité sociale couvre rarement 100 % des frais. Une mutuelle comble le reste.", variant: "dark", color: "" },
      { title: "Assurance habitation", body: "Obligatoire pour les locataires dans de nombreux pays. Couvre dégâts des eaux, vol, incendie.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "S'affilier à la sécurité sociale", body: "Dès ton arrivée, contacte l'organisme local de protection sociale." },
      { title: "Choisir une mutuelle", body: "Compare les garanties santé, remboursements optique/dentaire." },
      { title: "Souscrire l'assurance habitation", body: "Nécessaire avant la remise des clés de ton logement." },
      { title: "Vérifier ta responsabilité civile", body: "Souvent incluse dans la mutuelle ou l'assurance habitation." },
    ],
    trackerNodes: ["Sécu", "Mutuelle", "Habitation", "RC"],
    celebration: { title: [{ text: "Bien", color: RED }, { text: "protégé !", color: "#fff" }], xp: 130 },
  },

  transport: {
    hero: { words: [{ text: "Bouge", color: ORANGE }, { text: "librement", color: "#fff" }, { text: "partout.", color: ORANGE }] },
    intro: "Permis de conduire, transports en commun, vélo ou voiture : organise tes déplacements.",
    cleoMessage: "La mobilité, c'est la liberté. Voici tes options.",
    recos: transportRecos,
    brands: [
      { name: "SNCF", color: "#C0001A" },
      { name: "RATP", color: "#009AA6" },
      { name: "BlaBlaCar", color: "#00B2EE" },
      { name: "Lime", color: "#00D068" },
    ],
    story: [
      { title: "Échange de permis", body: "Si ton pays d'origine a une convention avec le pays d'accueil, tu peux échanger ton permis sans repasser les examens.", variant: "vivid", color: ORANGE },
      { title: "Transports en commun", body: "Abonnements mensuels souvent moins chers que la voiture pour les trajets urbains.", variant: "dark", color: "" },
      { title: "Vélo et trottinettes", body: "Dans les grandes villes, les vélos en libre-service et trottinettes électriques complètent l'offre.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Vérifier l'échange de permis", body: "Renseigne-toi auprès de la préfecture ou équivalent local." },
      { title: "S'abonner aux transports", body: "Carte mensuelle ou annuelle avec réductions selon ton statut." },
      { title: "Ouvrir un compte vélo/trottinette", body: "Véligo, Vélib', Lime : quelques euros par mois." },
      { title: "Assurer ton véhicule", body: "Obligatoire si tu roules en voiture ou moto." },
    ],
    trackerNodes: ["Permis", "Abonnement", "Vélo", "Assurance"],
    celebration: { title: [{ text: "Mobilité", color: ORANGE }, { text: "débloquée !", color: "#fff" }], xp: 100 },
  },

  children: {
    hero: { words: [{ text: "Tes", color: PINK }, { text: "enfants,", color: "#fff" }, { text: "bien suivis.", color: PINK }] },
    intro: "École, santé, aides familiales : tout ce qu'il faut pour que tes enfants s'épanouissent.",
    cleoMessage: "Pour tes enfants, on ne laisse rien au hasard.",
    recos: childrenRecos,
    brands: [
      { name: "CAF", color: "#0065B0" },
      { name: "PAJE", color: "#DA3832" },
      { name: "APL", color: "#005F8E" },
    ],
    story: [
      { title: "Scolarité obligatoire", body: "L'école est obligatoire dès 3 ans dans la plupart des pays de l'UE. Inscris tes enfants dès ton arrivée.", variant: "vivid", color: PINK },
      { title: "Allocations familiales", body: "Des aides financières existent pour les familles avec enfants, sous conditions de résidence.", variant: "dark", color: "" },
      { title: "Suivi médical", body: "Calendrier vaccinal, médecin traitant : inscris tes enfants dès la première semaine.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Inscrire à l'école", body: "Contacter la mairie ou l'établissement scolaire avec les documents d'identité et de domicile." },
      { title: "Déclarer à la CAF", body: "Déclare la naissance ou l'arrivée de tes enfants pour déclencher les allocations." },
      { title: "Trouver un pédiatre", body: "Choisis un médecin traitant pour tes enfants auprès de l'Assurance Maladie." },
      { title: "Vérifier les vaccins", body: "Certains vaccins obligatoires varient selon les pays. Mets à jour le carnet de santé." },
    ],
    trackerNodes: ["École", "CAF", "Pédiatre", "Vaccins"],
    celebration: { title: [{ text: "Famille", color: PINK }, { text: "protégée !", color: "#fff" }], xp: 160 },
  },

  retirement: {
    hero: { words: [{ text: "Ta", color: PURPLE }, { text: "retraite,", color: "#fff" }, { text: "sécurisée.", color: PURPLE }] },
    intro: "Travailler à l'étranger impacte tes droits à la retraite. Anticipe dès aujourd'hui.",
    cleoMessage: "La retraite, ça se prépare maintenant. Voici ce qu'il faut savoir.",
    recos: retirementRecos,
    brands: [
      { name: "CNAV", color: "#003189" },
      { name: "AGIRC-ARRCO", color: "#0071BC" },
      { name: "CORUM", color: "#FF6B35" },
    ],
    story: [
      { title: "Cotisations bifurcquées", body: "Tes années de travail à l'étranger comptent, selon les accords bilatéraux de sécurité sociale.", variant: "vivid", color: PURPLE },
      { title: "Relevé de carrière", body: "Consulte ton relevé de carrière régulièrement pour vérifier que toutes tes périodes sont comptabilisées.", variant: "dark", color: "" },
      { title: "Retraite complémentaire", body: "AGIRC-ARRCO pour les salariés, ou placement personnel si indépendant.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Consulter son relevé de carrière", body: "Crée ton espace sur le site de l'assurance retraite locale." },
      { title: "Vérifier les accords bilatéraux", body: "Entre ton pays d'origine et d'accueil pour la totalisation des trimestres." },
      { title: "Épargner volontairement", body: "PER, assurance-vie ou investissement immobilier pour compléter." },
      { title: "Planifier le départ", body: "Estime ton âge de départ et le montant prévisible de ta pension." },
    ],
    trackerNodes: ["Relevé", "Accords", "Épargne", "Plan"],
    celebration: { title: [{ text: "Retraite", color: PURPLE }, { text: "planifiée !", color: "#fff" }], xp: 140 },
  },

  aids: {
    hero: { words: [{ text: "Les", color: GREEN }, { text: "aides", color: "#fff" }, { text: "qui t'attendent.", color: GREEN }] },
    intro: "Aides au logement, allocations chômage, aides sociales : tu as peut-être droit à plus que tu ne le penses.",
    cleoMessage: "Des aides existent pour toi — allons les chercher ensemble.",
    recos: aidsRecos,
    brands: [
      { name: "CAF", color: "#0065B0" },
      { name: "Pôle Emploi", color: "#005F8E" },
      { name: "CPAM", color: "#0071BC" },
      { name: "Action Logement", color: "#E30613" },
    ],
    story: [
      { title: "APL — Aide au logement", body: "Si tu loues un appartement, tu peux percevoir l'APL directement sur ton loyer sous quelques semaines.", variant: "vivid", color: GREEN },
      { title: "Allocations chômage", body: "En cas de perte d'emploi, le ARE (Aide au Retour à l'Emploi) peut couvrir jusqu'à 75 % de ton salaire précédent.", variant: "dark", color: "" },
      { title: "RSA et aides sociales", body: "Sous conditions de ressources et de durée de résidence, des minima sociaux sont accessibles.", variant: "dark", color: "" },
    ],
    guide: [
      { title: "Simuler tes droits", body: "Utilise le simulateur officiel de la CAF pour connaître tes aides potentielles." },
      { title: "Constituer ton dossier", body: "CAF, Pôle Emploi, CPAM : chaque organisme a ses propres formulaires." },
      { title: "Déposer ta demande", body: "En ligne ou en agence. Certaines aides sont rétroactives à la date de dépôt." },
      { title: "Suivre l'avancement", body: "Espace personnel en ligne pour voir l'état de ta demande." },
    ],
    trackerNodes: ["Simulation", "Dossier", "Demande", "Suivi"],
    celebration: { title: [{ text: "Aides", color: GREEN }, { text: "obtenues !", color: "#fff" }], xp: 110 },
  },
};
