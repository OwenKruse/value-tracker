"use client";

import { BarList } from "./charts/BarList";
import { MiniLine, type LinePoint } from "./charts/MiniLine";
import { useSettings } from "./SettingsProvider";
import { BasisBadge, SectionHeading, vendorColor } from "./ui";
import { history, plansForVendor, snapshots, vendorById } from "@/lib/data";
import { fmtDate, mult, r2, tokensM, usd } from "@/lib/format";
import { computeMetrics } from "@/lib/metrics";

export function VendorPlans({ vendorId }: { vendorId: string }) {
  const { settings } = useSettings();
  const vendor = vendorById(vendorId);
  const rows = computeMetrics({ ...settings, basisFilter: "all" }, plansForVendor(vendorId));

  return (
    <section aria-labelledby="ladder">
      <SectionHeading id="ladder" eyebrow="Plans" title="Plan ladder">
        Values follow your controls on the Overview page ({settings.scenario === "high" ? "full-plan" : settings.scenario === "mid" ? "typical-use" : "light-use"} case).
      </SectionHeading>
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((r) => (
          <article key={r.plan.id} className="card corners flex flex-col gap-3 p-5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{r.plan.name}</h3>
                <p className="num text-sm text-ink-2">{usd(r.plan.price)}/mo</p>
              </div>
              <BasisBadge basis={r.plan.basis} confidence={r.plan.confidence} />
            </header>
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="eyebrow">API value</dt>
                <dd className="num font-medium">{usd(r.apiValue)}</dd>
              </div>
              <div>
                <dt className="eyebrow">Value ×</dt>
                <dd className="num font-medium">{mult(r.multiple)}</dd>
              </div>
              <div>
                <dt className="eyebrow">Output tok/mo</dt>
                <dd className="num font-medium">{tokensM(r.outputTokensM)}</dd>
              </div>
            </dl>
            <div aria-hidden className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full" style={{ width: `${r2(Math.min(100, (r.multiple / 12) * 100))}%`, background: vendorColor(vendor) }} />
            </div>
            <p className="text-[13px] text-ink-2">{r.plan.limits}</p>
            <p className="text-xs text-ink-3">{r.plan.note}</p>
            <p className="mt-auto text-xs text-ink-3">
              Best model: {r.topModel ? `${r.topModel.name} (AA ${r.intel})` : "varies / not scored"} ·{" "}
              <a href={r.plan.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">source</a>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function VendorHistory({ vendorId }: { vendorId: string }) {
  const vendor = vendorById(vendorId);
  const plans = plansForVendor(vendorId);
  const events = history.events.filter((e) => e.vendorId === vendorId);
  const refPoints = history.valueHistory.filter((v) => plans.some((p) => p.id === v.planId));
  const ledger = snapshots;

  const apiGen = history.generations; // only Anthropic has generation data
  const showGen = vendorId === "anthropic";

  return (
    <section aria-labelledby="time" className="flex flex-col gap-6">
      <SectionHeading id="time" eyebrow="History" title="Value over time">
        Dated reference points, a snapshot ledger you extend with <code className="rounded bg-surface-2 px-1 text-[12px]">npm run snapshot</code>, and the plan changes that moved the numbers.
      </SectionHeading>

      {refPoints.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {refPoints.map((v) => {
            const plan = plans.find((p) => p.id === v.planId)!;
            const pts: LinePoint[] = v.points.map((p) => ({
              t: Date.parse(p.date + "T00:00:00Z"),
              y: p.apiValue / p.price,
              label: `${fmtDate(p.date)}: ${usd(p.apiValue)} for ${usd(p.price)}`,
              detail: `${p.note} (${p.provenance})`,
            }));
            return (
              <figure key={v.planId} className="card p-4">
                <figcaption className="mb-2 text-sm font-medium">{plan.name}: value multiple</figcaption>
                <MiniLine
                  points={pts}
                  yFmt={(n) => n.toFixed(1) + "x"}
                  yLabel="API value ÷ price"
                  color={vendorColor(vendor)}
                  ariaLabel={`${plan.name} value multiple over time`}
                />
              </figure>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.slice(0, 4).map((p) => {
          const pts: LinePoint[] = ledger
            .filter((s) => s.plans[p.id])
            .map((s) => ({
              t: Date.parse(s.date + "T00:00:00Z"),
              y: s.plans[p.id].high / s.plans[p.id].price,
              label: fmtDate(s.date),
              detail: `${usd(s.plans[p.id].high)} value for ${usd(s.plans[p.id].price)}`,
            }));
          return (
            <figure key={p.id} className="card p-4">
              <figcaption className="mb-2 text-sm font-medium">{p.name}: snapshot ledger (full-plan case)</figcaption>
              <MiniLine points={pts} yFmt={(n) => n.toFixed(1) + "x"} yLabel="API value ÷ price" color={vendorColor(vendor)} ariaLabel={`${p.name} value multiple per snapshot`} />
              {pts.length < 2 && <p className="mt-1 text-xs text-ink-3">One snapshot so far. Each <code>npm run snapshot</code> adds a point.</p>}
            </figure>
          );
        })}
      </div>

      {showGen && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">What a fixed agentic workload costs at list price, by model generation</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {apiGen.map((g) => (
              <figure key={g.family} className="card p-4">
                <figcaption className="mb-3 text-sm font-medium">{g.family}: $ per 1M output tokens (all-in)</figcaption>
                <BarList
                  ariaLabel={`${g.family} reference workload cost by generation`}
                  rows={g.steps.map((s) => {
                    const cost = s.output + 40 * s.cacheRead + 2 * s.cacheWrite + 4 * s.input;
                    return { id: s.label, label: s.label, sublabel: s.when, value: cost, valueLabel: usd(cost), color: vendorColor(vendor) };
                  })}
                />
              </figure>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-3">
            Falling API prices cut the cost of a fixed amount of work. If a plan&apos;s token allowance stayed flat, the dollar value of that allowance at list price fell with it; vendors do not disclose whether allowances changed.
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold">Timeline</h3>
        {events.length === 0 ? (
          <p className="text-sm text-ink-2">No dated events logged yet.</p>
        ) : (
          <ol className="flex flex-col gap-2 border-l border-line pl-4">
            {events.map((e) => (
              <li key={e.title} className="relative text-sm">
                <span aria-hidden className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full" style={{ background: vendorColor(vendor) }} />
                <div className="num text-xs text-ink-3">
                  {fmtDate(e.date, e.precision)} · {e.provenance}{e.upcoming ? " · upcoming" : ""}
                </div>
                <div className="font-medium">{e.title}</div>
                {e.detail && <div className="text-ink-2">{e.detail}</div>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
