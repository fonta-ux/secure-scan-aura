import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { FingerprintScanner, type ScannerState } from "@/components/FingerprintScanner";
import { HandDiagram } from "@/components/HandDiagram";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Escaneo biométrico — Internos" },
      { name: "description", content: "Captura biométrica de huellas dactilares para identificación institucional." },
    ],
  }),
});

const FINGER_LABELS: Record<number, string> = {
  1: "el meñique izquierdo",
  2: "el anular izquierdo",
  3: "el dedo medio izquierdo",
  4: "el índice izquierdo",
  5: "el pulgar izquierdo",
  6: "el pulgar derecho",
  7: "el índice derecho",
  8: "el dedo medio derecho",
  9: "el anular derecho",
  10: "el meñique derecho",
};

function Index() {
  const [activeFinger, setActiveFinger] = useState(1);
  const [state, setState] = useState<ScannerState>("idle");
  const [captureIndex, setCaptureIndex] = useState(0); // captures done for current finger
  const [completed, setCompleted] = useState<number[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);

  const advanceFinger = useCallback(() => {
    setCaptureIndex(0);
    setState("idle");
    setActiveFinger((f) => Math.min(10, f + 1));
  }, []);

  // Simulated capture cycle (replace with real biometric hardware events)
  useEffect(() => {
    if (state !== "idle") return;
    const t = setTimeout(() => setState("reading"), 1800);
    return () => clearTimeout(t);
  }, [state, activeFinger]);

  useEffect(() => {
    if (state !== "reading") return;
    const t = setTimeout(() => {
      setState("success");
      setCaptureIndex((c) => c + 1);
    }, 1600);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state !== "success") return;
    const t = setTimeout(() => {
      if (captureIndex >= 3) {
        setCompleted((arr) => [...arr, activeFinger]);
        advanceFinger();
      } else {
        setState("idle");
      }
    }, 900);
    return () => clearTimeout(t);
  }, [state, captureIndex, activeFinger, advanceFinger]);

  const handleSkip = () => setState("missing");
  const handleContinue = () => {
    setSkipped((arr) => [...arr, activeFinger]);
    advanceFinger();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/60">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <nav className="flex items-center gap-5 text-sm">
            <span className="text-foreground font-medium">Internos</span>
            <span className="text-muted-foreground">Visitas</span>
          </nav>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Gobierno de la provincia de Buenos Aires
        </div>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Cerrar sesión
        </button>
      </header>

      {/* Title */}
      <div className="text-center pt-10 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Escanear huellas</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Tomá 3 muestras de cada dedo. Apoyá y levantá entre cada lectura.
        </p>
      </div>

      {/* Main: hand — scanner — hand */}
      <main className="flex-1 flex items-center justify-center gap-10 px-8 pb-12">
        <HandDiagram
          side="left"
          activeFinger={activeFinger <= 5 ? activeFinger : undefined}
          completed={completed.filter((n) => n <= 5)}
          skipped={skipped.filter((n) => n <= 5)}
        />

        <FingerprintScanner
          state={state}
          fingerLabel={FINGER_LABELS[activeFinger] ?? "el dedo"}
          captureIndex={captureIndex}
          onSkip={handleSkip}
          onContinue={handleContinue}
        />

        <HandDiagram
          side="right"
          activeFinger={activeFinger > 5 ? activeFinger : undefined}
          completed={completed.filter((n) => n > 5)}
          skipped={skipped.filter((n) => n > 5)}
        />
      </main>

      {/* Footer status */}
      <footer className="px-8 py-4 flex items-center justify-center text-xs text-muted-foreground border-t border-border/60">
        Dedo {activeFinger} de 10 · {completed.length} completados · {skipped.length} omitidos
      </footer>
    </div>
  );
}
