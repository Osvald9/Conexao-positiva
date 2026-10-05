import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ScratchCard } from "@/components/ScratchCard";
import { Confetti } from "@/components/Confetti";
import { elogios } from "@/data/elogios";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uma raspadinha pra você 💛" },
      { name: "description", content: "Raspe e descubra um elogio que você precisava ler hoje." },
      { property: "og:title", content: "Uma raspadinha pra você 💛" },
      { property: "og:description", content: "Raspe e descubra um elogio que você precisava ler hoje." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function pick(exclude?: number) {
  let i = Math.floor(Math.random() * elogios.length);
  while (i === exclude) i = Math.floor(Math.random() * elogios.length);
  return i;
}

function Index() {
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const [burst, setBurst] = useState(0);
  const [reveal, setReveal] = useState(0);
  const [toast, setToast] = useState("");
  const message = elogios[idx];

  // randomize after hydration
  useState(() => {
    if (typeof window !== "undefined") queueMicrotask(() => setIdx(pick()));
  });

  const onComplete = useCallback(() => {
    setDone(true);
    setCount((c) => c + 1);
    setBurst((b) => b + 1);
  }, []);

  const next = () => {
    setIdx((i) => pick(i));
    setDone(false);
    setReveal(0);
    setRound((r) => r + 1);
  };

  const share = async () => {
    const text = `Olha o que saiu na minha raspadinha 💛\n\n"${message}"`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setToast("Copiado! Agora é só colar 💛");
    } catch {
      return;
    }
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <main className="min-h-screen bg-page px-5 py-10 sm:py-16">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="mb-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary-foreground">
          ✦ só pra você ✦
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          UMA RASPADINHA PRA VOCÊ
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Tem alguma coisa aqui que você precisava ler hoje.
        </p>

        <div className="relative mt-8 w-full">
          <ScratchCard key={round} message={message} onComplete={onComplete} revealSignal={reveal} />
          <Confetti burst={burst} />
        </div>

        <div className="mt-6 flex min-h-12 flex-wrap items-center justify-center gap-3">
          {done ? (
            <>
              <button onClick={next} className="btn-primary animate-pop">
                RASPAR OUTRO
              </button>
              <button onClick={share} className="btn-ghost animate-pop">
                Compartilhar elogio
              </button>
            </>
          ) : (
            <button onClick={() => setReveal((r) => r + 1)} className="btn-link">
              Revelar mensagem
            </button>
          )}
        </div>

        <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
          Você já revelou {count} {count === 1 ? "elogio" : "elogios"} 💛
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
