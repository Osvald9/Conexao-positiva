export function PositiveMessage({ message, revealed }: { message: string; revealed: boolean }) {
  const size = message.length > 110 ? "text-lg sm:text-2xl" : message.length > 70 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-reveal p-6 text-center sm:p-10">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary" aria-hidden="true">💛 conexão positiva</span>
      <p
        className={`font-display font-semibold leading-snug text-foreground ${size} ${revealed ? "animate-pop" : ""}`}
        aria-live="polite"
      >
        {revealed ? message : <span aria-hidden="true">{message}</span>}
      </p>
    </div>
  );
}
