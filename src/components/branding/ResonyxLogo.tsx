import React from "react";
import Link from "next/link";

interface ResonyxLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  collapsed?: boolean;
}

export function ResonyxLogo({
  className = "",
  size = "md",
  showTagline = false,
  collapsed = false,
}: ResonyxLogoProps) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;

  return (
    <Link
      href="/"
      className={`group flex items-center gap-3 transition-opacity duration-150 hover:opacity-95 ${className}`}
    >
      {/* Precision Shield + Connected Nodes + Repeating Pattern Emblem */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-b from-[#111c33] to-[#0a101f] p-2 ring-1 ring-white/10 shadow-lg shadow-sky-950/20 group-hover:ring-sky-500/30 transition-all duration-300"
        style={{ width: iconSize + 12, height: iconSize + 12 }}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-sky-600/10 via-transparent to-blue-500/10 pointer-events-none" />

        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Azure Gradient */}
            <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0078D4" />
              <stop offset="0.5" stopColor="#0284C7" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>

            {/* Pattern Ring Gradient */}
            <linearGradient id="ringGrad" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="1" stopColor="#0284C7" stopOpacity="0.2" />
            </linearGradient>

            {/* Core Node Glow */}
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0078D4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Shield Geometry */}
          <path
            d="M24 4L38 9.5V23C38 32.5 32 40.5 24 44C16 40.5 10 32.5 10 23V9.5L24 4Z"
            stroke="url(#shieldGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#0b1324"
            fillOpacity="0.85"
          />

          {/* Repeating Concentric Resonance Shield Waves (Pattern) */}
          <path
            d="M24 10L33 14V23C33 29.5 29 35.5 24 38C19 35.5 15 29.5 15 23V14L24 10Z"
            stroke="url(#ringGrad)"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
            strokeOpacity="0.75"
            fill="none"
          />
          <path
            d="M24 16L29 18.5V23.5C29 27.2 26.8 30.8 24 32.2C21.2 30.8 19 27.2 19 23.5V18.5L24 16Z"
            stroke="#0ea5e9"
            strokeWidth="1"
            strokeOpacity="0.45"
            fill="none"
          />

          {/* Connected Telemetry Nodes & Inter-Node Mesh Struts */}
          {/* Connector Lines */}
          <line x1="24" y1="16" x2="24" y2="24" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="24" y1="24" x2="18" y2="27" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="24" y1="24" x2="30" y2="27" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="24" y1="24" x2="24" y2="33" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="18" y1="27" x2="24" y2="33" stroke="#0284c7" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="30" y1="27" x2="24" y2="33" stroke="#0284c7" strokeWidth="1" strokeOpacity="0.4" />

          {/* Connected Telemetry Nodes (Failure memory points) */}
          <circle cx="24" cy="16" r="2.2" fill="#38BDF8" />
          <circle cx="18" cy="27" r="2" fill="#0EA5E9" />
          <circle cx="30" cy="27" r="2" fill="#0EA5E9" />
          <circle cx="24" cy="33" r="2" fill="#38BDF8" />

          {/* Central Hindsight Nucleus Node */}
          <circle cx="24" cy="24" r="3.2" fill="#0078D4" />
          <circle cx="24" cy="24" r="1.8" fill="#F0F9FF" />
        </svg>
      </div>

      {/* Brand Wordmark & Tagline */}
      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-[0.16em] text-white">
              RESONYX
            </span>
            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-400 ring-1 ring-sky-500/30">
              Enterprise
            </span>
          </div>
          {showTagline ? (
            <span className="text-[11px] font-medium tracking-wide text-slate-400">
              Every Failure Becomes Intelligence.
            </span>
          ) : (
            <span className="text-[11px] font-medium tracking-tight text-slate-400">
              Organizational Failure Intelligence
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
