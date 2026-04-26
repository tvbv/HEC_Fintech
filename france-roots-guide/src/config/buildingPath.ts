/**
 * Ordre d’affichage et de déblocage sur /city.
 * Source unique (évite toute ambiguïté au build ou en cache) :
 * Aéroport → Banque → Travail → Impôts → Aides → le reste.
 */
export const BUILDING_PATH_ORDER = [
  "airport",
  "bank",
  "work",
  "taxes",
  "aids",
  "housing",
  "insurance",
  "transport",
  "children",
  "retirement",
] as const;
