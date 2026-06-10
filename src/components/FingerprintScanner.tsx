import { motion } from "framer-motion";
import scannerMark from "@/assets/scanner-mark.svg";
import sampleHigh from "@/assets/sample-high.svg";
import sampleMedium from "@/assets/sample-medium.svg";
import sampleBad from "@/assets/sample-bad.svg";
import samplePending from "@/assets/sample-pending.svg";
import sampleScanning from "@/assets/sample-scanning.svg";
import { AnimatePresence } from "framer-motion";

export type ScannerState = "idle" | "reading";
export type Quality = "good" | "medium" | "bad" | "none";

export type SlotStatus = "pending" | "scanning" | "good" | "medium" | "bad";

interface Props {
  state: ScannerState;
  fingerLabel: string;
  lastQuality?: Quality | null;
  samplesDone: number;
  samplesTotal: number;
  samples: Quality[];
  /** Per-slot status. If omitted, derived from samples + state. */
  slotStatuses?: SlotStatus[];
  /** Index of the slot currently being captured / retried. */
  currentIndex?: number;
  /** Retry count for the current slot (0-based attempts so far). */
  currentAttempts?: number;
  maxAttempts?: number;
  onSkip?: () => void;
  onScan?: () => void;
}

const SLOT_SVG: Record<SlotStatus, string> = {
  pending: samplePending,
  scanning: sampleScanning,
  good: sampleHigh,
  medium: sampleMedium,
  bad: sampleBad,
};

const SLOT_LABEL: Record<SlotStatus, string> = {
  pending: "Pendiente",
  scanning: "Escaneando…",
  good: "Alta",
  medium: "Media",
  bad: "Reintentar",
};

const SLOT_COLOR: Record<SlotStatus, string> = {
  pending: "#9CA3AF",
  scanning: "#00ADC1",
  good: "#1F9D55",
  medium: "#E0A100",
  bad: "#DB401A",
};

function deriveStatuses(
  samples: Quality[],
  total: number,
  state: ScannerState,
  currentIndex?: number,
): SlotStatus[] {
  const out: SlotStatus[] = [];
  for (let i = 0; i < total; i++) {
    const q = samples[i];
    if (q === "good") out.push("good");
    else if (q === "medium") out.push("medium");
    else if (q === "bad") out.push("bad");
    else if (i === (currentIndex ?? samples.length) && state === "reading") out.push("scanning");
    else out.push("pending");
  }
  return out;
}

