import { motion } from "framer-motion";
import leftHandSvg from "@/assets/mano-izquierda.svg?raw";
import rightHandSvg from "@/assets/mano-derecha.svg?raw";

interface Props {
  side: "left" | "right";
  activeFinger?: number;
  completed?: number[];
  skipped?: number[];
}

// Approximate fingertip centroids in the original 683x768 viewBox.
const TIPS_LEFT: Record<number, { x: number; y: number }> = {
  1: { x: 145, y: 295 }, // pinky
  2: { x: 226, y: 205 }, // ring
  3: { x: 314, y: 165 }, // middle
  4: { x: 411, y: 195 }, // index
  5: { x: 510, y: 410 }, // thumb
};
const TIPS_RIGHT: Record<number, { x: number; y: number }> = {
  6: { x: 175, y: 410 }, // thumb
  7: { x: 271, y: 200 }, // index
  8: { x: 368, y: 168 }, // middle
  9: { x: 457, y: 207 }, // ring
  10: { x: 538, y: 300 }, // pinky
};

const VB_W = 683;
const VB_H = 768;

export function HandDiagram({ side, activeFinger, completed = [], skipped = [] }: Props) {
  const isLeft = side === "left";
  const tips = isLeft ? TIPS_LEFT : TIPS_RIGHT;
  const raw = isLeft ? leftHandSvg : rightHandSvg;

  // Inject dynamic colors into the SVG markup:
  //  - .cls-2 (fingers / contour) → muted institutional gray
  //  - .cls-1 (capturas / fingertip pads) → default border tone; tinted per-state via overlay below
  const themedSvg = raw
    .replace(/fill:\s*#7e7e7e;?/gi, "fill: oklch(0.78 0.01 240);")
    .replace(/fill:\s*#06aec3;?/gi, "fill: color-mix(in oklab, var(--color-scanner) 18%, white);");

  return (
    <div className="relative w-[300px] aspect-[683/768] select-none">
      {/* Hand illustration */}
      <div
        className="absolute inset-0"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: themedSvg }}
      />

      {/* Per-finger overlay (highlight active capture + numbered chip) */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {Object.entries(tips).map(([n, p]) => {
          const num = Number(n);
          const isActive = activeFinger === num;
          const isDone = completed.includes(num);
          const isSkipped = skipped.includes(num);
          const color = isDone
            ? "var(--color-success)"
            : isSkipped
            ? "color-mix(in oklab, var(--color-foreground) 30%, transparent)"
            : isActive
            ? "var(--color-scanner)"
            : "transparent";

          return (
            <g key={n}>
              {/* Pulsing ring on active finger */}
              {isActive && (
                <>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={48}
                    fill="color-mix(in oklab, var(--color-scanner) 18%, transparent)"
                    stroke="var(--color-scanner)"
                    strokeWidth={2.5}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={48}
                    fill="none"
                    stroke="var(--color-scanner)"
                    strokeOpacity={0.6}
                    strokeWidth={2}
                  >
                    <animate attributeName="r" values="44;70;44" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {/* Status outline ring for done / skipped */}
              {(isDone || isSkipped) && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={44}
                  fill={
                    isDone
                      ? "color-mix(in oklab, var(--color-success) 14%, transparent)"
                      : "transparent"
                  }
                  stroke={color}
                  strokeWidth={2.5}
                  strokeDasharray={isSkipped ? "6 6" : undefined}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Numbered chips (HTML for crisp text & easy animation) */}
      {Object.entries(tips).map(([n, p]) => {
        const num = Number(n);
        const isActive = activeFinger === num;
        const isDone = completed.includes(num);
        const isSkipped = skipped.includes(num);
        return (
          <motion.div
            key={n}
            className="absolute flex items-center justify-center rounded-full text-[12px] font-semibold tabular-nums shadow-sm"
            style={{
              left: `${(p.x / VB_W) * 100}%`,
              top: `${(p.y / VB_H) * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 26,
              height: 26,
              background: isActive
                ? "var(--color-scanner)"
                : isDone
                ? "var(--color-success)"
                : isSkipped
                ? "var(--color-muted)"
                : "var(--color-surface)",
              color: isActive || isDone
                ? "var(--color-primary-foreground)"
                : "var(--color-foreground)",
              border: `1.5px solid ${
                isActive
                  ? "var(--color-scanner)"
                  : isDone
                  ? "var(--color-success)"
                  : "var(--color-border)"
              }`,
              boxShadow: isActive
                ? "0 0 0 4px color-mix(in oklab, var(--color-scanner) 18%, transparent)"
                : undefined,
            }}
            animate={{ scale: isActive ? 1.15 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {num}
          </motion.div>
        );
      })}
    </div>
  );
}
