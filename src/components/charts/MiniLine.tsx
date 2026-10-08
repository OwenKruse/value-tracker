"use client";

import { useState } from "react";
import { r2 } from "@/lib/format";

export interface LinePoint {
  t: number; // epoch ms
  y: number;
  label: string; // tooltip title
  detail?: string;
}

const W = 340;
const H = 200;
const M = { l: 40, r: 14, t: 22, b: 26 };

/** Single-series line with crosshair-style hover. Few points are expected, so every point is marked. */
export function MiniLine({
  points,
  yFmt,
  yLabel,
  ariaLabel,
  color = "var(--accent)",
  yMin = 0,
}: {
  points: LinePoint[];
  yFmt: (n: number) => string;
  yLabel: string;
  ariaLabel: string;
  color?: string;
  yMin?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return null;

  const t0 = Math.min(...points.map((p) => p.t));
  let t1 = Math.max(...points.map((p) => p.t));
  if (t1 === t0) t1 = t0 + 86400000 * 30;
  const yMax = Math.max(...points.map((p) => p.y)) * 1.15;
  const sx = (t: number) => r2(M.l + ((t - t0) / (t1 - t0)) * (W - M.l - M.r - 24) + 12);
  const sy = (y: number) => r2(H - M.b - ((y - yMin) / (yMax - yMin || 1)) * (H - M.t - M.b));
  const ticks = [yMin, (yMin + yMax) / 2, yMax];
  const path = points.map((p, i) => `${i ? "L" : "M"}${sx(p.t)},${sy(p.y)}`).join(" ");
  const a = hover != null ? points[hover] : null;
  const fmtT = (t: number) => new Date(t).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block h-auto w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke="var(--grid)" />
            <text x={M.l - 6} y={sy(t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-3)" className="num">
              {yFmt(t)}
            </text>
          </g>
        ))}
        <text x={M.l} y={H - 8} fontSize={11} fill="var(--ink-3)">{fmtT(t0)}</text>
        <text x={W - M.r} y={H - 8} fontSize={11} fill="var(--ink-3)" textAnchor="end">{fmtT(t1)}</text>
        <text x={M.l} y={11} fontSize={11} fill="var(--ink-3)">
          {yLabel}
        </text>
        {points.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {a && <line x1={sx(a.t)} x2={sx(a.t)} y1={M.t} y2={H - M.b} stroke="var(--ink-3)" strokeDasharray="3 3" />}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <circle cx={sx(p.t)} cy={sy(p.y)} r={14} fill="transparent" />
            <circle cx={sx(p.t)} cy={sy(p.y)} r={hover === i ? 6 : 4.5} fill={color} stroke="var(--surface)" strokeWidth={2} />
            <text x={sx(p.t)} y={sy(p.y) - 10} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={500} className="num">
              {yFmt(p.y)}
            </text>
          </g>
        ))}
      </svg>
      {a && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 max-w-52 rounded-lg border border-line bg-surface p-2 text-xs shadow-lg"
          style={{
            left: `${(sx(a.t) / W) * 100}%`,
            top: `${(sy(a.y) / H) * 100}%`,
            transform: `translate(${sx(a.t) > W * 0.6 ? "calc(-100% - 10px)" : "10px"}, -50%)`,
          }}
        >
          <div className="font-medium text-ink">{a.label}</div>
          {a.detail && <div className="text-ink-2">{a.detail}</div>}
        </div>
      )}
    </div>
  );
}
