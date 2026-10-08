"use client";

import { useMemo, useState } from "react";
import { BarList } from "./charts/BarList";
import { MiniLine, type LinePoint } from "./charts/MiniLine";
import { SectionHeading, VendorDot, vendorColor } from "./ui";
import { history, plans, snapshots, vendorById, vendors } from "@/lib/data";
import { fmtDate, mult, usd } from "@/lib/format";

export function OverTime() {
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [planId, setPlanId] = useState<string>("claude-max-20x");

  const events = useMemo(() => {
    const list = history.events.filter((e) => vendorFilter === "all" || e.vendorId === vendorFilter);
    // year-precision entries ("2026") sort after dated 2025 events but before specific late-2026 dates
    const key = (e: { date: string; precision: string }) => (e.precision === "year" ? `${e.date}-06-15` : e.date);
    return [...list].sort((a, b) => key(a).localeCompare(key(b)));
  }, [vendorFilter]);

  const plan = plans.find((p) => p.id === planId)!;
  const ledgerPts: LinePoint[] = snapshots
    .filter((s) => s.plans[planId])
    .map((s) => ({
      t: Date.parse(s.date + "T00:00:00Z"),
      y: s.plans[planId].mid / s.plans[planId].price,
      label: fmtDate(s.date),
      detail: `${usd(s.plans[planId].mid)} typical API value for ${usd(s.plans[planId].price)}`,
    }));

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="ref-points">
        <SectionHeading id="ref-points" title="Subsidy over time, where the data exists">
          Plans whose included usage can be priced at two dates. These are the only plans with a verifiable before-and-after.
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-3">
          {history.valueHistory.map((v) => {
            const p = plans.find((x) => x.id === v.planId)!;
            const vendor = vendorById(p.vendorId);
            const pts: LinePoint[] = v.points.map((pt) => ({
              t: Date.parse(pt.date + "T00:00:00Z"),
              y: pt.apiValue / pt.price,
              label: `${fmtDate(pt.date)}: ${usd(pt.apiValue)} for ${usd(pt.price)}`,
              detail: `${pt.note} (${pt.provenance})`,
            }));
            return (
              <figure key={v.planId} className="card p-4">
                <figcaption className="mb-2 flex items-center gap-2 text-sm font-medium"><VendorDot vendor={vendor} />{p.name}</figcaption>
                <MiniLine points={pts} yFmt={(n) => n.toFixed(1) + "x"} yLabel="API value ÷ price" color={vendorColor(vendor)} ariaLabel={`${p.name} value multiple over time`} />
              </figure>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-3">{history.disclaimer}</p>
      </section>

      <section aria-labelledby="ledger" className="card p-4 sm:p-5">
        <SectionHeading id="ledger" title="Snapshot ledger">
          Every run of <code className="rounded bg-surface-2 px-1 text-[12px]">npm run snapshot</code> stores each plan&apos;s price and API-value range in{" "}
          <code className="rounded bg-surface-2 px-1 text-[12px]">src/data/snapshots.json</code>. Update <code className="rounded bg-surface-2 px-1 text-[12px]">plans.json</code> when a vendor changes something, snapshot, and the chart grows.
        </SectionHeading>
        <label className="mb-3 flex max-w-sm flex-col gap-1 text-xs font-medium uppercase tracking-wide text-ink-3">
          Plan
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm normal-case tracking-normal text-ink">
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div className="max-w-md">
          <MiniLine points={ledgerPts} yFmt={(n) => n.toFixed(1) + "x"} yLabel="API value ÷ price" ariaLabel={`${plan.name} value multiple per snapshot`} color={vendorColor(vendorById(plan.vendorId))} />
        </div>
        <p className="mt-2 text-xs text-ink-3">
          {snapshots.length} snapshot{snapshots.length === 1 ? "" : "s"} recorded ({snapshots.map((s) => fmtDate(s.date)).join(", ")}). Latest typical multiple for {plan.name}: {mult(plan.apiValue.mid / plan.price)}.
        </p>
      </section>

      <section aria-labelledby="gens">
        <SectionHeading id="gens" title="Cost of the same work, by Claude model generation">
          Reference agentic workload (per 1M output tokens, plus the cached context an agent re-reads) priced at each generation&apos;s API list price. API list prices for Anthropic have fallen with every generation.
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-3">
          {history.generations.map((g) => (
            <figure key={g.family} className="card p-4">
              <figcaption className="mb-3 text-sm font-medium">{g.family}</figcaption>
              <BarList
                ariaLabel={`${g.family} reference workload cost by generation`}
                rows={g.steps.map((s) => {
                  const cost = s.output + 40 * s.cacheRead + 2 * s.cacheWrite + 4 * s.input;
                  return { id: s.label, label: s.label, sublabel: s.when, value: cost, valueLabel: usd(cost), color: "var(--v1)" };
                })}
              />
            </figure>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-3">
          Opus 4.1 to Opus 5.5 is a 4.3x drop for the same workload. Whether a plan&apos;s subsidy shrinks depends on whether its token allowance was held flat or grew, which vendors do not disclose.
        </p>
      </section>

      <section aria-labelledby="timeline">
        <SectionHeading id="timeline" title="Plan changes timeline" />
        <div role="group" aria-label="Filter by vendor" className="mb-4 flex flex-wrap gap-1.5">
          {[{ id: "all", name: "All" }, ...vendors.map((v) => ({ id: v.id, name: v.name }))].map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={vendorFilter === v.id}
              onClick={() => setVendorFilter(v.id)}
              className={`rounded-full border px-3 py-1 text-[13px] ${vendorFilter === v.id ? "border-ink bg-ink text-bg" : "border-line text-ink-2 hover:text-ink"}`}
            >
              {v.name}
            </button>
          ))}
        </div>
        <ol className="flex flex-col gap-3 border-l border-line pl-5">
          {events.map((e) => {
            const vendor = vendorById(e.vendorId);
            return (
              <li key={e.date + e.title} className="relative">
                <span aria-hidden className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-bg" style={{ background: vendorColor(vendor) }} />
                <div className="num text-xs text-ink-3">
                  {fmtDate(e.date, e.precision)} · {vendor.name} · {e.provenance}{e.upcoming ? " · upcoming" : ""}
                </div>
                <div className="font-medium">{e.title}</div>
                {e.detail && <div className="text-sm text-ink-2">{e.detail}</div>}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
