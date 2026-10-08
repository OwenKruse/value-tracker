"use client";

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

  return (
    <section aria-label="Controls" className="card grid gap-5 p-4 sm:p-5 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-3">How hard you use it</div>
          <Segmented
            label="Usage scenario"
            value={settings.scenario}
            onChange={(scenario) => update({ scenario })}
            options={[
              { value: "low", label: "Light", hint: "Low end of the estimated range" },
              { value: "mid", label: "Typical", hint: "Midpoint of the estimated range" },
              { value: "high", label: "Heavy", hint: "High end of the estimated range" },
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
  );
}
