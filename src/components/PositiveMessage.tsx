export function PositiveMessage({ message, revealed }: { message: string; revealed: boolean }) {
  const size =
    message.length > 110
      ? "text-xs sm:text-sm md:text-base leading-snug"
      : message.length > 70
      ? "text-sm sm:text-base md:text-lg leading-relaxed"
      : "text-base sm:text-lg md:text-xl leading-relaxed";

  return (
    <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-7 text-center bg-white text-[#1A1A1A] rounded-[22px] sm:rounded-[26px]">
      <p
        className={`font-sans font-extrabold text-[#1A1A1A] ${size} ${revealed ? "animate-pop" : ""}`}
        aria-live="polite"
      >
        "{revealed ? message : <span aria-hidden="true">{message}</span>}"
      </p>
    </div>
  );
}


