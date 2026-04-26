import { BUILDING_PATH_ORDER } from "../config/buildingPath";

export type BuildingId =
  | "airport"
  | "bank"
  | "taxes"
  | "housing"
  | "insurance"
  | "transport"
  | "work"
  | "retirement"
  | "children"
  | "aids";

export interface BuildingTheme {
  name: string;
  color: string;
  textColor: string;
}

export const buildingThemes: Record<BuildingId, BuildingTheme> = {
  airport:    { name: "Aéroport",    color: "#A78BFA", textColor: "#000" },
  bank:       { name: "Banque",      color: "#FACC15", textColor: "#000" },
  taxes:      { name: "Impôts",      color: "#34D399", textColor: "#000" },
  housing:    { name: "Logement",    color: "#60A5FA", textColor: "#000" },
  insurance:  { name: "Assurance",   color: "#F87171", textColor: "#fff" },
  transport:  { name: "Transport",   color: "#FB923C", textColor: "#000" },
  work:       { name: "Travail",     color: "#38BDF8", textColor: "#000" },
  retirement: { name: "Retraite",    color: "#C084FC", textColor: "#fff" },
  children:   { name: "Enfants",     color: "#F472B6", textColor: "#fff" },
  aids:       { name: "Aides",       color: "#4ADE80", textColor: "#000" },
};

/** Même ordre que `src/config/buildingPath.ts` (re-export pour dashboard, generating, etc.) */
export const buildingOrder: BuildingId[] = [...BUILDING_PATH_ORDER] as BuildingId[];

export const buildingRequiredDocs: Record<Exclude<BuildingId, "airport">, string[]> = {
  bank:       ["passeport", "identité", "justificatif"],
  housing:    ["passeport", "contrat", "garant"],
  work:       ["contrat", "travail"],
  taxes:      ["avis", "impôts", "fiscal"],
  insurance:  ["assurance", "contrat"],
  transport:  ["permis", "transport"],
  children:   ["naissance", "famille"],
  retirement: ["retraite", "pension"],
  aids:       ["CAF", "aide", "allocations"],
};
