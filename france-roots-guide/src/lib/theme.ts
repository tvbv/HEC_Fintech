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

export const buildingOrder: BuildingId[] = [
  "airport",
  "bank",
  "housing",
  "work",
  "taxes",
  "insurance",
  "transport",
  "children",
  "retirement",
  "aids",
];

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
