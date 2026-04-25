import { motion } from "framer-motion";

export type CleoPose = "default" | "idle" | "celebrating" | "thinking" | "guiding" | "waving" | "talking" | "sleeping";
export type CleoMood = "happy" | "wow" | "wink" | "focused";

interface CleoProps {
  pose?: CleoPose;
  mood?: CleoMood;
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * Cleo — the Concierge mascot.
 * 2D flat vector character. Lemon body (#F8FFA1), black face details,
 * tiny glowing key on chest. Lingo-style: clean, friendly, geometric.
 */
export function Cleo({
  pose = "idle",
  mood = "happy",
  size = 80,
  className = "",
  animated = true,
}: CleoProps) {
  const ink = "#000000";
  const lemon = "#F8FFA1";
  const lemonDeep = "#E8EF7A";
  const cheek = "#FFB3D9";

  const headTilt = pose === "thinking" ? -12 : pose === "guiding" ? 4 : 0;

  // Eyes
  const Eyes = () => {
    if (mood === "wink") {
      return (
        <>
          <circle cx="40" cy="50" r="3.6" fill={ink} />
          <path d="M55 50 Q60 47 65 50" stroke={ink} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      );
    }
    if (mood === "wow" || pose === "celebrating") {
      return (
        <>
          <circle cx="40" cy="50" r="4" fill={ink} />
          <circle cx="60" cy="50" r="4" fill={ink} />
          <circle cx="41.5" cy="48.5" r="1.4" fill="white" />
          <circle cx="61.5" cy="48.5" r="1.4" fill="white" />
        </>
      );
    }
    if (mood === "focused") {
      return (
        <>
          <path d="M35 50 L45 50" stroke={ink} strokeWidth="3" strokeLinecap="round" />
          <path d="M55 50 L65 50" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    }
    return (
      <>
        <circle cx="40" cy="50" r="3.4" fill={ink} />
        <circle cx="60" cy="50" r="3.4" fill={ink} />
        <circle cx="41" cy="48.8" r="1.1" fill="white" />
        <circle cx="61" cy="48.8" r="1.1" fill="white" />
      </>
    );
  };

  const Mouth = () => {
    if (pose === "celebrating") {
      return <path d="M44 60 Q50 70 56 60 Q50 65 44 60 Z" fill={ink} />;
    }
    if (mood === "wow") return <ellipse cx="50" cy="63" rx="2.6" ry="3.6" fill={ink} />;
    if (pose === "thinking") return <path d="M46 64 L54 64" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />;
    return <path d="M44 61 Q50 66 56 61" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none" />;
  };

  const armStroke = lemonDeep;

  const Arms = () => {
    if (pose === "celebrating") {
      return (
        <>
          <motion.path
            d="M22 62 Q14 42 18 30"
            stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none"
            animate={animated ? { rotate: [-4, 4, -4] } : undefined}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: "22px 62px" }}
          />
          <motion.path
            d="M78 62 Q86 42 82 30"
            stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none"
            animate={animated ? { rotate: [4, -4, 4] } : undefined}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: "78px 62px" }}
          />
        </>
      );
    }
    if (pose === "guiding") {
      return (
        <>
          <path d="M22 62 Q18 72 22 80" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
          <motion.g
            animate={animated ? { x: [0, 4, 0] } : undefined}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M78 62 Q92 54 96 46" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="98" cy="44" r="5" fill={lemon} stroke={ink} strokeWidth="1.5" />
          </motion.g>
        </>
      );
    }
    if (pose === "thinking") {
      return (
        <>
          <path d="M22 62 Q30 60 38 58" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="58" r="5" fill={lemon} stroke={ink} strokeWidth="1.5" />
          <path d="M78 62 Q82 72 78 80" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
        </>
      );
    }
    if (pose === "waving") {
      return (
        <>
          <path d="M22 62 Q18 72 22 80" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
          <motion.g
            animate={animated ? { rotate: [-15, 20, -15] } : undefined}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "78px 62px" }}
          >
            <path d="M78 62 Q88 46 86 30" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="86" cy="28" r="6" fill={lemon} stroke={ink} strokeWidth="1.5" />
          </motion.g>
        </>
      );
    }
    if (pose === "talking") {
      return (
        <>
          <motion.path
            d="M22 62 Q18 72 22 80"
            stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none"
            animate={animated ? { y: [0, -1, 0] } : undefined}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.path
            d="M78 62 Q82 72 78 80"
            stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none"
            animate={animated ? { y: [0, 1, 0] } : undefined}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      );
    }
    return (
      <>
        <path d="M22 62 Q18 72 22 80" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M78 62 Q82 72 78 80" stroke={armStroke} strokeWidth="8" strokeLinecap="round" fill="none" />
      </>
    );
  };

  // Wrapper animation per pose
  const wrapAnim =
    !animated ? undefined :
    pose === "idle" || pose === "default" ? { y: [0, -8, 0] } :
    pose === "talking" ? { y: [0, -3, 0] } :
    pose === "celebrating" ? { y: [0, -16, 0], scale: [1, 1.08, 1] } :
    pose === "waving" ? { rotate: [-2, 2, -2] } :
    undefined;
  const wrapTrans =
    pose === "idle" || pose === "default"
      ? { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
      : pose === "celebrating"
      ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 1.4, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className={className} style={{ width: size, height: size, display: "inline-block" }}>
      <svg viewBox="0 0 100 110" width={size} height={size} style={{ overflow: "visible" }}>
        <motion.g animate={wrapAnim} transition={wrapTrans}>
          <g transform={`rotate(${headTilt} 50 55)`}>
            {/* Soft drop shadow */}
            <ellipse cx="50" cy="100" rx="22" ry="3" fill={ink} opacity="0.25" />

            {/* Body — rounded blob square */}
            <path
              d="M 22 50 Q 22 22 50 22 Q 78 22 78 50 L 78 72 Q 78 90 50 90 Q 22 90 22 72 Z"
              fill={lemon}
              stroke={ink}
              strokeWidth="2.5"
            />

            {/* Subtle top highlight */}
            <path d="M 30 32 Q 40 26 52 26" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />

            {/* Cheeks */}
            <circle cx="30" cy="60" r="3.5" fill={cheek} opacity="0.7" />
            <circle cx="70" cy="60" r="3.5" fill={cheek} opacity="0.7" />

            <Eyes />
            <Mouth />

            {/* Glowing key on chest */}
            <KeyChest ink={ink} animated={animated} pose={pose} />

            <Arms />

            {/* Feet — rounded */}
            <ellipse cx="38" cy="92" rx="7" ry="4" fill={lemonDeep} stroke={ink} strokeWidth="2" />
            <ellipse cx="62" cy="92" rx="7" ry="4" fill={lemonDeep} stroke={ink} strokeWidth="2" />

            {/* Thinking question mark */}
            {pose === "thinking" && animated && (
              <motion.text
                x="78" y="22"
                fontSize="16" fontWeight="900" fill={lemon}
                stroke={ink} strokeWidth="0.8"
                fontFamily="Unbounded, sans-serif"
                animate={{ y: [22, 18, 22], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >?</motion.text>
            )}

            {/* Celebration sparkles */}
            {pose === "celebrating" && animated && (
              <>
                {[
                  { x: 12, y: 30, d: 0 },
                  { x: 88, y: 30, d: 0.3 },
                  { x: 50, y: 8, d: 0.6 },
                  { x: 18, y: 70, d: 0.15 },
                  { x: 82, y: 70, d: 0.45 },
                ].map((s, i) => (
                  <motion.g
                    key={i}
                    animate={{ scale: [0, 1.2, 0], rotate: [0, 180] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: s.d }}
                    style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                  >
                    <Sparkle x={s.x} y={s.y} color={lemon} ink={ink} />
                  </motion.g>
                ))}
              </>
            )}

            {pose === "sleeping" && (
              <g>
                <text x="78" y="32" fontSize="12" fill={ink} fontWeight="800">z</text>
                <text x="86" y="22" fontSize="9" fill={ink} fontWeight="800">z</text>
              </g>
            )}
          </g>
        </motion.g>
      </svg>
    </div>
  );
}

function KeyChest({ ink, animated, pose }: { ink: string; animated: boolean; pose: CleoPose }) {
  const spin = pose === "celebrating" && animated;
  return (
    <motion.g
      animate={animated ? (spin ? { rotate: 360 } : { scale: [1, 1.12, 1] }) : undefined}
      transition={spin ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "50px 70px" }}
    >
      {/* Glow */}
      <circle cx="50" cy="70" r="9" fill="#F8FFA1" opacity="0.4" />
      {/* Key bow */}
      <circle cx="50" cy="68" r="5" fill="white" stroke={ink} strokeWidth="1.5" />
      <circle cx="50" cy="68" r="1.8" fill={ink} />
      {/* Key shaft + teeth */}
      <rect x="49" y="72" width="2" height="6" fill="white" stroke={ink} strokeWidth="1" />
      <rect x="51" y="74" width="2" height="1.5" fill="white" stroke={ink} strokeWidth="1" />
    </motion.g>
  );
}

