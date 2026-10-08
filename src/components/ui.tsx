"use client";

import type { Basis, Confidence, Vendor } from "@/lib/types";

export const vendorColor = (v: Vendor) => `var(--v${v.colorSlot})`;

export function VendorDot({ vendor }: { vendor: Vendor }) {
  return <span aria-hidden className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: vendorColor(vendor) }} />;
}

export function BasisBadge({ basis, confidence }: { basis: Basis; confidence: Confidence }) {
  const published = basis === "published";
  return (
    <span
      title={
        published
          ? "The vendor publishes this dollar allotment."
          : `Editorial estimate (${confidence} confidence). The vendor does not publish the dollar value of included usage.`
      }
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        published ? "border-line text-ink-2" : "border-dashed border-ink-3 text-ink-2"
      }`}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: published ? "var(--s-published)" : "var(--s-estimated)" }}
      />
      {published ? "Published" : `Est. · ${confidence}`}
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            title={o.hint}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
              on ? "bg-surface font-medium text-ink shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionHeading({ title, children, id }: { title: string; children?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-4">
      <h2 id={id} className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {children && <p className="mt-1 max-w-3xl text-sm text-ink-2">{children}</p>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3 sm:p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-3 sm:text-xs">{label}</div>
      <div className="num mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-2 sm:text-[13px]">{sub}</div>}
    </div>
  );
}
