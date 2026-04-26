// SVG monochrome de la France métropolitaine — 13 régions cliquables
// Paths simplifiés (approximatifs) en viewBox 0 0 500 500

export interface FranceRegion {
  id: string;
  name: string;
  cities: string[];
  // path SVG simplifié
  d: string;
}

export const FRANCE_REGIONS: FranceRegion[] = [
  { id: "idf", name: "Île-de-France", cities: ["Paris", "Versailles", "Saint-Denis", "Boulogne-Billancourt", "Créteil"],
    d: "M255,165 L295,160 L305,185 L290,205 L260,210 L240,195 Z" },
  { id: "hdf", name: "Hauts-de-France", cities: ["Lille", "Amiens", "Calais", "Roubaix", "Dunkerque"],
    d: "M230,80 L320,75 L335,130 L290,150 L240,140 L220,110 Z" },
  { id: "norm", name: "Normandie", cities: ["Rouen", "Caen", "Le Havre", "Cherbourg", "Évreux"],
    d: "M130,115 L230,110 L235,155 L210,170 L150,165 L115,140 Z" },
  { id: "bret", name: "Bretagne", cities: ["Rennes", "Brest", "Quimper", "Saint-Malo", "Lorient"],
    d: "M30,170 L130,160 L140,205 L100,225 L40,215 L20,195 Z" },
  { id: "pdl", name: "Pays de la Loire", cities: ["Nantes", "Angers", "Le Mans", "La Roche-sur-Yon", "Cholet"],
    d: "M100,225 L195,215 L205,265 L155,285 L105,275 L90,250 Z" },
  { id: "cvl", name: "Centre-Val de Loire", cities: ["Orléans", "Tours", "Bourges", "Blois", "Chartres"],
    d: "M200,170 L260,180 L270,235 L240,260 L195,250 L185,210 Z" },
  { id: "ge", name: "Grand Est", cities: ["Strasbourg", "Reims", "Metz", "Nancy", "Mulhouse"],
    d: "M310,120 L420,115 L435,175 L405,225 L355,220 L325,195 L300,160 Z" },
  { id: "bfc", name: "Bourgogne-Franche-Comté", cities: ["Dijon", "Besançon", "Belfort", "Auxerre", "Mâcon"],
    d: "M285,200 L370,210 L385,275 L335,300 L295,290 L275,250 Z" },
  { id: "na", name: "Nouvelle-Aquitaine", cities: ["Bordeaux", "Limoges", "Poitiers", "La Rochelle", "Pau"],
    d: "M105,275 L240,265 L255,355 L225,415 L150,420 L95,390 L70,335 Z" },
  { id: "ara", name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Annecy"],
    d: "M250,275 L385,285 L405,360 L370,395 L295,390 L255,365 L240,320 Z" },
  { id: "occ", name: "Occitanie", cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Albi"],
    d: "M155,395 L355,395 L370,440 L320,470 L195,470 L150,445 Z" },
  { id: "paca", name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Cannes"],
    d: "M355,365 L430,375 L445,420 L405,455 L360,440 L350,400 Z" },
  { id: "cor", name: "Corse", cities: ["Ajaccio", "Bastia", "Porto-Vecchio", "Calvi"],
    d: "M455,440 L475,438 L483,470 L470,490 L455,485 L450,465 Z" },
];

interface Props {
  selected: string | null;
  onSelect: (regionId: string) => void;
}

export function FranceMap({ selected, onSelect }: Props) {
  return (
    <svg viewBox="0 0 500 510" className="w-full h-auto">
      <defs>
        <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {FRANCE_REGIONS.map((r) => {
        const active = r.id === selected;
        return (
          <path
            key={r.id}
            d={r.d}
            fill={active ? "var(--lemon)" : "var(--bg-elevated)"}
            stroke={active ? "var(--lemon)" : "rgba(255,255,255,0.2)"}
            strokeWidth={active ? 2 : 1}
            filter={active ? "url(#map-glow)" : undefined}
            onClick={() => onSelect(r.id)}
            style={{ cursor: "pointer", transition: "fill 0.25s ease" }}
          />
        );
      })}
    </svg>
  );
}
