import type { OnboardingData } from "@/lib/store";
import type { Recommendation } from "@/lib/buildings";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Intake (onboarding profile → DB)
// ---------------------------------------------------------------------------

const EMPLOYMENT_MAP: Record<string, string> = {
  salaried: "employed_fulltime",
  searching: "between_jobs",
  student: "student",
  freelance: "freelance",
  retired: "retired",
};

const TIME_MAP: Record<string, string> = {
  less_3m: "just_arrived",
  "4_months": "settling_in",
  "1_3_years": "established",
  "3_plus": "established",
};

const ALREADY_MAP: Record<string, string> = {
  // Internal IDs (new — pass through to backend code)
  "id_card": "id_card",
  "passport": "passport",
  "visa": "visa",
  "residence_permit": "residence_permit",
  "proof_of_address": "proof_of_address",
  "local_bank_account": "local_bank_account",
  "tax_number": "tax_number",
  "employer_certificate": "employer_certificate",
  // Legacy French labels (backward compat)
  "Titre de séjour": "residence_permit",
  "Justificatif de domicile": "proof_of_address",
  "RIB français": "local_bank_account",
  "Numéro fiscal": "tax_number",
};

const ALLOWED_ALREADY = new Set([
  "local_bank_account",
  "local_phone",
  "proof_of_address",
  "social_security_number",
  "health_card",
  "residence_permit",
  "tax_number",
  "benefits_number",
]);

export async function sendIntake(onboarding: Partial<OnboardingData>): Promise<{ profile_id: number }> {
  const alreadyHas = (onboarding.already_has ?? [])
    .map((label) => ALREADY_MAP[label] ?? label)
    .filter((code) => ALLOWED_ALREADY.has(code));

  const payload = {
    first_name: onboarding.first_name ?? "",
    last_name: onboarding.last_name ?? "",
    date_of_birth: onboarding.date_of_birth ?? "",
    nationality: onboarding.nationality ?? "",
    country_of_residence: onboarding.nationality ?? "",   // proxy : pays d'origine
    country_moving_to: onboarding.country_moving_to ?? "",
    employment_status: EMPLOYMENT_MAP[onboarding.employment_status ?? ""] ?? onboarding.employment_status ?? "",
    has_income: onboarding.has_income ?? false,
    income_bracket: onboarding.has_income ? (onboarding.income_bracket ?? null) : null,
    currency: onboarding.currency ?? "EUR",
    time_at_destination: TIME_MAP[onboarding.time_in_france ?? ""] ?? null,
    has_financial_ties_abroad: onboarding.has_financial_ties_abroad ?? null,
    already_has: alreadyHas,
    goals: onboarding.goals ?? [],
  };

  const res = await fetch(`${API_URL}/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`POST /intake failed: ${res.status}`);
  return res.json() as Promise<{ profile_id: number }>;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export async function sendChat(
  profileId: number,
  message: string,
  history: ChatHistoryItem[],
): Promise<{ reply: string }> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile_id: profileId, message, history }),
  });
  if (!res.ok) throw new Error(`POST /chat failed: ${res.status}`);
  return res.json() as Promise<{ reply: string }>;
}

interface ApiReco {
  id: string;
  name: string;
  score: number;
  reasons: string[];
  url: string;
  warning?: string | null;
  tip?: string | null;
  opening_time?: string;
  features_summary?: {
    monthly_fee_eur: number;
    iban_type: string;
    multi_currency: boolean;
    credit: boolean;
    mobile_app: boolean;
  };
}

const EU_NATIONALITIES = ["FR", "DE", "ES", "IT", "PT", "BE", "NL", "PL", "RO", "SE", "AT", "CH"];

function mapOnboardingToProfile(onboarding: Partial<OnboardingData>) {
  const incomeMap: Record<string, number> = {
    "<1500": 1200,
    "1500-2000": 1750,
    "2000-3000": 2500,
    "3000-5000": 4000,
    "5000+": 6000,
  };

  const hasFrenchAddress = ["4_months", "1_3_years", "3_plus"].includes(
    onboarding.time_in_france ?? ""
  );

  const isNonEU = !EU_NATIONALITIES.includes(onboarding.nationality ?? "");

  const needs: string[] = [];
  if (!hasFrenchAddress) needs.push("no_french_address", "international_transfers");
  if (isNonEU) needs.push("multi_currency");
  if (hasFrenchAddress) needs.push("iban_fr");
  if (onboarding.income_bracket === "5000+") needs.push("wealth_management");
  if (onboarding.employment_status === "freelance") needs.push("freelance", "international_transfers");
  if (onboarding.employment_status === "student") needs.push("low_fees", "no_income_required");

  return {
    nationality: onboarding.nationality ?? undefined,
    has_french_address: hasFrenchAddress,
    income_range: onboarding.income_bracket ?? undefined,
    monthly_income_eur: onboarding.income_bracket
      ? incomeMap[onboarding.income_bracket]
      : undefined,
    situation: onboarding.employment_status ?? undefined,
    needs,
    languages: ["fr"],
    goals: onboarding.goals ?? [],
  };
}

function mapApiRecoToReco(reco: ApiReco, index: number): Recommendation {
  const fee = reco.features_summary
    ? `${reco.features_summary.monthly_fee_eur} €/mois`
    : "Voir site";
  const delay = reco.opening_time ?? "Variable";

  // score may be 0-1 (probability) or 0-100 (percentage) — normalise to 0-5
  const rawScore = reco.score ?? 0;
  const score5 = rawScore > 5 ? rawScore / 20 : rawScore > 1 ? rawScore : rawScore * 5;
  const rating = Math.min(5, Math.max(1, Math.round(score5 * 10) / 10));
  const note = rating.toFixed(1);

  return {
    name: reco.name,
    tagline: reco.reasons[0] ?? "Recommended for your profile",
    tagline_en: reco.reasons[0] ?? "Recommended for your profile",
    url: reco.url,
    rating,
    badge: index === 0 ? "MEILLEUR MATCH" : undefined,
    metrics: [
      { label: "Frais", label_en: "Fees", value: fee },
      { label: "Délai", label_en: "Delay", value: delay },
      { label: "Note", label_en: "Score", value: note },
    ],
  };
}

export interface UserProfile {
  nationality?: string;
  has_french_address?: boolean;
  visa_type?: string;
  income_range?: string;
  monthly_income_eur?: number;
  situation?: string;
  needs?: string[];
  languages?: string[];
  goals?: string[];
}

async function callRecommendEndpoint(profile: UserProfile): Promise<Recommendation[]> {
  const res = await fetch(`${API_URL}/banks/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, documents: [] }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);

  const json = await res.json() as { success: boolean; data: { recommendations: ApiReco[] } };
  const apiRecos = json?.data?.recommendations ?? [];

  return apiRecos.slice(0, 3).map(mapApiRecoToReco);
}

