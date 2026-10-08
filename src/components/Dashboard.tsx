"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarList, type BarRow } from "./charts/BarList";
import { LogScatter, type ScatterPoint } from "./charts/LogScatter";
import { Controls } from "./Controls";
import { PlanTable } from "./PlanTable";
import { useSettings } from "./SettingsProvider";
import { SectionHeading, Stat, VendorDot, vendorColor } from "./ui";
import { modelById, plansForVendor, vendors, watchlist } from "@/lib/data";
import { mult, tokensM, usd } from "@/lib/format";
import { computeMetrics } from "@/lib/metrics";

export function Dashboard() {
  const { settings } = useSettings();
  const rows = useMemo(() => computeMetrics(settings), [settings]);
  const ref = modelById(settings.refModelId);

  const byMultiple = useMemo(() => [...rows].sort((a, b) => b.multiple - a.multiple), [rows]);
  const byTokens = useMemo(() => [...rows].sort((a, b) => b.outputTokensM - a.outputTokensM), [rows]);
  const byScore = useMemo(() => [...rows].sort((a, b) => b.score - a.score), [rows]);
  const bySmart = useMemo(
    () => [...rows].filter((r) => r.intel != null).sort((a, b) => (b.intel! - a.intel!) || a.plan.price - b.plan.price),
    [rows],
  );

  const tag = (r: (typeof rows)[number]) => (r.plan.basis === "estimated" && !r.overridden ? " · estimate" : "");
  const nEstimated = rows.filter((r) => r.plan.basis === "estimated" && !r.overridden).length;

  const bars: BarRow[] = byMultiple.map((r) => ({
    id: r.plan.id,
    label: r.plan.name,
    sublabel: `${usd(r.plan.price)}/mo → ${usd(r.apiValue)} API value`,
    value: r.multiple,
    valueLabel: mult(r.multiple),
    color: vendorColor(r.vendor),
    hatched: r.plan.basis === "estimated",
    tooltip: `${r.plan.name}: ${usd(r.apiValue)} of API-equivalent usage for ${usd(r.plan.price)} (${r.plan.basis})`,
  }));

  const labelled = new Set([
    ...byMultiple.slice(0, 3).map((r) => r.plan.id),
    ...byTokens.slice(0, 2).map((r) => r.plan.id),
    ...byScore.slice(0, 3).map((r) => r.plan.id),
    ...rows.filter((r) => r.multiple < 1).map((r) => r.plan.id),
    "copilot-max", "cursor-ultra", "kiro-pro", "claude-pro",
  ]);
  const points: ScatterPoint[] = rows.map((r) => ({
    id: r.plan.id,
    label: r.plan.name,
    x: r.plan.price,
    y: Math.max(r.apiValue, 1),
    series: r.plan.basis,
    labelled: labelled.has(r.plan.id),
    tooltip: [
      `${usd(r.plan.price)}/mo → ${usd(r.apiValue)} API value`,
      `${mult(r.multiple)} value · ${tokensM(r.outputTokensM)} output tok/mo`,
      r.intel != null ? `Best model: ${r.topModel?.name} (${r.intel})` : "Best-model intelligence n/a",
    ],
  }));

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          What does each AI coding plan really give you for the money?
        </h1>
        <p className="max-w-3xl text-ink-2">
          Flat-rate plans are often subsidised: the usage inside a $200 plan can be worth several times that at API list
          prices. This page converts every plan into API-equivalent dollars, output tokens and a single comparable score,
          next to the intelligence of the models you can actually use.
        </p>
      </section>

      {rows.length > 0 && (
        <section aria-label="Highlights" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Biggest subsidy" value={mult(byMultiple[0].multiple)} sub={`${byMultiple[0].plan.name} · ${usd(byMultiple[0].plan.price)}/mo${tag(byMultiple[0])}`} />
          <Stat label="Most output tokens" value={`${tokensM(byTokens[0].outputTokensM)}/mo`} sub={`${byTokens[0].plan.name} on ${ref?.name}${tag(byTokens[0])}`} />
          <Stat label="Smartest model access" value={bySmart[0] ? String(bySmart[0].intel) : "n/a"} sub={bySmart[0] ? `${bySmart[0].topModel?.name} · cheapest: ${bySmart[0].plan.name}` : ""} />
          <Stat label="Best composite" value={byScore[0].score.toFixed(0)} sub={`${byScore[0].plan.name} · ${usd(byScore[0].plan.price)}/mo${tag(byScore[0])}`} />
        </section>
      )}

      {nEstimated > 0 && (
        <aside role="note" className="flex gap-3 rounded-xl border border-dashed border-ink-3 bg-surface p-4 text-sm text-ink-2">
          <span aria-hidden className="mt-0.5 text-base" style={{ color: "var(--warn)" }}>▲</span>
          <p>
            <strong className="text-ink">{nEstimated} of {rows.length} plans use my estimates, not vendor numbers.</strong>{" "}
            Anthropic, OpenAI, Cognition and Google do not publish the dollar value of included usage, so the top of this
            ranking is driven by assumptions. Flip to <em>Published only</em>, overwrite a value with your own usage data, or
            read <Link href="/methodology" className="underline underline-offset-2 hover:text-ink">how the estimates were made</Link>.
          </p>
        </aside>
      )}

      <Controls />

      <section aria-labelledby="leaderboard">
        <SectionHeading id="leaderboard" title="Leaderboard">
          Click any column to sort, any plan to open its vendor page, and any API value to type in your own number (for
          example from your Claude Code or Codex usage dashboard).
        </SectionHeading>
        {rows.length > 0 ? <PlanTable rows={rows} /> : <p className="text-sm text-ink-2">No plans match the current filter.</p>}
      </section>

      <section aria-labelledby="mult-chart" className="card p-4 sm:p-5">
        <SectionHeading id="mult-chart" title="Value multiple: API value ÷ price">
          How many dollars of API list-price usage each dollar of subscription buys. Hatched bars are estimates, solid
          bars are vendor-published. The dashed line is break-even with just paying the API.
        </SectionHeading>
        <BarList rows={bars} ariaLabel="Value multiple by plan" refLine={{ value: 1, label: "1x: same as API" }} />
      </section>

      <section aria-labelledby="scatter" className="card p-4 sm:p-5">
        <SectionHeading id="scatter" title="Price vs API-equivalent value">
          Points above the 1x line get more than they pay for. Log scales on both axes: every step up the diagonals is a
          bigger subsidy.
        </SectionHeading>
        <LogScatter
          points={points}
          xLabel="Monthly price (USD, log scale)"
          yLabel="API-equivalent value (USD/mo, log scale)"
          xTicks={[5, 10, 20, 50, 100, 200, 500]}
          yTicks={[3, 10, 30, 100, 300, 1000, 3000, 10000]}
          xFmt={(n) => "$" + n}
          yFmt={(n) => "$" + (n >= 1000 ? n / 1000 + "k" : n)}
          ratios={[{ k: 1, label: "1x (API price)", strong: true }, { k: 2, label: "2x" }, { k: 5, label: "5x" }, { k: 10, label: "10x" }]}
          legend={[
            { key: "published", label: "Published by the vendor", color: "var(--s-published)" },
            { key: "estimated", label: "Estimated (editorial)", color: "var(--s-estimated)" },
          ]}
          ariaLabel="Scatter plot of monthly plan price against API-equivalent value, with reference lines for 1x, 2x, 5x and 10x"
        />
      </section>

      <section aria-labelledby="vendors">
        <SectionHeading id="vendors" title="Explore by product">
          Each page covers the plan ladder, what the limits really are, the models on offer and how value has moved over time.
        </SectionHeading>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.map((v) => {
            const ps = plansForVendor(v.id);
            const best = rows.filter((r) => r.vendor.id === v.id).sort((a, b) => b.multiple - a.multiple)[0];
            return (
              <Link key={v.id} href={`/vendors/${v.slug}`} className="card group flex flex-col gap-2 p-4 transition-colors hover:border-ink-3">
                <div className="flex items-center gap-2">
                  <VendorDot vendor={v} />
                  <span className="font-medium group-hover:underline">{v.name}</span>
                </div>
                <p className="text-[13px] text-ink-2">{v.tagline}</p>
                <p className="num mt-auto pt-1 text-xs text-ink-3">
                  {ps.length} plan{ps.length === 1 ? "" : "s"} · {usd(Math.min(...ps.map((p) => p.price)))}–{usd(Math.max(...ps.map((p) => p.price)))}/mo
                  {best ? ` · up to ${mult(best.multiple)}` : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="watch" className="card p-4 sm:p-5">
        <SectionHeading id="watch" title="Not scored yet">
          Products worth tracking where I could not verify plan pricing from a readable source.
        </SectionHeading>
        <ul className="grid gap-3 sm:grid-cols-3">
          {watchlist.map((w) => (
            <li key={w.name} className="text-[13px]">
              <a href={w.url} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">{w.name}</a>
              <div className="text-ink-3">{w.model}</div>
              <p className="mt-1 text-ink-2">{w.why}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
