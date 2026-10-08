"use client";

import { VendorLogo } from "./Logo";
import type { Basis, Confidence, Vendor } from "@/lib/types";

export const vendorColor = (v: Vendor) => `var(--v${v.colorSlot})`;

/** Product icon (models.dev logo, or a monogram where none exists). */
export function VendorDot({ vendor, size = 18 }: { vendor: Vendor; size?: number }) {
  return (
    <span className="inline-flex shrink-0 text-ink" title={vendor.name}>
      <VendorLogo vendor={vendor} size={size} />
    </span>
  );
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
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-line bg-surface-2 p-0.5">
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
            className={`rounded-[5px] px-3 py-1.5 font-mono text-[12px] transition-colors ${
              on ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionHeading({
  title,
  children,
  id,
  eyebrow,
}: {
  title: string;
  children?: React.ReactNode;
  id?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && <div className="eyebrow mb-2">[ {eyebrow} ]</div>}
      <h2 id={id} className="text-xl font-medium tracking-tight sm:text-2xl">
        {title}
      </h2>
      {children && <p className="mt-1.5 max-w-3xl text-sm text-ink-2">{children}</p>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card corners bg-surface p-4 sm:p-5">
      <div className="eyebrow">{label}</div>
      <div className="num mt-2 text-2xl font-medium tracking-tight sm:text-3xl">{value}</div>
      {sub && <div className="mt-1 font-mono text-[11px] leading-snug text-ink-2 sm:text-xs">{sub}</div>}
    </div>
  );
}
