import { useId } from "react";
import { cn } from "../utils/cn";

/**
 * ARJU — Taste of Canada logo, rebuilt as pure SVG from the brand emblem:
 * toque chef hat, fork & spoon, double plate ring, faceted red maple leaf,
 * serif wordmark with the signature smile arc.
 */

export const LEAF =
  "M50 2 L59 28 L86 14 L75 42 L98 47 L74 61 L85 86 L58 74 L63 100 L55 94 L55 128 L45 128 L45 94 L37 100 L42 74 L15 86 L26 61 L2 47 L25 42 L14 14 L41 28 Z";

const HAT =
  "M-40 0 C-56 -2 -66 -18 -56 -30 C-68 -44 -50 -62 -36 -52 C-32 -76 -2 -82 0 -62 C2 -82 32 -76 36 -52 C50 -62 68 -44 56 -30 C66 -18 56 -2 40 0 Z";

const FORK =
  "M-22 0h7v36h-7Z M-10 0h7v36h-7Z M2 0h7v36h-7Z M14 0h7v36h-7Z M-24 36h48l-13 22h-22Z M-6 58L6 58L4 146Q0 154 -4 146Z";

const SPOON_HANDLE =
  "M-5 34C-4 72 -4 100 -5 146Q0 156 5 146C4 100 4 72 5 34Z";

function Emblem({ leafId }: { leafId: string }) {
  return (
    <g>
      {/* fork */}
      <g transform="translate(-98 -75) rotate(-8)">
        <path d={FORK} fill="currentColor" />
      </g>
      {/* spoon */}
      <g transform="translate(98 -75) rotate(8)">
        <ellipse cx="0" cy="20" rx="15" ry="21" fill="currentColor" />
        <path d={SPOON_HANDLE} fill="currentColor" />
      </g>
      {/* toque */}
      <g transform="translate(0 -64)">
        <path
          d={HAT}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
      {/* plate ring */}
      <circle r="57" fill="none" stroke="currentColor" strokeWidth="5" />
      <path
        d="M-67.6 -18.1 A70 70 0 0 1 -18.1 -67.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M18.1 -67.6 A70 70 0 0 1 67.6 -18.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M-59.2 -21.6 A63 63 0 0 1 -21.6 -59.2"
        fill="none"
        stroke="#C8102E"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M21.6 -59.2 A63 63 0 0 1 59.2 -21.6"
        fill="none"
        stroke="#C8102E"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* maple leaf */}
      <g transform="translate(-31 -44) scale(0.62)">
        <path d={LEAF} fill={`url(#${leafId})`} />
        <path d="M50 12 L50 90" stroke="rgba(70,0,10,0.30)" strokeWidth="4" />
        <path d="M50 58 L30 72" stroke="rgba(70,0,10,0.18)" strokeWidth="3" />
        <path d="M50 58 L70 72" stroke="rgba(255,255,255,0.14)" strokeWidth="3" />
      </g>
    </g>
  );
}

function LeafDefs({ leafId }: { leafId: string }) {
  return (
    <defs>
      <linearGradient id={leafId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E8253F" />
        <stop offset="55%" stopColor="#C8102E" />
        <stop offset="100%" stopColor="#8E0E1E" />
      </linearGradient>
      <linearGradient id={`${leafId}-word`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E4183A" />
        <stop offset="100%" stopColor="#8E0E1E" />
      </linearGradient>
    </defs>
  );
}

interface LogoProps {
  variant?: "full" | "mark";
  tone?: "dark" | "light"; // dark = on light bg, light = on dark bg
  className?: string;
}

export default function Logo({ variant = "full", tone = "dark", className }: LogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const leafId = `leaf-${uid}`;
  const wordId = `leaf-${uid}-word`;
  const tagFill = tone === "dark" ? "#161314" : "#F5F0E8";

  if (variant === "mark") {
    return (
      <svg
        viewBox="-124 -152 248 230"
        role="img"
        aria-label="ARJU Taste of Canada"
        className={cn("text-cream", className)}
      >
        <LeafDefs leafId={leafId} />
        <Emblem leafId={leafId} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="-160 -152 320 556"
      role="img"
      aria-label="ARJU — Taste of Canada"
      className={cn("text-cream", className)}
    >
      <LeafDefs leafId={leafId} />
      <Emblem leafId={leafId} />
      <text
        x="0"
        y="256"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="800"
        fontSize="104"
        letterSpacing="6"
        fill={`url(#${wordId})`}
      >
        ARJU
      </text>
      <g transform="translate(0 286)">
        <line x1="-122" y1="0" x2="-16" y2="0" stroke="#C8102E" strokeWidth="2" />
        <line x1="16" y1="0" x2="122" y2="0" stroke="#C8102E" strokeWidth="2" />
        <g transform="translate(-5.5 -6.4) scale(0.11)">
          <path d={LEAF} fill="#C8102E" />
        </g>
      </g>
      <text
        x="0"
        y="334"
        textAnchor="middle"
        fontFamily="'Jost', 'Segoe UI', sans-serif"
        fontWeight="500"
        fontSize="21"
        letterSpacing="11"
        fill={tagFill}
      >
        TASTE OF CANADA
      </text>
      <path
        d="M-64 352 Q0 388 64 352"
        fill="none"
        stroke="#C8102E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M-88 346 Q0 398 88 346"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
