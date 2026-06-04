import { useEffect, useState, useCallback } from "react";
import { ChevronDown, UserRound, Lock, LogOut, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FingerprintScanner,
  type ScannerState,
  type Quality,
} from "@/components/FingerprintScanner";
import { HandDiagram } from "@/components/HandDiagram";
import sibLogo from "@/assets/sib-logo.svg";
import footerPba from "@/assets/footer-pba.svg";

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

const MAX_ATTEMPTS = 3;

function pickQuality(): Quality {
  // Random good / medium / bad
  const r = Math.random();
  if (r < 0.34) return "good";
  if (r < 0.7) return "medium";
  return "bad";
}

export function ScanPage() {
  const [activeFinger, setActiveFinger] = useState(1);
  const [state, setState] = useState<ScannerState>("idle");
  const [attempt, setAttempt] = useState(1); // 1..MAX_ATTEMPTS
  const [quality, setQuality] = useState<Quality | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);

  const resetForNextFinger = useCallback(() => {
    setState("idle");
    setAttempt(1);
    setQuality(null);
    setActiveFinger((f) => Math.min(10, f + 1));
  }, []);

  // Reading → result (after 1/4s like prior)
  useEffect(() => {
    if (state !== "reading") return;
    const t = setTimeout(() => {
      const q = pickQuality();
      // If we've reached the last attempt and result would still be retryable bad,
      // commit as bad regardless.
      const isFinalAttempt = attempt >= MAX_ATTEMPTS;
      const final: Quality = isFinalAttempt && q === "bad" ? "bad" : q;
      setQuality(final);
      // Good or medium → committed immediately; bad on final attempt → committed
      if (final === "good" || final === "medium" || isFinalAttempt) {
        setState("committed");
      } else {
        setState("result");
      }
    }, 250);
    return () => clearTimeout(t);
  }, [state, attempt]);

  const handleScan = () => {
    if (state === "idle") {
      setState("reading");
      return;
    }
    if (state === "result" && quality === "bad" && attempt < MAX_ATTEMPTS) {
      setAttempt((a) => a + 1);
      setQuality(null);
      setState("reading");
    }
  };

  const handleNext = () => {
    if (state !== "committed") return;
    if (quality === "none") {
      setSkipped((arr) => [...arr, activeFinger]);
    } else {
      setCompleted((arr) => [...arr, activeFinger]);
    }
    resetForNextFinger();
  };

  const handleSkip = () => {
    if (state === "reading" || state === "committed") return;
    setQuality("none");
    setState("committed");
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex flex-row items-center gap-2.5 pl-[9px] pr-[5px] py-[5px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:opacity-90 transition-opacity outline-none"
              style={{ background: "#E9F7FB", height: 48, width: 212 }}
              aria-label="Menú de usuario Gerónimo Venzi"
            >
              <span
                className="relative flex items-center justify-center rounded-full text-white shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  background: "#00ADC1",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: "140%",
                  letterSpacing: "0.02em",
                }}
              >
                GV
                <span
                  className="absolute rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    left: 30,
                    top: 30,
                    background: "#2BB85D",
                    border: "2px solid #FFFFFF",
                    boxSizing: "border-box",
                  }}
                />
              </span>
              <span className="flex flex-row items-center gap-2.5">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: "140%",
                    color: "#26292A",
                  }}
                >
                  Gerónimo Venzi
                </span>
                <ChevronDown className="w-3 h-3" strokeWidth={2} style={{ color: "#00ADC1" }} />
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-2 rounded-xl">
            <div className="flex items-center gap-3 p-2">
              <span
                className="relative flex items-center justify-center rounded-full text-white font-medium shrink-0"
                style={{ width: 38, height: 38, background: "#00ADC1", fontFamily: "Inter, sans-serif", fontSize: 16 }}
              >
                GV
                <span
                  className="absolute rounded-full"
                  style={{ width: 8, height: 8, left: 30, top: 30, background: "#2BB85D", border: "2px solid #FFFFFF", boxSizing: "border-box" }}
                />
              </span>
              <div className="flex flex-col">
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, color: "#26292A" }}>
                  Gerónimo Venzi
                </span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B7280" }}>
                  geronimo.venzi@mjus.gba.gob.ar
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer">
              <UserRound className="w-4 h-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer">
              <Bell className="w-4 h-4" />
              <span>Notificaciones</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer">
              <Lock className="w-4 h-4" />
              <span>Cambiar contraseña</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer" style={{ color: "#DB401A" }}>
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Title */}
      <div className="text-center pt-10 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Escanear huellas</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Apoyá el dedo y presioná “Escanear huella” para tomar la muestra.
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
          quality={quality}
          attempt={attempt}
          maxAttempts={MAX_ATTEMPTS}
          onSkip={handleSkip}
          onScan={handleScan}
          onNext={handleNext}
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
