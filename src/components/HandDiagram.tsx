import { motion } from "framer-motion";

interface Props {
  side: "left" | "right";
  activeFinger?: number; // global finger number 1-10
  completed?: number[];
  skipped?: number[];
}

// Finger numbering per spec:
// Left hand: 1 pinky, 2 ring, 3 middle, 4 index, 5 thumb
// Right hand: 6 thumb, 7 index, 8 middle, 9 ring, 10 pinky
const LEFT_FINGERS = [
  { n: 1, name: "pinky" },
  { n: 2, name: "ring" },
  { n: 3, name: "middle" },
  { n: 4, name: "index" },
  { n: 5, name: "thumb" },
];
const RIGHT_FINGERS = [
  { n: 6, name: "thumb" },
  { n: 7, name: "index" },
  { n: 8, name: "middle" },
  { n: 9, name: "ring" },
  { n: 10, name: "pinky" },
];

// Approximate fingertip positions (x, y) for a 220x300 hand SVG, right-hand layout
// We mirror for left.
const TIP_POSITIONS_RIGHT: Record<string, { x: number; y: number; tipR: number }> = {
  thumb: { x: 40, y: 175, tipR: 16 },
  index: { x: 78, y: 55, tipR: 15 },
  middle: { x: 118, y: 35, tipR: 15 },
  ring: { x: 158, y: 55, tipR: 15 },
  pinky: { x: 192, y: 95, tipR: 14 },
};

export function HandDiagram({ side, activeFinger, completed = [], skipped = [] }: Props) {
  const fingers = side === "left" ? LEFT_FINGERS : RIGHT_FINGERS;
  const mirror = side === "left";

  return (
    <div className="relative w-[260px] h-[340px] select-none">
      <svg
        viewBox="0 0 220 300"
        width="100%"
        height="100%"
        style={{ transform: mirror ? "scaleX(-1)" : undefined }}
      >
        <defs>
          <linearGradient id={`palm-${side}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-elevated)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        {/* Palm + fingers silhouette */}
        <g
          fill={`url(#palm-${side})`}
          stroke="color-mix(in oklab, var(--color-foreground) 14%, transparent)"
          strokeWidth="1.2"
        >
          {/* Palm */}
          <path d="M50 130 C 50 100, 60 90, 75 90 L 150 90 C 175 90, 185 110, 185 140 L 185 230 C 185 270, 160 290, 120 290 C 75 290, 50 270, 50 230 Z" />
          {/* Thumb */}
          <path d="M50 140 C 30 150, 22 165, 28 185 C 32 200, 45 205, 55 200 L 60 165 Z" />
          {/* Index */}
          <path d="M68 95 C 68 70, 70 45, 78 35 C 86 28, 94 32, 95 50 L 95 100 Z" />
          {/* Middle */}
          <path d="M105 90 C 105 60, 110 30, 118 22 C 126 16, 134 22, 134 45 L 134 95 Z" />
          {/* Ring */}
          <path d="M142 92 C 142 60, 148 40, 156 35 C 164 32, 170 40, 170 60 L 170 100 Z" />
          {/* Pinky */}
          <path d="M174 105 C 178 85, 184 75, 190 75 C 196 76, 200 85, 198 100 L 192 130 Z" />
        </g>

        {/* Fingertip indicators */}
        {fingers.map((f) => {
          const pos = TIP_POSITIONS_RIGHT[f.name];
          const isActive = activeFinger === f.n;
          const isDone = completed.includes(f.n);
          const isSkipped = skipped.includes(f.n);
          const color = isDone
            ? "var(--color-success)"
            : isSkipped
            ? "color-mix(in oklab, var(--color-foreground) 30%, transparent)"
            : isActive
            ? "var(--color-scanner)"
            : "color-mix(in oklab, var(--color-foreground) 14%, transparent)";

          return (
            <g key={f.n}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pos.tipR}
                fill={isActive ? "color-mix(in oklab, var(--color-scanner) 22%, transparent)" : "transparent"}
                stroke={color}
                strokeWidth={isActive ? 2 : 1.4}
              />
              {isActive && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={pos.tipR + 6}
                  fill="none"
                  stroke="var(--color-scanner)"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                >
                  <animate attributeName="r" values={`${pos.tipR + 4};${pos.tipR + 12};${pos.tipR + 4}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Finger number labels (rendered outside flipped svg so digits remain readable) */}
      {fingers.map((f) => {
        const pos = TIP_POSITIONS_RIGHT[f.name];
        // Convert SVG coords to container px (svg is 100% width of 260px container, viewBox 220)
        const scale = 260 / 220;
        const x = mirror ? (220 - pos.x) * scale : pos.x * scale;
        const y = pos.y * (340 / 300);
        const isActive = activeFinger === f.n;
        const isDone = (completed ?? []).includes(f.n);
        return (
          <motion.div
            key={f.n}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-[11px] font-semibold tabular-nums"
            style={{
              left: x,
              top: y,
              width: 22,
              height: 22,
              background: isActive
                ? "var(--color-scanner)"
                : isDone
                ? "var(--color-success)"
                : "color-mix(in oklab, var(--color-surface-elevated) 90%, transparent)",
              color: isActive || isDone ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
              border: `1px solid ${isActive ? "var(--color-scanner)" : "var(--color-border)"}`,
              boxShadow: isActive
                ? "0 0 0 4px color-mix(in oklab, var(--color-scanner) 18%, transparent)"
                : "none",
            }}
            animate={{ scale: isActive ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {f.n}
          </motion.div>
        );
      })}
    </div>
  );
}
