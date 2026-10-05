import { useCallback, useEffect, useState } from "react";
import { ScratchCard } from "@/components/ScratchCard";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { elogios } from "@/data/elogios";

const SEEN_KEY = "cp-seen";
const COUNT_KEY = "cp-count";

function readSeen(): number[] {
  try {
    return JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]");
  } catch {
    return [];
  }
}

function pickNext(current: number | null): number {
  let seen = readSeen();
  let pool = elogios.map((_, i) => i).filter((i) => !seen.includes(i) && i !== current);
  if (pool.length === 0) {
    seen = current != null ? [current] : [];
    pool = elogios.map((_, i) => i).filter((i) => i !== current);
  }
  const next = pool[Math.floor(Math.random() * pool.length)] ?? 0;
  sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, next]));
  return next;
}

export function ConexaoPositiva() {
  const [idx, setIdx] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const [burst, setBurst] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setIdx(pickNext(null));
    setCount(Number(sessionStorage.getItem(COUNT_KEY) || 0));
  }, []);

  const message = elogios[idx ?? 0] ?? "";

  const onComplete = useCallback(() => {
    setDone(true);
    setCount((c) => {
      sessionStorage.setItem(COUNT_KEY, String(c + 1));
      return c + 1;
    });
    setBurst((b) => b + 1);
  }, []);

  const next = () => {
    setIdx((i) => pickNext(i));
    setDone(false);
    setReveal(0);
    setRound((r) => r + 1);
  };

  const share = async () => {
    const text = `Minha Conexão Positiva de hoje 💛\n\n"${message}"\n\nQual será a sua?`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setToast("Mensagem copiada 💛");
      setTimeout(() => setToast(""), 2200);
    } catch {
      /* share cancelado */
    }
  };

  return (
    <main
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-x-hidden bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: "url('/assets/bg.png')" }}
    >
      {/* Centered board container */}
      <div className="relative w-full max-w-[420px] aspect-[924/1423] my-auto flex flex-col items-center">
        {/* Quadro frame board */}
        <div
          className="relative z-10 w-full h-full bg-contain bg-center bg-no-repeat flex flex-col items-center justify-between pt-[22%] pb-[7%] px-[8%]"
          style={{ backgroundImage: "url('/assets/quadro.png')" }}
        >
          {/* Overlapping top logo */}
          <img
            src="/assets/logo.png"
            alt="Conexão Positiva"
            className="absolute -top-[11%] left-1/2 -translate-x-1/2 w-[86%] max-w-[340px] drop-shadow-md z-20 pointer-events-none"
          />

          {/* Heading instruction */}
          <h1 className="text-black font-extrabold text-[15px] sm:text-[17px] md:text-[18px] leading-[1.25] tracking-wide text-center uppercase max-w-[88%] font-sans pt-2 sm:pt-4">
            RASPE E DESCUBRA ALGO QUE VOCÊ PRECISAVA LER HOJE.
          </h1>

          {/* Scratch card area */}
          <div className="relative w-full aspect-[834/658] my-auto">
            {idx !== null && (
              <div key={round} className="w-full h-full animate-card-in">
                <ScratchCard message={message} onComplete={onComplete} revealSignal={reveal} />
              </div>
            )}
            <CelebrationEffect burst={burst} />
          </div>
        </div>
      </div>

      {/* Control action buttons & footer below board */}
      <div className="relative z-20 mt-3 sm:mt-5 flex flex-col items-center gap-2.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {done ? (
            <>
              <button
                onClick={next}
                className="bg-[#F7C948] hover:bg-[#F5BF26] text-[#1A1A1A] font-extrabold text-sm sm:text-base px-6 py-3 rounded-full uppercase tracking-wider shadow-lg transition-transform active:scale-95 animate-pop cursor-pointer"
              >
                RASPAR OUTRO
              </button>
              <button
                onClick={share}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm sm:text-base px-5 py-3 rounded-full border border-white/40 shadow-lg transition-transform active:scale-95 animate-pop cursor-pointer"
              >
                Compartilhar mensagem
              </button>
            </>
          ) : (
            <p className="text-sm text-white/90 font-medium text-shadow drop-shadow">
              Não consegue raspar?{" "}
              <button
                onClick={() => setReveal((r) => r + 1)}
                className="text-yellow-300 hover:text-yellow-200 font-bold underline underline-offset-4 cursor-pointer"
              >
                Revelar mensagem
              </button>
            </p>
          )}
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/85 backdrop-blur-md px-5 py-2.5 text-sm font-bold text-white shadow-2xl animate-pop z-50"
        >
          {toast}
        </div>
      )}
    </main>
  );
}

