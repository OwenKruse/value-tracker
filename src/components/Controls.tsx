"use client";

import { useState } from "react";
import { useSettings } from "./SettingsProvider";
import { Segmented } from "./ui";
import { plans } from "@/lib/data";
import { usd } from "@/lib/format";
import type { Plan, Weights } from "@/lib/types";

const WEIGHTS: { key: keyof Weights; label: string; hint: string }[] = [
  { key: "value", label: "Subsidy", hint: "API-equivalent value ÷ plan price" },
  { key: "intel", label: "Intelligence", hint: "Best model on the plan (Artificial Analysis index)" },
  { key: "capacity", label: "Capacity", hint: "Absolute output tokens per month" },
];


function OverrideRow({ plan }: { plan: Plan }) {
  const { settings, setOverride } = useSettings();
  const custom = settings.overrides[plan.id];
  const fallback = plan.apiValue[settings.scenario];
  // null while not editing: show the saved value; a string while the user types
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (custom != null ? String(custom) : "");

  const commit = () => {
    const text = (draft ?? "").trim();
    setDraft(null);
    const n = Number(text);
    setOverride(plan.id, text === "" || !isFinite(n) || n < 0 ? null : n);
  };

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-[13px]">
      <label htmlFor={`own-${plan.id}`} className="min-w-0 truncate">
        {plan.name} <span className="text-ink-3">{usd(plan.price)}/mo</span>
      </label>
      <div className="flex items-center gap-1">
        <span className="text-ink-3">$</span>
        <input
          id={`own-${plan.id}`}
          inputMode="decimal"
          placeholder={String(fallback)}
          value={shown}
          onFocus={() => setDraft(shown)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className={`num w-20 rounded-md border bg-surface px-2 py-1 text-right ${custom != null ? "border-accent" : "border-line"}`}
        />
      </div>
      <button
        type="button"
        onClick={() => setOverride(plan.id, null)}
        disabled={custom == null}
        aria-label={`Reset ${plan.name} to the default value`}
        className="w-10 text-left text-xs text-accent-ink underline disabled:invisible"
      >
        reset
      </button>
    </div>
  );
}

function OwnNumbers() {
  const estimated = plans.filter((p) => p.basis === "estimated");
  return (
    <details className="group lg:col-span-2">
      <summary className="eyebrow cursor-pointer select-none list-none hover:!text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
        Use your own numbers
      </summary>
      <p className="mt-2 max-w-2xl text-xs text-ink-3">
        For plans where the vendor doesn&apos;t publish the dollar value of included usage, enter what yours is worth per month at
        API list prices (for example from <code className="rounded bg-surface-2 px-1">ccusage</code> or the Codex usage
        dashboard). Leave blank to use the default. Saved in this browser only.
      </p>
      <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {estimated.map((p) => (
          <OverrideRow key={p.id} plan={p} />
        ))}
      </div>
    </details>
  );
}

export function Controls() {
  const { settings, update, reset, isCustomised } = useSettings();
  const [open, setOpen] = useState(false);

  const toggle = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="filter-panel"
      onClick={() => setOpen((o) => !o)}
      className="btn btn-secondary corners self-start !gap-2"
    >
      <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M2 4h12M4.5 8h7M7 12h2" />
      </svg>
      Filters
      {isCustomised && <span aria-label="changed from defaults" className="h-2 w-2 rounded-full bg-accent" />}
      <span aria-hidden className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
    </button>
  );

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {toggle}
        <p className="font-mono text-[11px] text-ink-3">
          {settings.scenario === "high" ? "Assuming you use your full plan allowance" : settings.scenario === "mid" ? "Assuming typical use" : "Assuming light use"}
          {settings.basisFilter === "published" ? " · published plans only" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
    {toggle}
    <section id="filter-panel" aria-label="Filters and assumptions" className="card corners grid gap-5 p-4 sm:p-6 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 eyebrow">Assumed usage</div>
          <Segmented
            label="Usage scenario"
            value={settings.scenario}
            onChange={(scenario) => update({ scenario })}
            options={[
              { value: "low", label: "Light use", hint: "Low end of the estimated range" },
              { value: "mid", label: "Typical", hint: "Midpoint of the estimated range" },
              { value: "high", label: "Full plan", hint: "High end of the estimated range: you use the whole allowance" },
            ]}
          />
          <p className="mt-1.5 max-w-xs text-xs text-ink-3">
            Moves only the <em>estimated</em> plans. Vendor-published allotments are fixed.
          </p>
        </div>
        <div>
          <div className="mb-1.5 eyebrow">Show</div>
          <Segmented
            label="Data basis"
            value={settings.basisFilter}
            onChange={(basisFilter) => update({ basisFilter })}
            options={[
              { value: "all", label: "All plans" },
              { value: "published", label: "Published only" },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-5">
        <fieldset>
          <legend className="mb-1.5 eyebrow">Composite score weights</legend>
          <div className="flex flex-col gap-2">
            {WEIGHTS.map((w) => (
              <label key={w.key} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-[13px]" title={w.hint}>
                <span className="text-ink-2">{w.label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={settings.weights[w.key]}
                  onChange={(e) => update({ weights: { ...settings.weights, [w.key]: Number(e.target.value) } })}
                />
                <span className="num text-right text-ink">{settings.weights[w.key]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {isCustomised && (
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-line px-3 py-1.5 text-[13px] text-ink-2 hover:text-ink"
            >
              Reset all controls and overrides
            </button>
          </div>
        )}
      </div>

      <OwnNumbers />
    </section>
    </div>
  );
}
