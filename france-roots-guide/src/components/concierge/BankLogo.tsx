/**
 * BankLogo — inline SVG monograms for bank brand recognition.
 * No remote assets, no broken images. Hand-tuned per bank.
 */
interface BankLogoProps {
  bank: string;
  size?: number;
  className?: string;
}

export function BankLogo({ bank, size = 48, className = "" }: BankLogoProps) {
  const key = bank.toLowerCase();

  if (key.includes("revolut")) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          background: "#000000",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
        aria-label="Revolut"
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 32 32" fill="none">
          <path
            d="M5 27 V5 H17 a7 7 0 0 1 0 14 H11 l9 8 H14 L7 19 H11"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (key.includes("n26")) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          background: "#36A18B",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(54,161,139,0.35)",
        }}
        aria-label="N26"
      >
        <span
          style={{
            color: "#FFFFFF",
            fontFamily: "Unbounded, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.36,
            letterSpacing: "-1px",
          }}
        >
          N26
        </span>
      </div>
    );
  }

  if (key.includes("société") || key.includes("societe") || key.includes("socgen")) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        }}
        aria-label="Société Générale"
      >
        <div style={{ flex: 1, background: "#000000" }} />
        <div style={{ flex: 1, background: "#E60012" }} />
      </div>
    );
  }

  if (key.includes("bnp")) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          background: "#009639",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,150,57,0.35)",
        }}
        aria-label="BNP Paribas"
      >
        <span
          style={{
            color: "#FFFFFF",
            fontFamily: "Unbounded, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.32,
          }}
        >
          BNP
        </span>
      </div>
    );
  }

  // Fallback: lemon monogram tile
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #F8FFA1 0%, #E8EF7A 100%)",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(248,255,161,0.35)",
      }}
      aria-label={bank}
    >
      <span
        style={{
          color: "#000000",
          fontFamily: "Unbounded, sans-serif",
          fontWeight: 800,
          fontSize: size * 0.45,
        }}
      >
        {bank[0]}
      </span>
    </div>
  );
}
