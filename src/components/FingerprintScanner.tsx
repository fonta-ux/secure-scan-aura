import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, Fingerprint } from "lucide-react";
import scannerMark from "@/assets/scanner-mark.svg";

export type ScannerState = "idle" | "reading";
export type Quality = "good" | "medium" | "bad" | "none";

interface Props {
  state: ScannerState;
  fingerLabel: string;
  lastQuality?: Quality | null;
  samplesDone: number;
  samplesTotal: number;
  samples: Quality[];
  onSkip?: () => void;
  onScan?: () => void;
}

const QUALITY_META: Record<
  Quality,
  { label: string; dot: string; tint: string; border: string; badge: "check" | "warn" | "none" }
> = {
  good: {
    label: "Alta",
    dot: "#1F9D55",
    tint: "color-mix(in oklab, #1F9D55 8%, white)",
    border: "color-mix(in oklab, #1F9D55 55%, transparent)",
    badge: "check",
  },
  medium: {
    label: "Media",
    dot: "#E0A100",
    tint: "color-mix(in oklab, #F0B400 12%, white)",
    border: "color-mix(in oklab, #E0A100 55%, transparent)",
    badge: "warn",
  },
  bad: {
    label: "Baja",
    dot: "#C53030",
    tint: "color-mix(in oklab, #C53030 8%, white)",
    border: "color-mix(in oklab, #C53030 55%, transparent)",
    badge: "warn",
  },
  none: {
    label: "Sin registro",
    dot: "#9CA3AF",
    tint: "#F1F3F4",
    border: "#D1D5DB",
    badge: "none",
  },
};

export function FingerprintScanner({
  state,
  fingerLabel,
  samplesDone,
  samplesTotal,
  samples,
  onSkip,
  onScan,
}: Props) {
  const allDone = samplesDone >= samplesTotal;

  return (
    <div className="relative flex flex-col items-center gap-5 w-[420px]">
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
        {/* Ambient glow */}
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

        {/* Grid backdrop */}
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

        {/* Fingerprint mark */}
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

        {/* Scan line */}
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

        {/* Corner brackets */}
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
      </div>

      {/* Title block */}
      <div className="text-center">
        <div className="text-lg font-semibold tracking-tight text-foreground">
          Apoyá {fingerLabel}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {allDone ? "Pasando al siguiente dedo…" : "puede seguir por el siguiente dedo"}
        </div>
      </div>

      {/* Progress segments */}
      <div
        className="flex items-center gap-2"
        role="progressbar"
        aria-valuenow={samplesDone}
        aria-valuemax={samplesTotal}
      >
        {Array.from({ length: samplesTotal }).map((_, i) => {
          const used = i < samplesDone;
          const active = i === samplesDone && state === "reading";
          return (
            <div
              key={i}
              className="h-[6px] rounded-full overflow-hidden"
              style={{
                width: 56,
                background: "color-mix(in oklab, var(--color-foreground) 8%, transparent)",
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--color-scanner)" }}
                initial={{ width: 0 }}
                animate={{ width: used ? "100%" : active ? "60%" : "0%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          );
        })}
      </div>

      {/* Sample cards */}
      <div className="flex items-stretch gap-3 w-full justify-center">
        {Array.from({ length: samplesTotal }).map((_, i) => {
          const captured = i < samplesDone;
          const isCurrent = i === samplesDone && !allDone;
          const q = captured ? samples[i] : null;
          const meta = q ? QUALITY_META[q] : null;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{ scale: isCurrent && state === "reading" ? 1.02 : 1 }}
              className="relative flex flex-col w-[110px] rounded-xl overflow-hidden"
              style={{
                background: meta ? meta.tint : "#F8FAFB",
                border: `1.5px solid ${meta ? meta.border : isCurrent ? "color-mix(in oklab, var(--color-scanner) 35%, transparent)" : "#E5E7EB"}`,
              }}
            >
              {/* Badge */}
              {meta && meta.badge !== "none" && (
                <span
                  className="absolute -top-2 -right-2 flex items-center justify-center rounded-full text-white shadow"
                  style={{
                    width: 22,
                    height: 22,
                    background: meta.badge === "check" ? "#2BB85D" : "#E0A100",
                  }}
                  aria-hidden
                >
                  {meta.badge === "check" ? (
                    <Check className="w-3 h-3" strokeWidth={3} />
                  ) : (
                    <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                  )}
                </span>
              )}

              {/* Header */}
              <div className="px-2.5 pt-2 text-xs font-semibold" style={{ color: captured ? "#26292A" : "#9CA3AF" }}>
                Muestra {i + 1}
              </div>

              {/* Thumbnail */}
              <div
                className="mx-2.5 my-2 flex items-center justify-center rounded-lg"
                style={{
                  height: 70,
                  background: meta ? "white" : "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <AnimatePresence mode="wait">
                  {captured ? (
                    <motion.div
                      key="print"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Fingerprint
                        className="w-10 h-10"
                        strokeWidth={1.5}
                        style={{ color: meta!.dot }}
                      />
                    </motion.div>
                  ) : isCurrent && state === "reading" ? (
                    <motion.div
                      key="scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <Fingerprint
                        className="w-10 h-10"
                        strokeWidth={1.5}
                        style={{ color: "var(--color-scanner)" }}
                      />
                    </motion.div>
                  ) : (
                    <Fingerprint
                      key="pending"
                      className="w-10 h-10"
                      strokeWidth={1.5}
                      style={{ color: "#D1D5DB" }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Status */}
              <div className="px-2.5 pb-2 flex items-center gap-1.5">
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    background: meta ? meta.dot : "#D1D5DB",
                  }}
                  aria-hidden
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: meta ? meta.dot : "#9CA3AF" }}
                >
                  {meta ? meta.label : isCurrent && state === "reading" ? "Escaneando…" : "Pendiente"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-[200px] pt-1">
        <button
          onClick={onScan}
          disabled={state === "reading" || allDone}
          className="h-12 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--color-scanner)" }}
        >
          {state === "reading" ? "Capturando…" : "Escanear huella"}
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