export function FingerprintScanner({
  state,
  fingerLabel,
  samplesDone,
  samplesTotal,
  samples,
  slotStatuses,
  currentIndex,
  currentAttempts = 0,
  maxAttempts = 3,
  onSkip,
  onScan,
}: Props) {
  const statuses = slotStatuses ?? deriveStatuses(samples, samplesTotal, state, currentIndex);
  const activeIdx = currentIndex ?? samplesDone;
  const allDone = statuses.every((s) => s !== "pending" && s !== "scanning");
  const currentSlot = statuses[activeIdx];
  const isRetry = currentSlot === "bad" && currentAttempts < maxAttempts;

  return (
    <div className="relative flex flex-col items-center gap-5 w-[460px]">
      {/* Scanner module */}
      <div
        className="relative w-[180px] h-[180px] rounded-[1.75rem] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--color-surface), var(--color-surface-elevated))",
          boxShadow:
            "0 0 0 1px var(--color-border), 0 24px 60px -28px color-mix(in oklab, var(--color-scanner) 28%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.6)",
        }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, color-mix(in oklab, var(--color-scanner-glow) 30%, transparent) 0%, transparent 60%)",
          }}
          animate={{
            opacity: state === "reading" ? 0.9 : 0.45,
            scale: state === "reading" ? 1.05 : 1,
          }}
          transition={{
            opacity: { duration: 2.4, repeat: state === "idle" ? Infinity : 0, repeatType: "mirror", ease: "easeInOut" },
            scale: { duration: 0.6, ease: "easeOut" },
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(circle at center, black 35%, transparent 75%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img
            src={scannerMark}
            alt=""
            aria-hidden
            className="w-[60%] h-auto select-none pointer-events-none"
            style={{
              filter:
                "drop-shadow(0 0 14px color-mix(in oklab, var(--color-scanner-glow) 60%, transparent))",
              opacity: 0.85,
            }}
            animate={{
              scale: state === "reading" ? [1, 1.04, 1] : 1,
              opacity: state === "reading" ? [0.85, 1, 0.85] : 0.85,
            }}
            transition={{
              duration: 3.2,
              repeat: state === "reading" ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        </div>
        <motion.div
          aria-hidden
          className="absolute left-6 right-6 h-[2px] rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--color-scanner), transparent)",
            boxShadow:
              "0 0 24px 4px color-mix(in oklab, var(--color-scanner-glow) 70%, transparent)",
          }}
          initial={{ top: "20%" }}
          animate={{ top: state === "reading" ? ["20%", "80%", "20%"] : ["18%", "82%", "18%"] }}
          transition={{
            duration: state === "reading" ? 2.4 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {(["tl", "tr", "bl", "br"] as const).map((c) => (
          <span
            key={c}
            aria-hidden
            className="absolute w-5 h-5"
            style={{
              borderColor: "color-mix(in oklab, var(--color-scanner) 60%, transparent)",
              ...(c === "tl" && { top: 14, left: 14, borderTop: "1.5px solid", borderLeft: "1.5px solid", borderTopLeftRadius: 8 }),
              ...(c === "tr" && { top: 14, right: 14, borderTop: "1.5px solid", borderRight: "1.5px solid", borderTopRightRadius: 8 }),
              ...(c === "bl" && { bottom: 14, left: 14, borderBottom: "1.5px solid", borderLeft: "1.5px solid", borderBottomLeftRadius: 8 }),
              ...(c === "br" && { bottom: 14, right: 14, borderBottom: "1.5px solid", borderRight: "1.5px solid", borderBottomRightRadius: 8 }),
            }}
          />
        ))}

        {/* Success overlay when all 3 samples are captured */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              key="scanner-success"
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, color-mix(in oklab, #1F9D55 18%, transparent) 0%, color-mix(in oklab, var(--color-surface) 92%, transparent) 70%)",
                backdropFilter: "blur(2px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.svg
                width="92"
                height="92"
                viewBox="0 0 92 92"
                fill="none"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 16 }}
                style={{
                  filter:
                    "drop-shadow(0 0 18px color-mix(in oklab, #1F9D55 55%, transparent))",
                }}
              >
                <motion.circle
                  cx="46"
                  cy="46"
                  r="40"
                  stroke="#1F9D55"
                  strokeWidth="4"
                  fill="color-mix(in oklab, #1F9D55 10%, transparent)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.path
                  d="M28 47 L42 60 L66 34"
                  stroke="#1F9D55"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
                />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title block */}
      <div className="text-center">
        <div className="text-lg font-semibold tracking-tight text-foreground">
          Apoyá {fingerLabel}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {allDone
            ? "Pasando al siguiente dedo…"
            : isRetry
              ? `Calidad insuficiente. Reintento ${currentAttempts + 1} de ${maxAttempts}`
              : `${samplesTotal} muestras necesarias`}
        </div>
      </div>

      {/* Sample cards using uploaded SVGs */}
      <div className="flex items-end gap-3 w-full justify-center">
        {statuses.map((status, i) => {
          const isActive = i === activeIdx && !allDone;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: isActive && state === "reading" ? 1.03 : 1,
                y: isActive ? -2 : 0,
              }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="relative">
                <img
                  src={SLOT_SVG[status]}
                  alt={`Muestra ${i + 1} ${SLOT_LABEL[status]}`}
                  className="block h-[124px] w-auto"
                  draggable={false}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-[220px] pt-1">
        <button
          onClick={onScan}
          disabled={state === "reading" || allDone}
          className="h-12 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{
            background: isRetry ? "#DB401A" : "var(--color-scanner)",
          }}
        >
          {state === "reading"
            ? "Capturando…"
            : isRetry
              ? "Reintentar huella"
              : "Escanear huella"}
        </button>
        <button
          onClick={onSkip}
          disabled={state === "reading"}
          className="h-12 rounded-lg text-sm font-semibold transition-colors hover:bg-[color-mix(in_oklab,var(--color-scanner)_8%,transparent)] disabled:opacity-50"
          style={{
            border: "1px solid #D1D5DB",
            color: "#6B7280",
            background: "transparent",
          }}
        >
          No registra
        </button>
      </div>
    </div>
  );
}
