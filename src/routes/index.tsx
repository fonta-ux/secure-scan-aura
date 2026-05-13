import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { LogOut } from "lucide-react";
import { FingerprintScanner, type ScannerState } from "@/components/FingerprintScanner";
import { HandDiagram } from "@/components/HandDiagram";
import sibLogo from "@/assets/footer-pba.svg";
import footerPba from "@/assets/sib-logo.svg";

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
  const [captureIndex, setCaptureIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);

  const advanceFinger = useCallback(() => {
    setCaptureIndex(0);
    setState("idle");
    setActiveFinger((f) => Math.min(10, f + 1));
  }, []);

  // El escaneo solo arranca cuando el usuario presiona "Escanear huella"

  useEffect(() => {
    if (state !== "reading") return;
    const t = setTimeout(() => {
      setState("success");
      setCaptureIndex((c) => c + 1);
    }, 2200);
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
    }, 2400);
  }, [state, captureIndex, activeFinger, advanceFinger]);

  const handleSkip = () => {
    setSkipped((arr) => [...arr, activeFinger]);
    advanceFinger();
  };
  const handleScan = () => {
    if (state === "idle") setState("reading");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 bg-white border-b border-border/60">
        <div className="flex items-center gap-10">
          <img src={sibLogo} alt="SIB - Sistema de identificación Biometrica" className="h-8 w-auto" />
          <nav className="flex items-center gap-2">
            <button
              className="px-5 py-2 rounded-md text-sm font-semibold text-[var(--color-scanner)] bg-[color-mix(in_oklab,var(--color-scanner)_10%,transparent)]"
              aria-current="page"
            >
              Internos
            </button>
            <button className="px-5 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Visitas
            </button>
          </nav>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-[var(--color-scanner)] hover:opacity-80 transition-opacity">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </header>

      {/* Title */}
      <div className="text-center pt-10 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Escanear huellas</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Tomá 3 muestras de cada dedo. Apoyá y levantá entre cada lectura.
        </p>
      </div>

      {/* Main: hand — scanner — hand */}
      <main className="flex-1 flex items-center justify-center gap-12 px-8 pb-12">
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
          onScan={handleScan}
        />

        <HandDiagram
          side="right"
          activeFinger={activeFinger > 5 ? activeFinger : undefined}
          completed={completed.filter((n) => n > 5)}
          skipped={skipped.filter((n) => n > 5)}
        />
      </main>

      {/* Status row */}
      <div className="px-10 pb-6 text-center text-xs text-muted-foreground">
        Dedo {activeFinger} de 10 · {completed.length} completados · {skipped.length} omitidos
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-10 py-5 bg-white border-t border-border/60">
        <img src={footerPba} alt="Gobierno de la provincia de Buenos Aires" className="h-8 w-auto" />
        <span className="text-sm text-muted-foreground">Gobierno de la provincia de Buenos Aires</span>
      </footer>
    </div>
  );
}
