import { motion, AnimatePresence } from "framer-motion";
import scannerMark from "@/assets/scanner-mark.svg";
import qualityGood from "@/assets/quality-good.svg";
import qualityMedium from "@/assets/quality-medium.svg";
import qualityBad from "@/assets/quality-bad.svg";
import qualityNone from "@/assets/quality-none.svg";

export type ScannerState = "idle" | "reading";
export type Quality = "good" | "medium" | "bad" | "none";

interface Props {
  state: ScannerState;
  fingerLabel: string;
  lastQuality?: Quality | null;
  samplesDone: number;
  samplesTotal: number;
  onSkip?: () => void;
  onScan?: () => void;
}

const QUALITY_SVG: Record<Quality, string> = {
  good: qualityGood,
  medium: qualityMedium,
  bad: qualityBad,
  none: qualityNone,
};

const QUALITY_LABEL: Record<Quality, string> = {
  good: "Captura óptima",
  medium: "Calidad aceptable",
  bad: "Calidad insuficiente",
  none: "Sin registro",
};

export function FingerprintScanner({
  state,
  fingerLabel,
  lastQuality,
  samplesDone,
  samplesTotal,
  onSkip,
  onScan,
}: Props) {
  const allDone = samplesDone >= samplesTotal;
  const showQuality = state !== "reading" && allDone && !!lastQuality;

  const statusText =
    state === "reading"
      ? "Capturando…"
      : allDone
      ? "Huella completa"
      : `Apoyá ${fingerLabel}`;

  const subText =
    state === "reading"
      ? `Muestra ${samplesDone + 1} de ${samplesTotal}`
      : allDone
      ? "Pasando al siguiente dedo…"
      : `Muestra ${samplesDone + 1} de ${samplesTotal}`;

  const handlePrimary = () => onScan?.();

  const maxAttempts = samplesTotal;
  const attempt = state === "reading" ? samplesDone + 1 : samplesDone;


  return (
    <div className="relative flex flex-col items-center justify-center gap-5 w-[240px]">
      {/* Scanner module */}
      <div
        className="relative w-[180px] h-[291px] rounded-[1.5rem] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--color-surface), var(--color-surface-elevated))",
          boxShadow:
            "0 0 0 1px var(--color-border), 0 24px 60px -28px color-mix(in oklab, var(--color-scanner) 28%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.6)",
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
            opacity: showQuality
              ? 0
              : state === "reading"
              ? 0.9
              : 0.45,
            scale: state === "reading" ? 1.05 : 1,
          }}
          transition={{
            opacity: { duration: 2.4, repeat: state === "idle" ? Infinity : 0, repeatType: "mirror", ease: "easeInOut" },
            scale: { duration: 0.6, ease: "easeOut" },
          }}
        />

        {/* Grid backdrop */}
        {!showQuality && (
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
        )}

        {/* Fingerprint mark (idle / reading) */}
        {!showQuality && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src={scannerMark}
              alt=""
              aria-hidden
              className="w-[60%] h-auto select-none pointer-events-none"
              style={{
                filter:
                  "drop-shadow(0 0 14px color-mix(in oklab, var(--color-scanner-glow) 60%, transparent))",
                opacity: 0.8,
              }}
              animate={{
                scale: state === "reading" ? [1, 1.04, 1] : 1,
                opacity:
                  state === "reading" ? [0.85, 1, 0.85] : 0.8,
              }}
              transition={{
                scale: {
                  duration: 3.2,
                  repeat: state === "reading" ? Infinity : 0,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 3.2,
                  repeat: state === "reading" ? Infinity : 0,
                  ease: "easeInOut",
                },
              }}
            />
          </div>
        )}

        {/* Scan line */}
        {!showQuality && (state === "idle" || state === "reading") && (
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

        {/* Quality result overlay */}
        <AnimatePresence>
          {showQuality && (
            <motion.div
              key={`q-${lastQuality}-${samplesDone}`}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={QUALITY_SVG[lastQuality!]}
                alt={QUALITY_LABEL[lastQuality!]}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner brackets */}
        {!showQuality &&
          (["tl", "tr", "bl", "br"] as const).map((c) => (
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
            key={statusText + subText}
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

      {/* Attempt indicator */}
      <div className="flex items-center gap-2.5" role="progressbar" aria-valuenow={attempt} aria-valuemax={maxAttempts}>
        {Array.from({ length: maxAttempts }).map((_, i) => {
          const used = i < attempt - (state === "result" || state === "committed" ? 0 : 1);
          const active = i === attempt - 1 && state === "reading";
          return (
            <div
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
                  background: "linear-gradient(90deg, var(--color-scanner-glow), var(--color-scanner))",
                  boxShadow: used || active
                    ? "0 0 10px color-mix(in oklab, var(--color-scanner-glow) 70%, transparent)"
                    : "none",
                }}
                initial={{ width: 0 }}
                animate={{ width: used ? "100%" : active ? "60%" : "0%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-[180px] pt-1">
        <button
          onClick={handlePrimary}
          disabled={state === "reading"}
          className="h-12 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--color-scanner)" }}
        >
          {primaryLabel}
        </button>
        <button
          onClick={onSkip}
          disabled={state === "reading" || isCommitted}
          className="h-12 rounded-lg text-sm font-semibold transition-colors hover:bg-[color-mix(in_oklab,var(--color-scanner)_8%,transparent)] disabled:opacity-50"
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
