import type { OnboardingData } from "@/lib/store";
import type { Recommendation } from "@/lib/buildings";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

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
  const note = (reco.score * 5).toFixed(1);

  return {
    name: reco.name,
    tagline: reco.reasons[0] ?? "Recommandé pour votre profil",
    url: reco.url,
    rating: Math.round(reco.score * 5 * 10) / 10,
    badge: index === 0 ? "MEILLEUR MATCH" : undefined,
    metrics: [
      { label: "Frais", value: fee },
      { label: "Délai", value: delay },
      { label: "Note", value: note },
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
    name: "HSBC France",
    tagline: "Réseau mondial — gestion de patrimoine pour expatriés premium",
    url: "https://www.hsbc.fr/1/2/hsbc-france/particuliers/international",
    rating: 4.0,
    badge: "MEILLEUR MATCH",
    metrics: [
      { label: "Frais", value: "25 €/mois" },
      { label: "Délai", value: "3-5 jours" },
      { label: "IBAN", value: "FR76 ✓" },
    ],
  },
  {
    name: "Orange Bank",
    tagline: "IBAN français sans frais — adossée à Société Générale",
    url: "https://www.orangebank.fr",
    rating: 3.5,
    metrics: [
      { label: "Frais", value: "0 €/mois" },
      { label: "Délai", value: "15 min en ligne" },
      { label: "IBAN", value: "FR76 ✓" },
    ],
  },
  {
    name: "CIC Expat",
    tagline: "Ouverture avant l'arrivée en France — IBAN FR dès le 1er jour",
    url: "https://www.cic.fr/particuliers/international/expatries.html",
    rating: 4.0,
    metrics: [
      { label: "Frais", value: "6 €/mois" },
      { label: "Délai", value: "Depuis l'étranger" },
      { label: "IBAN", value: "FR76 ✓" },
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
