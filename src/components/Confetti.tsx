const COLORS = ["var(--primary)", "var(--accent)", "var(--sun)", "var(--mint)"];

export function Confetti({ burst }: { burst: number }) {
  if (!burst) return null;
  return (
    <div key={burst} className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const dist = 120 + Math.random() * 90;
        const style = {
          "--tx": `${Math.cos(angle) * dist}px`,
          "--ty": `${Math.sin(angle) * dist - 40}px`,
          "--rot": `${Math.random() * 540}deg`,
          background: COLORS[i % COLORS.length],
          animationDelay: `${Math.random() * 80}ms`,
        } as React.CSSProperties;
        return (
          <span
            key={i}
            style={style}
            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 animate-confetti ${i % 3 === 0 ? "rounded-full" : i % 3 === 1 ? "rounded-sm" : "star"}`}
          />
        );
      })}
    </div>
  );
}
