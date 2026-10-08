"use client";

import { useState } from "react";
import { r2 } from "@/lib/format";

export interface BarRow {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  valueLabel: string;
  /** CSS color (var(--vN)) identifying the entity, never its rank. */
  color: string;
  /** Optional leading icon next to the label. */
  icon?: React.ReactNode;
  /** Hatched fill marks estimated values (texture as a second channel). */
  hatched?: boolean;
  tooltip?: string;
}

/** Horizontal bars anchored to a zero baseline, direct-labelled. HTML so it reflows on phones. */
export function BarList({
  rows,
  max,
  ariaLabel,
  refLine,
}: {
  rows: BarRow[];
  max?: number;
  ariaLabel: string;
  refLine?: { value: number; label: string };
}) {
  const [hover, setHover] = useState<string | null>(null);
  const top = max ?? Math.max(...rows.map((r) => r.value), refLine?.value ?? 0, 1e-9);
  return (
    <div role="list" aria-label={ariaLabel} className="relative flex flex-col gap-1.5">
      {rows.map((r) => {
        const w = r2(Math.max(0.5, (r.value / top) * 100));
        const active = hover === r.id;
        return (
          <div
            role="listitem"
            key={r.id}
            className="grid grid-cols-[minmax(7.5rem,11rem)_1fr_3.75rem] items-center gap-2 sm:grid-cols-[13rem_1fr_4.5rem]"
            onMouseEnter={() => setHover(r.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(r.id)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            title={r.tooltip}
          >
            <div className="min-w-0 text-right leading-tight">
              <div className={`flex items-center justify-end gap-1.5 text-[13px] ${active ? "font-medium text-ink" : "text-ink"}`}>
                {r.icon}
                <span className="truncate">{r.label}</span>
              </div>
              {r.sublabel && <div className="truncate text-[11px] text-ink-3">{r.sublabel}</div>}
            </div>
            <div className="relative h-5">
              <div
                className="absolute inset-y-0 left-0 rounded-r-[4px]"
                style={{
                  width: `${w}%`,
                  background: r.hatched
                    ? `repeating-linear-gradient(45deg, ${r.color} 0 4px, color-mix(in srgb, ${r.color} 70%, var(--surface)) 4px 7px)`
                    : r.color,
                  opacity: hover && !active ? 0.55 : 1,
                  transition: "opacity 120ms",
                }}
              />
              {refLine && (
                <div
                  aria-hidden
                  className="absolute inset-y-[-3px] border-l border-dashed border-ink-3"
                  style={{ left: `${r2((refLine.value / top) * 100)}%` }}
                />
              )}
            </div>
            <div className="num text-right text-[13px] font-medium text-ink">{r.valueLabel}</div>
          </div>
        );
      })}
      {refLine && (
        <div className="mt-1 grid grid-cols-[minmax(7.5rem,11rem)_1fr_3.75rem] gap-2 text-[11px] text-ink-3 sm:grid-cols-[13rem_1fr_4.5rem]">
          <span />
          <span className="relative h-4">
            <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${r2((refLine.value / top) * 100)}%` }}>
              {refLine.label}
            </span>
          </span>
          <span />
        </div>
      )}
    </div>
  );
}
