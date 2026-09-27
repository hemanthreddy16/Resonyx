"use client";

import React from "react";

interface RiskGaugeProps {
  score: number; // 0 - 100
  status: "ELEVATED" | "CRITICAL" | "MODERATE" | "NORMAL" | "MITIGATED";
  isMitigated?: boolean;
}

export function RiskGauge({ score, status, isMitigated = false }: RiskGaugeProps) {
  // Semi-circle gauge calculation: 180 degree span (from -180 to 0 degrees, or left to right)
  const radius = 100;
  const strokeWidth = 14;
  const cx = 140;
  const cy = 135;

  // Circumference for a half-circle is PI * radius
  const halfCircumference = Math.PI * radius; // approx 314.159
  // Progress ratio
  const progressRatio = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDashoffset = halfCircumference * (1 - progressRatio);

  // Needle angle: 0 score = -180 deg (points left), 100 score = 0 deg (points right)
  const needleAngle = -180 + progressRatio * 180;

  // Status colors
  const getStatusColor = () => {
    if (isMitigated || status === "NORMAL" || status === "MITIGATED") {
      return {
        badgeBg: "bg-emerald-950/80 border-emerald-700/60 text-emerald-300",
        needleColor: "#10b981",
        textColor: "text-emerald-400",
        strokeGradient: "url(#gaugeGradientGreen)",
        ringColor: "rgba(16, 185, 129, 0.25)",
      };
    }
    if (score >= 70 || status === "ELEVATED" || status === "CRITICAL") {
      return {
        badgeBg: "bg-rose-950/80 border-rose-700/60 text-rose-300 animate-pulse",
        needleColor: "#f43f5e",
        textColor: "text-rose-400",
        strokeGradient: "url(#gaugeGradientRed)",
        ringColor: "rgba(244, 63, 94, 0.35)",
      };
    }
    return {
      badgeBg: "bg-amber-950/80 border-amber-700/60 text-amber-300",
      needleColor: "#f59e0b",
      textColor: "text-amber-400",
      strokeGradient: "url(#gaugeGradientAmber)",
      ringColor: "rgba(245, 158, 11, 0.25)",
    };
  };

  const styleConfig = getStatusColor();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* SVG Semi-Circle Dial */}
        <svg
          width="280"
          height="160"
          viewBox="0 0 280 160"
          className="overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="gaugeGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            <linearGradient id="gaugeGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id="gaugeGradientAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track (semi-circle) */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Scale Tick Marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angleDeg = -180 + (tick / 100) * 180;
            const angleRad = (angleDeg * Math.PI) / 180;
            const innerR = radius - 14;
            const outerR = radius - 6;
            const x1 = cx + innerR * Math.cos(angleRad);
            const y1 = cy + innerR * Math.sin(angleRad);
            const x2 = cx + outerR * Math.cos(angleRad);
            const y2 = cy + outerR * Math.sin(angleRad);

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#475569"
                strokeWidth="2"
              />
            );
          })}

          {/* Active Gradient Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={styleConfig.strokeGradient}
            strokeWidth={strokeWidth}
            strokeDasharray={halfCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            filter="url(#gaugeGlow)"
          />

          {/* Pivot Center Point */}
          <circle
            cx={cx}
            cy={cy}
            r="8"
            fill="#0f172a"
            stroke={styleConfig.needleColor}
            strokeWidth="3"
          />

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <polygon
              points={`${cx - 3},${cy} ${cx + 3},${cy} ${cx},${cy - radius + 10}`}
              fill={styleConfig.needleColor}
            />
          </g>

          {/* Scale Labels */}
          <text x={cx - radius - 5} y={cy + 18} fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="monospace">
            0
          </text>
          <text x={cx} y={cy - radius - 8} fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="monospace">
            50
          </text>
          <text x={cx + radius + 5} y={cy + 18} fill="#64748b" fontSize="11" textAnchor="middle" fontFamily="monospace">
            100
          </text>
        </svg>

        {/* Central Metric Value Display */}
        <div className="text-center mt-[-10px]">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
            Current Operational Risk
          </div>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className={`text-4xl sm:text-5xl font-black tracking-tight font-mono ${styleConfig.textColor}`}>
              {score}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-500 font-mono">/ 100</span>
          </div>

          {/* Status Badge */}
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <span className={`rounded-md px-3 py-0.5 text-xs font-mono font-bold border tracking-wider ${styleConfig.badgeBg}`}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
