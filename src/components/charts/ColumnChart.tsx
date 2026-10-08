"use client";

import { useState } from "react";
import { r2 } from "@/lib/format";

export interface ColumnRow {
  id: string;
  label: string;
  value: number;
  valueLabel: string;
  /** CSS colour identifying the entity (vendor), never its rank. */
  color: string;
  icon?: React.ReactNode;
  /** Hatched fill marks estimated values. */
  hatched?: boolean;
  tooltip: string[];
}

const PLOT_H = 240;
const TOP_PAD = 20; // room above the plot for the tallest value label

/** Vertical columns anchored to a zero baseline. Scrolls sideways on narrow screens. */
export function ColumnChart({
  rows,
  max = 100,
  ticks = [0, 25, 50, 75, 100],
  ariaLabel,
}: {
  rows: ColumnRow[];
  max?: number;
  ticks?: number[];
  ariaLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover != null ? rows[hover] : null;
  const centerPct = hover != null ? r2(((hover + 0.5) / rows.length) * 100) : 0;

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[760px]" role="list" aria-label={ariaLabel} style={{ paddingTop: TOP_PAD }}>
          {/* y axis labels + gridlines */}
          <div className="absolute left-0 w-8" style={{ top: TOP_PAD, height: PLOT_H }} aria-hidden>
            {ticks.map((t) => (
              <span
                key={t}
                className="num absolute right-1 -translate-y-1/2 font-mono text-[10px] text-ink-3"
                style={{ bottom: `${r2((t / max) * 100)}%`, transform: "translateY(50%)" }}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="relative ml-8" style={{ height: PLOT_H }} aria-hidden>
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 border-t"
                style={{
                  bottom: `${r2((t / max) * 100)}%`,
                  borderColor: t === 0 ? "var(--ink-3)" : "var(--grid)",
                }}
              />
            ))}
          </div>

          {/* columns */}
          <div className="absolute left-8 right-0 top-0 flex" style={{ height: TOP_PAD + PLOT_H + 132 }}>
            {rows.map((r, i) => {
              const h = r2((r.value / max) * 100);
              const on = hover === i;
              return (
                <div
                  key={r.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${r.label}: ${r.valueLabel}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className="group flex min-w-0 flex-1 flex-col items-center outline-offset-[-2px]"
                >
                  <div className="relative w-full" style={{ height: TOP_PAD + PLOT_H }}>
                    <span
                      className={`num absolute left-0 right-0 text-center font-mono text-[11px] ${on ? "font-medium text-ink" : "text-ink-2"}`}
                      style={{ bottom: (PLOT_H * h) / 100 + 3 }}
                    >
                      {r.valueLabel}
                    </span>
                    <div
                      className="absolute bottom-0 left-1/2 w-[58%] max-w-[30px] -translate-x-1/2 rounded-t-[4px]"
                      style={{
                        height: Math.max(2, (PLOT_H * h) / 100),
                        background: r.hatched
                          ? `repeating-linear-gradient(45deg, ${r.color} 0 4px, color-mix(in srgb, ${r.color} 70%, var(--surface)) 4px 7px)`
                          : r.color,
                        opacity: hover != null && !on ? 0.5 : 1,
                        transition: "opacity 120ms",
                      }}
                    />
                  </div>
                  <div className="mt-2 flex flex-col items-center gap-2 text-ink">
                    {r.icon}
                    <span
                      className={`whitespace-nowrap text-[11px] ${on ? "font-medium text-ink" : "text-ink-2"}`}
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: 104, overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {r.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ height: 132 }} aria-hidden />
        </div>
      </div>

      {active && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 w-56 rounded-lg border border-line bg-surface p-2.5 text-xs shadow-lg"
          style={{ left: `clamp(7rem, calc(2rem + (100% - 2rem) * ${centerPct / 100}), calc(100% - 7rem))`, transform: "translateX(-50%)" }}
        >
          <div className="mb-1 font-medium text-ink">{active.label}</div>
          {active.tooltip.map((t) => (
            <div key={t} className="num text-ink-2">{t}</div>
          ))}
        </div>
      )}
    </div>
  );
}