export const STATIC_BANK_RECOS: Recommendation[] = [
  {
    name: "Wise",
    tagline: "Compte multi-devises — IBAN local dans 10+ pays, frais minimaux",
    tagline_en: "Multi-currency account — local IBAN in 10+ countries, minimal fees",
    url: "https://wise.com/fr",
    rating: 4.8,
    badge: "MEILLEUR MATCH",
    metrics: [
      { label: "Frais", label_en: "Fees", value: "0 €/mois" },
      { label: "Délai", label_en: "Delay", value: "< 1 min" },
      { label: "Note", label_en: "Score", value: "4.8" },
    ],
  },
  {
    name: "Revolut",
    tagline: "App ultra-simple — IBAN EU, taux de change interbancaire",
    tagline_en: "Ultra-simple app — EU IBAN, interbank exchange rates",
    url: "https://www.revolut.com/fr-FR",
    rating: 4.6,
    metrics: [
      { label: "Frais", label_en: "Fees", value: "0 €/mois" },
      { label: "Délai", label_en: "Delay", value: "< 5 min" },
      { label: "Note", label_en: "Score", value: "4.6" },
    ],
  },
  {
    name: "N26",
    tagline: "Banque 100% mobile — IBAN DE/EU, support 24h en français",
    tagline_en: "100% mobile bank — DE/EU IBAN, 24h support in English",
    url: "https://n26.com/fr-fr",
    rating: 4.4,
    metrics: [
      { label: "Frais", label_en: "Fees", value: "0 €/mois" },
      { label: "Délai", label_en: "Delay", value: "8 min" },
      { label: "Note", label_en: "Score", value: "4.4" },
    ],
  },
];

export async function getBankRecommendations(profile: UserProfile): Promise<Recommendation[]> {
  return callRecommendEndpoint(profile);
}

export async function fetchBankRecommendations(
  onboarding: Partial<OnboardingData>
): Promise<Recommendation[]> {
  return callRecommendEndpoint(mapOnboardingToProfile(onboarding));
}
