"use client";

import { useMemo, useState } from "react";
import { r2 } from "@/lib/format";

export interface ScatterPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  series: string;
  tooltip: string[];
  /** Draw a direct label next to this point. */
  labelled?: boolean;
}

const W = 680;
const H = 420;
const M = { l: 58, r: 20, t: 14, b: 48 };

export interface ScatterProps {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  xTicks: number[];
  yTicks: number[];
  xFmt: (n: number) => string;
  yFmt: (n: number) => string;
  /** Reference lines y = k·x, e.g. 1x = break-even against API list price. */
  ratios?: { k: number; label: string; strong?: boolean }[];
  ariaLabel: string;
  /** Series key -> legend label and CSS colour. */
  legend: { key: string; label: string; color: string }[];
  yScale?: "log" | "linear";
}

export function LogScatter({ points, xLabel, yLabel, xTicks, yTicks, xFmt, yFmt, ratios = [], ariaLabel, legend, yScale = "log" }: ScatterProps) {
  const [hover, setHover] = useState<string | null>(null);

  const dom = useMemo(() => {
    const x0 = xTicks[0], x1 = xTicks[xTicks.length - 1];
    const y0 = yTicks[0], y1 = yTicks[yTicks.length - 1];
    return { x0, x1, y0, y1 };
  }, [xTicks, yTicks]);

  const sx = (v: number) => r2(M.l + ((Math.log(v) - Math.log(dom.x0)) / (Math.log(dom.x1) - Math.log(dom.x0))) * (W - M.l - M.r));
  const yT = (v: number) => (yScale === "log" ? Math.log(v) : v);
  const sy = (v: number) => r2(H - M.b - ((yT(v) - yT(dom.y0)) / (yT(dom.y1) - yT(dom.y0))) * (H - M.t - M.b));

  // Pixel positions, dodging coincident points, then greedy label placement that avoids other labels and dots.
  const layout = useMemo(() => {
    const placedPts: { id: string; cx: number; cy: number }[] = [];
    for (const p of points) {
      let cx = sx(p.x);
      const cy = sy(p.y);
      for (const off of [0, 9, -9, 18, -18]) {
        if (!placedPts.some((q) => Math.hypot(q.cx - (cx + off), q.cy - cy) < 9)) {
          cx += off;
          break;
        }
      }
      placedPts.push({ id: p.id, cx, cy });
    }
    const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
    const overlaps = (b: { x0: number; x1: number; y0: number; y1: number }) =>
      boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) ||
      placedPts.some((q) => q.cx + 8 > b.x0 && q.cx - 8 < b.x1 && q.cy + 8 > b.y0 && q.cy - 8 < b.y1);
    const labels = new Map<string, { x: number; y: number; anchor: "start" | "end" | "middle" }>();
    const order = points.filter((p) => p.labelled).sort((a, b) => b.y - a.y);
    for (const p of order) {
      const { cx, cy } = placedPts.find((q) => q.id === p.id)!;
      const w = p.label.length * 6.1 + 4;
      const cands = [
        { x: cx + 10, y: cy + 4, anchor: "start" as const, b: { x0: cx + 9, x1: cx + 11 + w, y0: cy - 8, y1: cy + 8 } },
        { x: cx - 10, y: cy + 4, anchor: "end" as const, b: { x0: cx - 11 - w, x1: cx - 9, y0: cy - 8, y1: cy + 8 } },
        { x: cx, y: cy - 11, anchor: "middle" as const, b: { x0: cx - w / 2, x1: cx + w / 2, y0: cy - 24, y1: cy - 9 } },
        { x: cx, y: cy + 21, anchor: "middle" as const, b: { x0: cx - w / 2, x1: cx + w / 2, y0: cy + 9, y1: cy + 24 } },
      ];
      const ok = cands.find((c) => c.b.x0 >= M.l && c.b.x1 <= W - M.r && c.b.y0 >= M.t - 4 && !overlaps(c.b));
      if (ok) {
        boxes.push(ok.b);
        labels.set(p.id, { x: r2(ok.x), y: r2(ok.y), anchor: ok.anchor });
      }
    }
    return { pts: new Map(placedPts.map((q) => [q.id, { cx: r2(q.cx), cy: r2(q.cy) }])), labels };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, dom, yScale]);

  const active = points.find((p) => p.id === hover);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block h-auto w-full select-none">
        {/* grid + ticks */}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke="var(--grid)" strokeWidth={1} />
            <text x={M.l - 8} y={sy(t) + 4} textAnchor="end" fontSize={11} fill="var(--ink-3)" className="num">
              {yFmt(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={M.t} y2={H - M.b} stroke="var(--grid)" strokeWidth={1} />
            <text x={sx(t)} y={H - M.b + 16} textAnchor="middle" fontSize={11} fill="var(--ink-3)" className="num">
              {xFmt(t)}
            </text>
          </g>
        ))}
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke="var(--ink-3)" strokeWidth={1} />
        <text x={(M.l + W - M.r) / 2} y={H - 8} textAnchor="middle" fontSize={12} fill="var(--ink-2)">
          {xLabel}
        </text>
        <text transform={`translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize={12} fill="var(--ink-2)">
          {yLabel}
        </text>

        {/* ratio lines */}
        {ratios.map((r) => {
          const xa = Math.max(dom.x0, dom.y0 / r.k);
          const xb = Math.min(dom.x1, dom.y1 / r.k);
          if (xa >= xb) return null;
          const ex = sx(xb), ey = sy(xb * r.k);
          return (
            <g key={r.k}>
              <line
                x1={sx(xa)} y1={sy(xa * r.k)} x2={ex} y2={ey}
                stroke="var(--ink-3)" strokeWidth={r.strong ? 1.5 : 1} strokeDasharray={r.strong ? "0" : "4 4"} opacity={r.strong ? 0.9 : 0.6}
              />
              <text x={ex - 4} y={ey - 6} textAnchor="end" fontSize={11} fill="var(--ink-2)" fontWeight={r.strong ? 600 : 400}>
                {r.label}
              </text>
            </g>
          );
        })}

        {/* points */}
        {points.map((p) => {
          const { cx, cy } = layout.pts.get(p.id)!;
          const color = legend.find((l) => l.key === p.series)?.color ?? "var(--ink-3)";
          const isActive = hover === p.id;
          const lab = layout.labels.get(p.id);
          return (
            <g key={p.id} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}>
              <circle cx={cx} cy={cy} r={14} fill="transparent" />
              <circle
                cx={cx} cy={cy} r={isActive ? 7 : 5.5}
                fill={color} stroke="var(--surface)" strokeWidth={2}
                opacity={hover && !isActive ? 0.45 : 1}
              />
              {lab && !hover && (
                <text
                  x={lab.x} y={lab.y} textAnchor={lab.anchor} fontSize={11}
                  fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3} strokeLinejoin="round"
                >
                  {p.label}
                </text>
              )}
              {isActive && (
                <text
                  x={cx > W - 170 ? cx - 10 : cx + 10} y={cy + 4} textAnchor={cx > W - 170 ? "end" : "start"} fontSize={11}
                  fill="var(--ink)" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3} strokeLinejoin="round"
                >
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {active && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 w-52 rounded-lg border border-line bg-surface p-2.5 text-xs shadow-lg"
          style={{
            left: `${((layout.pts.get(active.id)?.cx ?? 0) / W) * 100}%`,
            top: `${((layout.pts.get(active.id)?.cy ?? 0) / H) * 100}%`,
            transform: `translate(${(layout.pts.get(active.id)?.cx ?? 0) > W * 0.6 ? "calc(-100% - 12px)" : "12px"}, -50%)`,
          }}
        >
          <div className="mb-1 font-medium text-ink">{active.label}</div>
          {active.tooltip.map((t) => (
            <div key={t} className="num text-ink-2">{t}</div>
          ))}
        </div>
      )}

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2" aria-label="Legend">
        {legend.map((l) => (
          <li key={l.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
