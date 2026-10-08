"use client";

import { useState } from "react";
import { useSettings } from "./SettingsProvider";
import { Segmented } from "./ui";
import { allInCostPerMOut, referenceModels } from "@/lib/metrics";
import { usd } from "@/lib/format";
import type { Weights } from "@/lib/types";

const WEIGHTS: { key: keyof Weights; label: string; hint: string }[] = [
  { key: "value", label: "Subsidy", hint: "API-equivalent value ÷ plan price" },
  { key: "intel", label: "Intelligence", hint: "Best model on the plan (Artificial Analysis index)" },
  { key: "capacity", label: "Capacity", hint: "Absolute output tokens per month" },
];

export function Controls() {
  const { settings, update, reset, isCustomised } = useSettings();
  const ref = referenceModels.find((m) => m.id === settings.refModelId);
  const [open, setOpen] = useState(false);

  const toggle = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="filter-panel"
      onClick={() => setOpen((o) => !o)}
      className="inline-flex items-center gap-2 self-start rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium hover:border-ink-3"
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
        <p className="text-xs text-ink-3">
          {settings.scenario === "high" ? "Assuming you use your full plan allowance" : settings.scenario === "mid" ? "Assuming typical use" : "Assuming light use"}
          {settings.basisFilter === "published" ? " · published plans only" : ""} · tokens priced on {ref?.name ?? "reference model"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
    {toggle}
    <section id="filter-panel" aria-label="Filters and assumptions" className="card grid gap-5 p-4 sm:p-5 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-3">Assumed usage</div>
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
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-3">Show</div>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ref-model" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-3">
            Convert dollars to tokens using
          </label>
          <select
            id="ref-model"
            value={settings.refModelId}
            onChange={(e) => update({ refModelId: e.target.value })}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          >
            {referenceModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {usd(allInCostPerMOut(m)!)} per 1M output
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-3">
            All-in cost per 1M output tokens including the cached context an agent re-reads ({ref ? ref.name : "model"}{" "}
            list prices). See Methodology.
          </p>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-3">Composite score weights</legend>
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
    </section>
    </div>
  );
}
