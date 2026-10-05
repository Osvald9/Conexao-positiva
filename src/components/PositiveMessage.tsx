export function PositiveMessage({ message, revealed }: { message: string; revealed: boolean }) {
  const size =
    message.length > 110
      ? "text-xs sm:text-sm md:text-base leading-snug"
      : message.length > 70
      ? "text-sm sm:text-base md:text-lg leading-relaxed"
      : "text-base sm:text-lg md:text-xl leading-relaxed";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-5 sm:p-7 text-center bg-white text-[#1A1A1A] rounded-[22px] sm:rounded-[26px]">
      <p
        className={`font-sans font-extrabold text-[#1A1A1A] ${size} ${revealed ? "animate-pop" : ""}`}
        aria-live="polite"
      >
        "{revealed ? message : <span aria-hidden="true">{message}</span>}"
      </p>

      {revealed && (
        <a
          href="https://forms.gle/QbXmLvEZhdFhTovy8"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-full block text-center bg-[#F7C948] hover:bg-[#F5BF26] text-[#1A1A1A] font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-full uppercase tracking-wide shadow-md hover:scale-105 transition-all duration-200 active:scale-95 animate-pop cursor-pointer border-0"
        >
          Deixe um elogio para alguém
        </a>
      )}
    </div>
  );
}
