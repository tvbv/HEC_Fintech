import * as React from "react";

/**
 * SVG Flag library — actual flag designs (no emoji).
 * Default size 24x18, scalable via prop.
 */
type FlagProps = { size?: number; className?: string; rounded?: boolean };

function FlagWrap({
  size = 24,
  className,
  rounded = true,
  children,
}: FlagProps & { children: React.ReactNode }) {
  const w = size;
  const h = (size * 3) / 4;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 60 45"
      className={className}
      style={{ borderRadius: rounded ? 4 : 0, overflow: "hidden", display: "inline-block", flexShrink: 0 }}
    >
      <defs>
        <clipPath id={`flagClip-${w}-${h}`}>
          <rect width="60" height="45" rx={rounded ? 4 : 0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#flagClip-${w}-${h})`}>{children}</g>
      <rect width="60" height="45" rx={rounded ? 4 : 0} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

export const FlagFrance = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="20" height="45" fill="#0055A4" />
    <rect x="20" width="20" height="45" fill="#FFFFFF" />
    <rect x="40" width="20" height="45" fill="#EF4135" />
  </FlagWrap>
);

export const FlagUkraine = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="22.5" fill="#005BBB" />
    <rect y="22.5" width="60" height="22.5" fill="#FFD500" />
  </FlagWrap>
);

export const FlagGermany = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="15" fill="#000000" />
    <rect y="15" width="60" height="15" fill="#DD0000" />
    <rect y="30" width="60" height="15" fill="#FFCE00" />
  </FlagWrap>
);

export const FlagNetherlands = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="15" fill="#AE1C28" />
    <rect y="15" width="60" height="15" fill="#FFFFFF" />
    <rect y="30" width="60" height="15" fill="#21468B" />
  </FlagWrap>
);

export const FlagBelgium = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="20" height="45" fill="#000000" />
    <rect x="20" width="20" height="45" fill="#FAE042" />
    <rect x="40" width="20" height="45" fill="#ED2939" />
  </FlagWrap>
);

export const FlagMorocco = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="45" fill="#C1272D" />
    <path
      d="M30 15 L33 24 L42 24 L34.5 29 L37.5 38 L30 32.5 L22.5 38 L25.5 29 L18 24 L27 24 Z"
      fill="none"
      stroke="#006233"
      strokeWidth="1.5"
    />
  </FlagWrap>
);

export const FlagIndia = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="15" fill="#FF9933" />
    <rect y="15" width="60" height="15" fill="#FFFFFF" />
    <rect y="30" width="60" height="15" fill="#138808" />
    <circle cx="30" cy="22.5" r="4" fill="none" stroke="#000080" strokeWidth="0.7" />
    <circle cx="30" cy="22.5" r="0.8" fill="#000080" />
  </FlagWrap>
);

export const FlagSpain = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="11" fill="#AA151B" />
    <rect y="11" width="60" height="23" fill="#F1BF00" />
    <rect y="34" width="60" height="11" fill="#AA151B" />
  </FlagWrap>
);

export const FlagUSA = (p: FlagProps) => (
  <FlagWrap {...p}>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} y={i * 6.4} width="60" height="3.2" fill="#B22234" />
    ))}
    <rect y="0" width="24" height="22" fill="#3C3B6E" />
  </FlagWrap>
);

export const FlagUK = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="45" fill="#012169" />
    <path d="M0 0 L60 45 M60 0 L0 45" stroke="#FFFFFF" strokeWidth="6" />
    <path d="M0 0 L60 45 M60 0 L0 45" stroke="#C8102E" strokeWidth="3" />
    <path d="M30 0 V45 M0 22.5 H60" stroke="#FFFFFF" strokeWidth="9" />
    <path d="M30 0 V45 M0 22.5 H60" stroke="#C8102E" strokeWidth="5" />
  </FlagWrap>
);

export const FlagBrazil = (p: FlagProps) => (
  <FlagWrap {...p}>
    <rect width="60" height="45" fill="#009C3B" />
    <path d="M30 5 L55 22.5 L30 40 L5 22.5 Z" fill="#FFDF00" />
    <circle cx="30" cy="22.5" r="9" fill="#002776" />
  </FlagWrap>
);

export type CountryCode =
  | "FR" | "UA" | "DE" | "NL" | "BE" | "MA" | "IN" | "ES" | "US" | "GB" | "BR";

export const Flag = ({ code, size = 24, className, rounded = true }: { code: CountryCode } & FlagProps) => {
  const map: Record<CountryCode, React.FC<FlagProps>> = {
    FR: FlagFrance,
    UA: FlagUkraine,
    DE: FlagGermany,
    NL: FlagNetherlands,
    BE: FlagBelgium,
    MA: FlagMorocco,
    IN: FlagIndia,
    ES: FlagSpain,
    US: FlagUSA,
    GB: FlagUK,
    BR: FlagBrazil,
  };
  const Comp = map[code];
  return <Comp size={size} className={className} rounded={rounded} />;
};
