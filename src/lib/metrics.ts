import { modelById, models, plans, vendorById } from "./data";
import type { Model, Plan, PlanMetrics, Settings } from "./types";

/**
 * Reference agentic-coding workload, per 1M output tokens. Agent loops re-read
 * the same context every turn, so cache reads dominate. Editable here, and
 * documented on the Methodology page.
 */
export const WORKLOAD = { cacheReadPerOut: 40, cacheWritePerOut: 2, freshInputPerOut: 4 };

export const DEFAULT_SETTINGS: Settings = {
  scenario: "mid",
  refModelId: "sonnet-5.5",
  basisFilter: "all",
  weights: { value: 40, intel: 35, capacity: 25 },
  overrides: {},
};

/** USD to produce 1M output tokens (plus the context an agent reads to get there). */
export function allInCostPerMOut(m: Model): number | null {
  if (m.input == null || m.output == null) return null;
  const cacheRead = m.cacheRead ?? m.input * 0.1;
  const cacheWrite = m.cacheWrite ?? m.input * 1.25;
  return (
    m.output +
    WORKLOAD.cacheReadPerOut * cacheRead +
    WORKLOAD.cacheWritePerOut * cacheWrite +
    WORKLOAD.freshInputPerOut * m.input
  );
}

/** Models that can serve as the dollars-to-tokens reference. */
export const referenceModels = models.filter((m) => allInCostPerMOut(m) != null);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const logNorm = (x: number, lo: number, hi: number) =>
  clamp01((Math.log(x) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)));

// Fixed anchors keep scores stable when the table is filtered.
const ANCHORS = {
  multiple: [0.4, 12] as const,
  capacityM: [0.1, 100] as const,
  intel: [30, 58] as const,
};

export function computeMetrics(settings: Settings, list: Plan[] = plans): PlanMetrics[] {
  const ref = modelById(settings.refModelId) ?? modelById("sonnet-5.5")!;
  const refCost = allInCostPerMOut(ref)!;
  const w = settings.weights;

  const rows = list
    .filter((p) => settings.basisFilter === "all" || p.basis === "published")
    .map((plan) => {
      const override = settings.overrides[plan.id];
      const overridden = typeof override === "number" && override >= 0;
      const apiValue = overridden ? override : plan.apiValue[settings.scenario];
      const multiple = apiValue / plan.price;
      const outputTokensM = apiValue / refCost;
      const topModel = modelById(plan.topModelId);
      const intel = topModel?.aaIndex ?? null;

      const vN = logNorm(Math.max(multiple, 1e-6), ...ANCHORS.multiple);
      const cN = logNorm(Math.max(outputTokensM, 1e-6), ...ANCHORS.capacityM);
      let num = w.value * vN + w.capacity * cN;
      let den = w.value + w.capacity;
      if (intel != null) {
        num += w.intel * clamp01((intel - ANCHORS.intel[0]) / (ANCHORS.intel[1] - ANCHORS.intel[0]));
        den += w.intel;
      }
      const score = den > 0 ? (100 * num) / den : 0;

      return {
        plan,
        vendor: vendorById(plan.vendorId),
        apiValue,
        overridden,
        multiple,
        subsidyPct: (multiple - 1) * 100,
        outputTokensM,
        costPerMOut: plan.price / outputTokensM,
        intel,
        topModel,
        score,
      } satisfies PlanMetrics;
    });

  return rows;
}
