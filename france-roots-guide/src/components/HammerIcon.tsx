interface Props { size?: number; className?: string }
export function HammerIcon({ size = 18, className = "" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 6l4-4 4 4-4 4" />
      <path d="M16 8l-9 9-3 3-2-2 3-3 9-9" />
      <path d="M11 11l4 4" />
    </svg>
  );
}
