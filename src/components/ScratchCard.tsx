import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  message: string;
  onComplete: () => void;
  revealSignal: number;
};

const THRESHOLD = 0.6;
const BRUSH = 26;

export function ScratchCard({ message, onComplete, revealSignal }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);
  const checkTimer = useRef(0);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; c: string }[]>([]);
  const raf = useRef(0);
  const [cleared, setCleared] = useState(false);
  const [started, setStarted] = useState(false);

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const fx = fxRef.current;
    if (!canvas || !wrap || !fx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    for (const c of [canvas, fx]) {
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      c.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const ctx = canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    const css = getComputedStyle(document.documentElement);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, css.getPropertyValue("--foil-1").trim());
    g.addColorStop(0.45, css.getPropertyValue("--foil-2").trim());
    g.addColorStop(0.55, css.getPropertyValue("--foil-3").trim());
    g.addColorStop(1, css.getPropertyValue("--foil-1").trim());
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // grain
    for (let i = 0; i < (w * h) / 18; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.07)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    // sparkle dots pattern
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let y = 14; y < h; y += 28)
      for (let x = (y / 28) % 2 ? 14 : 28; x < w; x += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.fillStyle = css.getPropertyValue("--foil-ink").trim();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.max(22, Math.min(34, w / 11))}px Fredoka, sans-serif`;
    ctx.fillText("RASPE AQUI ✨", w / 2, h / 2);
    ctx.font = `600 13px Nunito, sans-serif`;
    ctx.globalAlpha = 0.7;
    ctx.fillText("deslize o dedo ou o mouse", w / 2, h / 2 + 30);
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    done.current = false;
    setCleared(false);
    setStarted(false);
    if (document.fonts?.ready) document.fonts.ready.then(paintCover);
    else paintCover();
  }, [message, paintCover]);

  useEffect(() => {
    const onResize = () => {
      if (!done.current) paintCover();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paintCover]);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setCleared(true);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (revealSignal > 0) finish();
  }, [revealSignal, finish]);

  const measure = () => {
    const canvas = canvasRef.current;
    if (!canvas || done.current) return;
    const ctx = canvas.getContext("2d")!;
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const step = 8; // sample every 8th pixel horizontally & vertically
    let total = 0;
    let clear = 0;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        total++;
        if ((data[(y * width + x) * 4 + 3] ?? 0) < 30) clear++;
      }
    }
    if (clear / total >= THRESHOLD) finish();
  };

  const scheduleMeasure = () => {
    window.clearTimeout(checkTimer.current);
    checkTimer.current = window.setTimeout(measure, 120);
  };

  const animateFx = () => {
    const fx = fxRef.current;
    if (!fx) return;
    const ctx = fx.getContext("2d")!;
    ctx.clearRect(0, 0, fx.width, fx.height);
    particles.current = particles.current.filter((p) => p.life > 0);
    for (const p of particles.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.04;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, 2.5, 2.5);
    }
    ctx.globalAlpha = 1;
    if (particles.current.length) raf.current = requestAnimationFrame(animateFx);
    else raf.current = 0;
  };

  const spawn = (x: number, y: number) => {
    const cols = ["#d9d9de", "#bfc0c7", "#f2f2f5"];
    for (let i = 0; i < 2; i++)
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        life: 1,
        c: cols[(Math.random() * 3) | 0] ?? "#ddd",
      });
    if (particles.current.length > 120) particles.current.splice(0, 40);
    if (!raf.current) raf.current = requestAnimationFrame(animateFx);
  };

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scratch = (x: number, y: number) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH * 2;
    const from = last.current ?? { x, y };
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    last.current = { x, y };
    spawn(x, y);
    scheduleMeasure();
  };

  const onDown = (e: React.PointerEvent) => {
    if (done.current) return;
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    setStarted(true);
    last.current = null;
    const p = pos(e);
    scratch(p.x, p.y);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || done.current) return;
    e.preventDefault();
    const events = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [e.nativeEvent];
    const r = canvasRef.current!.getBoundingClientRect();
    for (const ev of events) scratch(ev.clientX - r.left, ev.clientY - r.top);
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
    measure();
  };

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-card shadow-card ring-1 ring-border"
    >
      <div className="absolute inset-0 flex items-center justify-center bg-reveal p-6 text-center sm:p-10">
        <p
          className={`font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl ${cleared ? "animate-pop" : ""}`}
          aria-live="polite"
        >
          {cleared ? message : <span aria-hidden="true">{message}</span>}
        </p>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="Área da raspadinha. Deslize para raspar."
        role="img"
        className={`absolute inset-0 cursor-grab touch-none select-none transition-opacity duration-700 ${cleared ? "pointer-events-none opacity-0" : "opacity-100"} ${started ? "" : "animate-wiggle"}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
      />
      <canvas ref={fxRef} className="pointer-events-none absolute inset-0" />
    </div>
  );
}