function Sparkle({ x, y, color, ink }: { x: number; y: number; color: string; ink: string }) {
  return (
    <g transform={`translate(${x - 4} ${y - 4})`}>
      <path
        d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z"
        fill={color}
        stroke={ink}
        strokeWidth="0.6"
      />
    </g>
  );
}

/**
 * CleoBubble — Cleo with a speech bubble.
 * Bubble: white #FFFFFF bg, black text, Nunito Sans 14px italic.
 */
export function CleoBubble({
  text,
  pose = "talking",
  mood = "happy",
  size = 64,
  side = "right",
  tone = "default",
  className = "",
}: {
  text: React.ReactNode;
  pose?: CleoPose;
  mood?: CleoMood;
  size?: number;
  side?: "left" | "right";
  tone?: "default" | "tip" | "win" | "warn" | "dark";
  className?: string;
}) {
  const toneStyles = {
    default: { bg: "#FFFFFF", text: "#000000", border: "rgba(0,0,0,0.08)" },
    tip: { bg: "#F8FFA1", text: "#000000", border: "rgba(0,0,0,0.15)" },
    win: { bg: "#A8A3F8", text: "#000000", border: "rgba(0,0,0,0.15)" },
    warn: { bg: "#FF6B6B", text: "#FFFFFF", border: "rgba(0,0,0,0.2)" },
    dark: { bg: "#243168", text: "#FFFFFF", border: "rgba(248,255,161,0.3)" },
  } as const;
  const s = toneStyles[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-end gap-2 ${side === "left" ? "flex-row" : "flex-row-reverse"} ${className}`}
    >
      <div className="shrink-0">
        <Cleo pose={pose} mood={mood} size={size} />
      </div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
        className="relative flex-1 max-w-[78%]"
      >
        <div
          className="relative px-4 py-3 border shadow-soft"
          style={{
            background: s.bg,
            color: s.text,
            borderColor: s.border,
            borderRadius: side === "left" ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
          }}
        >
          <div className="text-[14px] leading-snug font-semibold italic" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
            {text}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
