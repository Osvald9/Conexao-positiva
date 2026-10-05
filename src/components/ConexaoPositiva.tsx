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
    <main className="min-h-screen bg-page px-5 py-10 sm:py-16">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="mb-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary-foreground">
          ✦ uma ação de reconhecimento ✦
        </span>
        <h1 className="title-accent font-display text-5xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
          CONEXÃO{" "}
          <span className="block text-primary">
            POSITIVA
          </span>
        </h1>
        <p className="mt-5 text-base text-muted-foreground">
          Raspe e descubra algo que você precisava ler hoje.
        </p>

        <div className="relative mt-8 w-full">
          {idx !== null && (
            <div key={round} className="animate-card-in">
              <ScratchCard message={message} onComplete={onComplete} revealSignal={reveal} />
            </div>
          )}
          <CelebrationEffect burst={burst} />
        </div>

        <div className="mt-6 flex min-h-12 flex-wrap items-center justify-center gap-3">
          {done ? (
            <>
              <button onClick={next} className="btn-primary animate-pop">
                RASPAR OUTRO
              </button>
              <button onClick={share} className="btn-ghost animate-pop">
                Compartilhar mensagem
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Não consegue raspar?{" "}
              <button onClick={() => setReveal((r) => r + 1)} className="btn-link">
                Revelar mensagem
              </button>
            </p>
          )}
        </div>

        <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
          Você já revelou {count} {count === 1 ? "conexão positiva" : "conexões positivas"} 💛
        </p>
      </div>
      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-card animate-pop">
          {toast}
        </div>
      )}
    </main>
  );
}
