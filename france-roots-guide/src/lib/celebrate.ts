import confetti from "canvas-confetti";

export function celebrate() {
  if (typeof window === "undefined") return;
  const colors = ["#EF8354", "#FFFFFF", "#4F5D75", "#BFC0C0"];
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.5 },
    colors,
    scalar: 0.9,
  });
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    });
  }, 200);
}
