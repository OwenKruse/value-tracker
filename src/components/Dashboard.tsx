"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarList, type BarRow } from "./charts/BarList";
import { ColumnChart, type ColumnRow } from "./charts/ColumnChart";
import { LogScatter, type ScatterPoint } from "./charts/LogScatter";
import { Controls } from "./Controls";
import { PlanTable } from "./PlanTable";
import { useSettings } from "./SettingsProvider";
import { SectionHeading, Stat, VendorDot, vendorColor } from "./ui";
import { AS_OF, plansForVendor, vendors, watchlist } from "@/lib/data";
import { mult, tokensM, usd } from "@/lib/format";
import { computeMetrics } from "@/lib/metrics";

export function Dashboard() {
  const { settings } = useSettings();
  const rows = useMemo(() => computeMetrics(settings), [settings]);

  const byMultiple = useMemo(() => [...rows].sort((a, b) => b.multiple - a.multiple), [rows]);
  const byTokens = useMemo(() => [...rows].sort((a, b) => b.outputTokensM - a.outputTokensM), [rows]);
  const byScore = useMemo(() => [...rows].sort((a, b) => b.score - a.score), [rows]);
  const bySmart = useMemo(
    () => [...rows].filter((r) => r.intel != null).sort((a, b) => (b.intel! - a.intel!) || a.plan.price - b.plan.price),
    [rows],
  );

  const tag = (r: (typeof rows)[number]) => (r.plan.basis === "estimated" && !r.overridden ? " · estimate" : "");

  const scoreCols: ColumnRow[] = byScore.map((r) => ({
    id: r.plan.id,
    label: r.plan.name,
    value: r.score,
    valueLabel: r.score.toFixed(0),
    color: vendorColor(r.vendor),
    icon: <VendorDot vendor={r.vendor} size={16} />,
    hatched: r.plan.basis === "estimated",
    tooltip: [
      `Score ${r.score.toFixed(0)} of 100`,
      `${usd(r.plan.price)}/mo · ${mult(r.multiple)} value`,
      `${tokensM(r.outputTokensM)} output tok/mo`,
      r.intel != null ? `Best model: ${r.topModel?.name} (${r.intel})` : "Best-model intelligence n/a",
    ],
  }));

  const bars: BarRow[] = byMultiple.map((r) => ({
    id: r.plan.id,
    label: r.plan.name,
    sublabel: `${usd(r.plan.price)}/mo → ${usd(r.apiValue)} API value`,
    value: r.multiple,
    valueLabel: mult(r.multiple),
    color: vendorColor(r.vendor),
    icon: <VendorDot vendor={r.vendor} size={16} />,
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
    <div className="flex flex-col gap-14">
      <section className="flex flex-col items-center gap-6 pt-6 text-center sm:pt-12">
        <div className="eyebrow corners px-4 py-2">AI coding plans · {AS_OF}</div>
        <h1 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
          What does each AI coding plan really give you?
        </h1>
        <p className="max-w-xl font-mono text-[13px] leading-relaxed text-ink-2 sm:text-sm">
          Flat-rate plans are often subsidised. We convert every plan into API-equivalent dollars, output tokens and a
          single score, next to the intelligence of the models you can actually use.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="#leaderboard" className="btn btn-primary">
            <span aria-hidden className="btn-icon">»</span>
            See the leaderboard
          </a>
          <Link href="/methodology" className="btn btn-secondary corners">
            How it works
          </Link>
        </div>
      </section>

      <section aria-labelledby="products" className="corners rounded-lg border border-line bg-surface-2/60 p-4 sm:p-8">
        <h2 id="products" className="eyebrow mb-5 text-center">[ Products we track ]</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {vendors.map((v) => {
            const ps = plansForVendor(v.id);
            const best = rows.filter((r) => r.vendor.id === v.id).sort((a, b) => b.multiple - a.multiple)[0];
            return (
              <li key={v.id}>
                <Link
                  href={`/vendors/${v.slug}`}
                  className="corners group flex h-full flex-col items-start gap-3 rounded-md border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.25)]"
                >
                  <VendorDot vendor={v} size={26} />
                  <div>
                    <div className="font-mono text-[12px] font-medium uppercase tracking-wide">{v.name}</div>
                    <div className="num mt-1 font-mono text-[11px] text-ink-3">
                      {ps.length} plan{ps.length === 1 ? "" : "s"} · {Math.min(...ps.map((p) => p.price)) === Math.max(...ps.map((p) => p.price)) ? usd(ps[0].price) : `${usd(Math.min(...ps.map((p) => p.price)))}–${usd(Math.max(...ps.map((p) => p.price)))}`}
                      {best ? ` · ≤${mult(best.multiple)}` : ""}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {rows.length > 0 && (
        <section aria-label="Highlights" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Biggest subsidy" value={mult(byMultiple[0].multiple)} sub={`${byMultiple[0].plan.name} · ${usd(byMultiple[0].plan.price)}/mo${tag(byMultiple[0])}`} />
          <Stat label="Most output tokens" value={`${tokensM(byTokens[0].outputTokensM)}/mo`} sub={`${byTokens[0].plan.name} on ${byTokens[0].tokenModel.name}${byTokens[0].tokenModelAssumed ? " (assumed)" : ""}${tag(byTokens[0])}`} />
          <Stat label="Smartest model access" value={bySmart[0] ? String(bySmart[0].intel) : "n/a"} sub={bySmart[0] ? `${bySmart[0].topModel?.name} · cheapest: ${bySmart[0].plan.name}` : ""} />
          <Stat label="Best composite" value={byScore[0].score.toFixed(0)} sub={`${byScore[0].plan.name} · ${usd(byScore[0].plan.price)}/mo${tag(byScore[0])}`} />
        </section>
      )}

      <Controls />

      <section aria-labelledby="leaderboard">
        <SectionHeading id="leaderboard" eyebrow="Leaderboard" title="Plans ranked by value">
          Click any column to sort and any plan to open its vendor page. To use your own usage numbers, open Filters.
        </SectionHeading>
        {rows.length > 0 ? <PlanTable rows={rows} /> : <p className="text-sm text-ink-2">No plans match the current filter.</p>}
      </section>

      <section aria-labelledby="score-chart" className="card p-4 sm:p-6">
        <SectionHeading id="score-chart" eyebrow="Score" title="Composite score by plan">
          Each plan&apos;s 0 to 100 score blends subsidy, intelligence and capacity using the weights in Filters. Hatched
          columns are estimates, solid columns are vendor-published.
        </SectionHeading>
        <ColumnChart rows={scoreCols} ariaLabel="Composite score by plan, highest first" />
      </section>

      <section aria-labelledby="mult-chart" className="card p-4 sm:p-6">
        <SectionHeading id="mult-chart" eyebrow="Subsidy" title="Value multiple: API value ÷ price">
          How many dollars of API list-price usage each dollar of subscription buys. Hatched bars are estimates, solid
          bars are vendor-published. The dashed line is break-even with just paying the API.
        </SectionHeading>
        <BarList rows={bars} ariaLabel="Value multiple by plan" refLine={{ value: 1, label: "1x: same as API" }} />
      </section>

      <section aria-labelledby="scatter" className="card p-4 sm:p-6">
        <SectionHeading id="scatter" eyebrow="Price vs value" title="Price vs API-equivalent value">
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

      <section aria-labelledby="watch" className="card p-4 sm:p-6">
        <SectionHeading id="watch" eyebrow="Watchlist" title="Not scored yet">
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
