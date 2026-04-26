// Mini icônes symboliques pour la timeline progression
import type { BuildingId } from "@/lib/theme";

interface Props { id: BuildingId; size?: number; color?: string }

export function BuildingIcon({ id, size = 22, color = "currentColor" }: Props) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "airport":
      return (<svg {...common}><path d="M2 16l9-3 4-9 2 1-2 8 6 2-1 2-7-1-2 5-2-1 1-3-8 1z" /></svg>);
    case "bank":
      return (<svg {...common}><path d="M3 10l9-6 9 6" /><path d="M5 10v8M9 10v8M15 10v8M19 10v8" /><path d="M2 20h20" /></svg>);
    case "taxes":
      return (<svg {...common}><circle cx="8" cy="8" r="2" /><circle cx="16" cy="16" r="2" /><line x1="6" y1="18" x2="18" y2="6" /></svg>);
    case "housing":
      return (<svg {...common}><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" /></svg>);
    case "insurance":
      return (<svg {...common}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" /></svg>);
    case "transport":
      return (<svg {...common}><rect x="5" y="3" width="14" height="14" rx="2" /><path d="M5 10h14" /><circle cx="8" cy="20" r="1.5" /><circle cx="16" cy="20" r="1.5" /></svg>);
    case "work":
      return (<svg {...common}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>);
    case "retirement":
      return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
    case "children":
      return (<svg {...common}><circle cx="12" cy="9" r="3" /><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>);
    case "aids":
      return (<svg {...common}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M3 12h18M12 8v13M9 8a3 3 0 1 1 3-3 3 3 0 1 1 3 3" /></svg>);
  }
}
