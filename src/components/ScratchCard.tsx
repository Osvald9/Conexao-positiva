import { PositiveMessage } from "./PositiveMessage";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  message: string;
  onComplete: () => void;
  revealSignal: number;
};

const THRESHOLD = 0.55;
const BRUSH = 28;

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
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/assets/raspadinha.png";
    img.onload = () => {
      imgRef.current = img;
      if (!done.current) paintCover();
    };
    imgRef.current = img;
  }, []);

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

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      ctx.drawImage(imgRef.current, 0, 0, w, h);
    } else {
      // Fallback gold foil gradient until image is ready
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#D79219");
      g.addColorStop(0.5, "#FBE385");
      g.addColorStop(1, "#B7750D");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5C3A00";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${Math.max(20, Math.min(32, w / 10))}px Nunito, sans-serif`;
      ctx.fillText("RASPE AQUI", w / 2, h / 2);
    }
  }, []);

  useEffect(() => {
    done.current = false;
    setCleared(false);
    setStarted(false);
    paintCover();
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
    const step = 8;
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
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;
    if (particles.current.length) raf.current = requestAnimationFrame(animateFx);
    else raf.current = 0;
  };

  const spawn = (x: number, y: number) => {
    const cols = ["#FAD961", "#F7C948", "#FFF", "#D79219"];
    for (let i = 0; i < 3; i++)
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2.5,
        life: 1,
        c: cols[(Math.random() * cols.length) | 0] ?? "#F7C948",
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
      className="relative aspect-[834/658] w-full overflow-hidden rounded-[22px] sm:rounded-[26px] shadow-inner bg-[#FDF8EA]"
    >
      <PositiveMessage message={message} revealed={cleared} />
      <canvas
        ref={canvasRef}
        aria-label="Área da raspadinha. Deslize para raspar."
        role="img"
        className={`absolute inset-0 cursor-grab touch-none select-none transition-opacity duration-700 ${
          cleared ? "pointer-events-none opacity-0" : "opacity-100"
        } ${started ? "" : "animate-wiggle"}`}
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

