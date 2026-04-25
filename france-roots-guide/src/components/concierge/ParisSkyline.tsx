import { motion } from "framer-motion";

/**
 * Paris skyline — flat 2D vector silhouettes in navy on black.
 * Eiffel Tower center, Haussmann buildings, Sacré-Cœur dome.
 * Used as splash-screen atmosphere and quest-map ambient world.
 */
export function ParisSkyline({
  className = "",
  height = "35%",
  showLights = true,
  animate = true,
}: {
  className?: string;
  height?: string | number;
  showLights?: boolean;
  animate?: boolean;
}) {
  const navy = "#243168";
  const navyDark = "#0D1535";
  return (
    <div className={`absolute inset-x-0 bottom-0 pointer-events-none ${className}`} style={{ height }}>
      {/* Lemon spotlight under Eiffel */}
      <div
        className="absolute"
        style={{
          left: "50%",
          bottom: 0,
          width: 360,
          height: 240,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse at center bottom, rgba(248,255,161,0.10) 0%, rgba(248,255,161,0) 70%)",
        }}
      />
      <svg
        viewBox="0 0 430 280"
        preserveAspectRatio="xMidYMax slice"
        className="w-full h-full"
      >
        {/* Far horizon mist */}
        <rect x="0" y="200" width="430" height="80" fill={navyDark} opacity="0.7" />

        {/* Sacré-Cœur (right far) */}
        <motion.g
          initial={animate ? { y: 50, opacity: 0 } : false}
          animate={{ y: 0, opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <path d="M340 220 L340 180 Q345 175 350 180 L350 175 Q355 168 360 175 L360 180 Q365 175 370 180 L370 220 Z" fill={navy} />
          <ellipse cx="355" cy="170" rx="10" ry="6" fill={navy} />
          <rect x="354" y="158" width="2" height="8" fill={navy} />
        </motion.g>

        {/* Haussmann blocks left */}
        <motion.g
          initial={animate ? { y: 60, opacity: 0 } : false}
          animate={{ y: 0, opacity: 0.85 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {[20, 60, 100, 140].map((x, i) => (
            <g key={i}>
              <rect x={x} y={195 + (i % 2) * 8} width="34" height={85 - (i % 2) * 8} fill={navy} />
              <polygon points={`${x},${195 + (i % 2) * 8} ${x + 17},${188 + (i % 2) * 8} ${x + 34},${195 + (i % 2) * 8}`} fill={navy} />
              {/* Windows */}
              {showLights && [0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => (
                  <motion.rect
                    key={`w-${i}-${row}-${col}`}
                    x={x + 5 + col * 9}
                    y={205 + (i % 2) * 8 + row * 14}
                    width="3"
                    height="5"
                    fill="#F8FFA1"
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: Math.random() > 0.5 ? 0.7 : 0.15 }}
                    transition={{ duration: 0.3, delay: 0.7 + Math.random() * 0.6 }}
                  />
                )),
              )}
            </g>
          ))}
        </motion.g>

        {/* Haussmann blocks right */}
        <motion.g
          initial={animate ? { y: 60, opacity: 0 } : false}
          animate={{ y: 0, opacity: 0.85 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {[260, 300].map((x, i) => (
            <g key={i}>
              <rect x={x} y={200 + (i % 2) * 6} width="34" height={80 - (i % 2) * 6} fill={navy} />
              <polygon points={`${x},${200 + (i % 2) * 6} ${x + 17},${193 + (i % 2) * 6} ${x + 34},${200 + (i % 2) * 6}`} fill={navy} />
              {showLights && [0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => (
                  <motion.rect
                    key={`wr-${i}-${row}-${col}`}
                    x={x + 5 + col * 9}
                    y={210 + (i % 2) * 6 + row * 14}
                    width="3"
                    height="5"
                    fill="#F8FFA1"
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: Math.random() > 0.6 ? 0.7 : 0.15 }}
                    transition={{ duration: 0.3, delay: 0.9 + Math.random() * 0.6 }}
                  />
                )),
              )}
            </g>
          ))}
        </motion.g>

        {/* Eiffel Tower center */}
        <motion.g
          initial={animate ? { y: 80, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Base arch */}
          <path d="M195 280 L205 200 L225 200 L235 280 Z" fill={navy} />
          {/* Mid section */}
          <path d="M205 200 L210 140 L225 140 L230 200 Z" fill={navy} />
          {/* Top section */}
          <path d="M210 140 L213 90 L222 90 L225 140 Z" fill={navy} />
          {/* Spire */}
          <path d="M214 90 L217.5 60 L221 90 Z" fill={navy} />
          <line x1="217.5" y1="60" x2="217.5" y2="50" stroke={navy} strokeWidth="1.5" />
          {/* Cross-braces */}
          <path d="M205 200 L235 200 M208 170 L232 170 M210 140 L225 140" stroke={navyDark} strokeWidth="1" />
          {/* Tip light */}
          <motion.circle
            cx="217.5"
            cy="50"
            r="1.6"
            fill="#F8FFA1"
            animate={animate ? { opacity: [0.4, 1, 0.4] } : false}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>

        {/* Streetlamps with lemon dots */}
        {[80, 180, 260, 360].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="280" x2={x} y2="265" stroke={navy} strokeWidth="1.2" />
            <motion.circle
              cx={x}
              cy="263"
              r="2"
              fill="#F8FFA1"
              animate={animate ? { opacity: [0.6, 1, 0.6] } : false}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
            />
            <circle cx={x} cy="263" r="5" fill="#F8FFA1" opacity="0.15" />
          </g>
        ))}
      </svg>
    </div>
  );
}
