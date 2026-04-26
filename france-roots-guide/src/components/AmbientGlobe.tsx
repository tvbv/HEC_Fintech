export function AmbientGlobe() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
      <svg
        viewBox="-100 -100 200 200"
        className="w-[120vmin] h-[120vmin] animate-spin-slow"
        style={{ opacity: 1 }}
      >
        <g stroke="rgba(168,163,248,0.08)" strokeWidth="0.3" fill="none">
          {/* meridians */}
          {Array.from({ length: 12 }).map((_, i) => {
            const rx = 90 * Math.cos((i * Math.PI) / 12);
            return <ellipse key={`m${i}`} cx="0" cy="0" rx={Math.abs(rx)} ry="90" />;
          })}
          {/* parallels */}
          {Array.from({ length: 9 }).map((_, i) => {
            const y = -80 + i * 20;
            const r = Math.sqrt(Math.max(0, 90 * 90 - y * y));
            return <ellipse key={`p${i}`} cx="0" cy={y} rx={r} ry={r * 0.18} />;
          })}
          <circle cx="0" cy="0" r="90" />
        </g>
      </svg>
    </div>
  );
}
