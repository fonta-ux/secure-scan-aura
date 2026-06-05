import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { Quality } from "@/components/FingerprintScanner";

interface Props {
  fingerLabel: string;
  samples: Quality[]; // already captured samples (length 0..total)
  total: number;
  isReading: boolean;
}

const QUALITY_BADGE: Record<Quality, { label: string; bg: string; fg: string }> = {
  good: { label: "Alta", bg: "#E6F7EE", fg: "#1F9D55" },
  medium: { label: "Media", bg: "#FEF5E7", fg: "#B7791F" },
  bad: { label: "Baja", bg: "#FDECEA", fg: "#C53030" },
  none: { label: "Sin registro", bg: "#F1F3F4", fg: "#6B7280" },
};

export function SamplesWizard({ fingerLabel, samples, total, isReading }: Props) {
  const currentIndex = samples.length; // next slot

  return (
    <aside
      className="flex flex-col gap-4 w-[280px] rounded-2xl bg-white p-5"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px var(--color-border)",
      }}
    >
      <header className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground leading-tight">
          Apoyá {fingerLabel}
        </h2>
        <p className="text-xs text-muted-foreground">{total} muestras necesarias</p>
      </header>

      <ol className="flex flex-col gap-2.5">
        {Array.from({ length: total }).map((_, i) => {
          const captured = i < currentIndex;
          const isCurrent = i === currentIndex;
          const quality = captured ? samples[i] : null;

          const stateLabel = captured
            ? QUALITY_BADGE[quality!].label
            : isCurrent && isReading
            ? "Escaneando..."
            : "Pendiente";

          const stateBg = captured
            ? QUALITY_BADGE[quality!].bg
            : isCurrent && isReading
            ? "color-mix(in oklab, var(--color-scanner) 12%, transparent)"
            : "transparent";

          const stateFg = captured
            ? QUALITY_BADGE[quality!].fg
            : isCurrent && isReading
            ? "var(--color-scanner)"
            : "#9CA3AF";

          return (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: isCurrent && !captured
                  ? "color-mix(in oklab, var(--color-scanner) 6%, transparent)"
                  : "#F8FAFB",
                border: isCurrent && !captured
                  ? "1px solid color-mix(in oklab, var(--color-scanner) 25%, transparent)"
                  : "1px solid transparent",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
                  style={{
                    width: 22,
                    height: 22,
                    background: captured
                      ? "#2BB85D"
                      : isCurrent
                      ? "var(--color-scanner)"
                      : "#E5E7EB",
                    color: captured || isCurrent ? "#FFFFFF" : "#6B7280",
                  }}
                  aria-hidden
                >
                  {captured ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="text-sm font-medium text-foreground">
                  Muestra {i + 1}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.span
                  key={stateLabel}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: stateBg, color: stateFg }}
                >
                  {stateLabel}
                </motion.span>
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
