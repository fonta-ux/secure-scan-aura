import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import scannerMark from "@/assets/scanner-mark.svg";
import huellaBuena from "@/assets/huella-buena.svg";
import huellaMedia from "@/assets/huella-media.svg";
import huellaMala from "@/assets/huella-mala.svg";
import huellaSinFoto from "@/assets/huella-sin-foto.svg";

export type ScannerState = "idle" | "reading" | "success" | "missing";

interface Props {
  state: ScannerState;
  fingerLabel: string;
  captureIndex: number; // 0..3 (completed)
  totalCaptures?: number;
  onSkip?: () => void;
  onScan?: () => void;
}

export function FingerprintScanner({
  state,
  fingerLabel,
  captureIndex,
  totalCaptures = 3,
  onSkip,
  onScan,
}: Props) {
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);
  const progressPct = Math.min(1, captureIndex / totalCaptures);
  // Progressive reveal: 30% / 70% / 100%
  const reveal = state === "success" && captureIndex >= totalCaptures
    ? 1
    : captureIndex === 0
    ? 0.15
    : captureIndex === 1
    ? 0.45
    : captureIndex === 2
    ? 0.75
    : 1;

  const statusText =
    state === "idle"
      ? `Apoyá ${fingerLabel}`
      : state === "reading"
      ? "Capturando…"
      : state === "success"
      ? captureIndex >= totalCaptures
        ? "Lectura completada"
        : `Lectura ${captureIndex}/${totalCaptures} completada`
      : "Dedo no disponible";

  const subText =
    state === "idle" && captureIndex > 0
      ? "Volvé a apoyar el dedo"
      : state === "missing"
      ? "Podés continuar con el siguiente"
      : `${totalCaptures} muestras necesarias`;

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (state === "success") {
      const opts = [huellaBuena, huellaMedia, huellaMala];
      setCapturedImage(opts[Math.floor(Math.random() * opts.length)]);
    } else if (state === "missing") {
      setCapturedImage(huellaSinFoto);
    } else {
      setCapturedImage(null);
    }
  }, [state, captureIndex]);

  useEffect(() => {
    if (state !== "success") {
      setShowSuccessCheck(false);
      return;
    }

    setShowSuccessCheck(false);
    const timer = window.setTimeout(() => setShowSuccessCheck(true), 250);
    return () => window.clearTimeout(timer);
  }, [state, captureIndex]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-5 w-[240px]">
      {/* Scanner module — Fibonacci proportions, smaller than hand (φ≈1.618) */}
      <div
        className="relative w-[180px] h-[291px] rounded-[1.5rem] overflow-visible"
        style={{
          background: capturedImage
            ? "transparent"
            : "linear-gradient(180deg, var(--color-surface), var(--color-surface-elevated))",
          boxShadow: capturedImage
            ? "none"
            : "0 0 0 1px var(--color-border), 0 24px 60px -28px color-mix(in oklab, var(--color-scanner) 28%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.6)",
        }}
      >
        {/* Ambient glow */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, color-mix(in oklab, var(--color-scanner-glow) 30%, transparent) 0%, transparent 60%)",
          }}
          animate={{
            opacity:
              state === "reading" ? 0.9 : state === "success" ? 0.7 : 0.45,
            scale: state === "reading" ? 1.05 : 1,
          }}
          transition={{
            opacity: { duration: 2.4, repeat: state === "idle" ? Infinity : 0, repeatType: "mirror", ease: "easeInOut" },
            scale: { duration: 0.6, ease: "easeOut" },
          }}
        />

        {/* Grid backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(circle at center, black 35%, transparent 75%)",
          }}
        />

        {/* Fingerprint mark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img
            src={scannerMark}
            alt=""
            aria-hidden
            className="w-[60%] h-auto select-none pointer-events-none"
            style={{
              filter:
                state === "success"
                  ? "drop-shadow(0 0 12px color-mix(in oklab, var(--color-success) 60%, transparent))"
                  : "drop-shadow(0 0 14px color-mix(in oklab, var(--color-scanner-glow) 60%, transparent))",
              opacity: state === "missing" ? 0.25 : reveal * 0.4 + 0.55,
            }}
            animate={{
              scale: state === "reading" ? [1, 1.04, 1] : 1,
              opacity:
                state === "success"
                  ? 0
                  : state === "reading"
                  ? [0.85, 1, 0.85]
                  : undefined,
            }}
            transition={{
              scale: {
                duration: 3.2,
                repeat: state === "reading" ? Infinity : 0,
                ease: "easeInOut",
              },
              opacity: {
                duration: state === "success" ? 0.2 : 3.2,
                repeat: state === "reading" ? Infinity : 0,
                ease: "easeInOut",
              },
            }}
          />
        </div>

        {/* Scan line */}
        {(state === "idle" || state === "reading") && (
          <motion.div
            aria-hidden
            className="absolute left-6 right-6 h-[2px] rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-scanner), transparent)",
              boxShadow:
                "0 0 24px 4px color-mix(in oklab, var(--color-scanner-glow) 70%, transparent)",
              filter: "blur(0.4px)",
            }}
            initial={{ top: "20%" }}
            animate={{ top: state === "reading" ? ["20%", "80%", "20%"] : ["18%", "82%", "18%"] }}
            transition={{
              duration: state === "reading" ? 2.4 : 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Success ripple */}
        <AnimatePresence>
          {showSuccessCheck && (
            <motion.div
              key={`ripple-${captureIndex}`}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full"
                style={{
                  width: 180,
                  height: 180,
                  border: "2px solid color-mix(in oklab, var(--color-success) 80%, transparent)",
                  boxShadow:
                    "0 0 40px color-mix(in oklab, var(--color-success) 50%, transparent)",
                }}
                initial={{ scale: 0.6, opacity: 0.9 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
              <motion.div
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  width: 64,
                  height: 64,
                  background: "color-mix(in oklab, var(--color-success) 22%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--color-success) 60%, transparent)",
                  backdropFilter: "blur(6px)",
                }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Check
                  className="w-8 h-8"
                  style={{ color: "var(--color-success)" }}
                  strokeWidth={2.5}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Captured fingerprint image overlay */}
        <AnimatePresence>
          {capturedImage && (
            <motion.div
              key={capturedImage + captureIndex + state}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: "color-mix(in oklab, var(--color-background) 70%, transparent)",
                backdropFilter: "blur(4px)",
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={capturedImage}
                alt={state === "missing" ? "Huella sin captura" : "Huella capturada"}
                className="w-[88%] h-auto select-none pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((c) => (
          <span
            key={c}
            aria-hidden
            className="absolute w-5 h-5 border-scanner"
            style={{
              borderColor: "color-mix(in oklab, var(--color-scanner) 60%, transparent)",
              ...(c === "tl" && { top: 14, left: 14, borderTop: "1.5px solid", borderLeft: "1.5px solid", borderTopLeftRadius: 8 }),
              ...(c === "tr" && { top: 14, right: 14, borderTop: "1.5px solid", borderRight: "1.5px solid", borderTopRightRadius: 8 }),
              ...(c === "bl" && { bottom: 14, left: 14, borderBottom: "1.5px solid", borderLeft: "1.5px solid", borderBottomLeftRadius: 8 }),
              ...(c === "br" && { bottom: 14, right: 14, borderBottom: "1.5px solid", borderRight: "1.5px solid", borderBottomRightRadius: 8 }),
            }}
          />
        ))}
      </div>

      {/* Status block */}
      <div className="text-center min-h-[60px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={statusText}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-lg font-medium tracking-tight text-foreground">
              {statusText}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{subText}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress segments */}
      <div className="flex items-center gap-2.5" role="progressbar" aria-valuenow={captureIndex} aria-valuemax={totalCaptures}>
        {Array.from({ length: totalCaptures }).map((_, i) => {
          const done = i < captureIndex;
          const active = i === captureIndex && state !== "missing";
          return (
            <motion.div
              key={i}
              className="h-[6px] rounded-full overflow-hidden"
              style={{
                width: 44,
                background: "color-mix(in oklab, var(--color-foreground) 8%, transparent)",
                border: "1px solid color-mix(in oklab, var(--color-foreground) 6%, transparent)",
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: done
                    ? "linear-gradient(90deg, var(--color-success), color-mix(in oklab, var(--color-success) 60%, var(--color-scanner)))"
                    : "linear-gradient(90deg, var(--color-scanner-glow), var(--color-scanner))",
                  boxShadow: done || active
                    ? "0 0 10px color-mix(in oklab, var(--color-scanner-glow) 70%, transparent)"
                    : "none",
                }}
                initial={{ width: 0 }}
                animate={{ width: done ? "100%" : active && state === "reading" ? "60%" : active ? "15%" : "0%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons — institutional teal */}
      <div className="flex flex-col gap-3 w-[180px] pt-1">
        <button
          onClick={onScan}
          disabled={state === "reading"}
          className="h-12 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--color-scanner)" }}
        >
          Escanear huella
        </button>
        <button
          onClick={onSkip}
          className="h-12 rounded-lg text-sm font-semibold transition-colors hover:bg-[color-mix(in_oklab,var(--color-scanner)_8%,transparent)]"
          style={{
            border: "1px solid var(--color-scanner)",
            color: "var(--color-scanner)",
            background: "transparent",
          }}
        >
          No registra
        </button>
      </div>
    </div>
  );
}

function FingerprintSVG({ reveal, state }: { reveal: number; state: ScannerState }) {
  const intensity = state === "reading" ? 1 : state === "success" ? 0.95 : 0.7;
  return (
    <motion.svg
      width="180"
      height="260"
      viewBox="0 0 220 260"
      fill="none"
      animate={{ opacity: intensity }}
      transition={{ duration: 0.4 }}
    >
      <defs>
        <linearGradient id="fpStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-scanner)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-scanner-glow)" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="fpDim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity="0.06" />
        </linearGradient>
        <filter id="fpGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dim base lines (always visible faintly) */}
      <g stroke="url(#fpDim)" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <FingerprintPaths />
      </g>

      {/* Revealed bright lines, masked by reveal % */}
      <g filter="url(#fpGlow)" stroke="url(#fpStroke)" strokeWidth="2.2" fill="none" strokeLinecap="round" style={{ clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)` }}>
        <FingerprintPaths />
      </g>
    </motion.svg>
  );
}

function FingerprintPaths() {
  // Concentric stylized fingerprint ridges
  return (
    <>
      <path d="M110 30 C 60 30, 30 70, 30 130 C 30 170, 50 210, 80 235" />
      <path d="M110 30 C 160 30, 190 70, 190 130 C 190 170, 170 210, 140 235" />
      <path d="M110 50 C 70 50, 50 85, 50 130 C 50 165, 65 200, 90 225" />
      <path d="M110 50 C 150 50, 170 85, 170 130 C 170 165, 155 200, 130 225" />
      <path d="M110 70 C 80 70, 70 100, 70 130 C 70 160, 80 195, 105 220" />
      <path d="M110 70 C 140 70, 150 100, 150 130 C 150 160, 140 195, 115 220" />
      <path d="M110 90 C 92 90, 88 115, 90 135 C 92 160, 100 190, 110 210" />
      <path d="M110 90 C 128 90, 132 115, 130 135 C 128 160, 120 190, 110 210" />
      <path d="M110 110 C 102 110, 102 125, 105 140 C 108 160, 110 180, 110 200" />
      {/* breaks / minutiae */}
      <path d="M60 150 C 75 152, 88 155, 100 158" />
      <path d="M160 150 C 145 152, 132 155, 120 158" />
      <path d="M75 185 C 90 188, 100 190, 110 192" />
    </>
  );
}
