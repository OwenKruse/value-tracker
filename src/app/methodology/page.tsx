import type { Metadata } from "next";
import { AS_OF, models, plans } from "@/lib/data";
import { fmtDate, usd } from "@/lib/format";
import { WORKLOAD, allInCostPerMOut } from "@/lib/metrics";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How API-equivalent value, output tokens and the composite score are calculated, and what is estimated.",
};

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[12.5px]">{children}</code>
);

export default function MethodologyPage() {
  const published = plans.filter((p) => p.basis === "published");
  const estimated = plans.filter((p) => p.basis === "estimated");
  const sample = ["opus-5.5", "sonnet-5.5", "gpt-6.1-sol", "gpt-6-astra", "haiku-5.5"].map((id) => models.find((m) => m.id === id)!);

  return (
    <article className="prose-sm mx-auto flex max-w-3xl flex-col gap-8 text-[15px] leading-relaxed text-ink-2">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Methodology</h1>
        <p className="mt-2">
          Data as of {fmtDate(AS_OF)}. This page is the honest version of the numbers: what is read from a vendor page, what is
          derived, and what is my estimate.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">1. API-equivalent value</h2>
        <p>
          For each plan: the dollar value of the usage it includes if you had bought the same usage through the API at list
          price. <strong className="text-ink">Value ×</strong> is that figure divided by the monthly price, so 1.0x means no
          subsidy and 5x means each subscription dollar buys five dollars of API usage.
        </p>
        <p>
          It is an upper bound on what you can extract: you only realise it if you use the full allowance every cycle.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">2. Published vs estimated</h2>
        <p>
          <strong className="text-ink">Published ({published.length} plans).</strong> The vendor states the allotment in
          dollars or in credits with a dollar price: GitHub Copilot (AI Credits at $0.01), Kiro (credits at the $0.04 add-on
          rate) and Zed ($5 of tokens at list +10%). Kiro&apos;s credit-to-token mapping is not public, so its 2x is measured at
          Kiro&apos;s own retail credit price, not at provider API cost.
        </p>
        <p>
          <strong className="text-ink">Estimated ({estimated.length} plans).</strong> Anthropic, OpenAI, Cognition and Google publish
          limits as multiples, message ranges or &quot;higher limits&quot;, not dollars. Cursor publishes pools but not the
          per-tier dollar amount on the page I could read. For these I give a low / typical / full-plan range. The default is the full-plan end, which assumes you use your whole allowance every cycle. They are my
          editorial estimates, built from each vendor&apos;s stated ratios (for example Max 5x and 20x against Pro, or Plus
          message ranges) and typical agentic task sizes. I did not have access to measured usage logs, so treat them as
          orders of magnitude, not facts.
        </p>
        <p>
          The estimated plans are marked with an orange dot and a dashed badge in every table and chart. You can overwrite any
          plan&apos;s API value in the leaderboard with your own measurement (for instance from <Code>ccusage</Code> or the Codex
          usage dashboard); it is stored in your browser only. Switch to <em>Published only</em> to rank on vendor-stated
          numbers alone.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">3. Output tokens per month</h2>
        <p>
          Agentic coding re-reads context on every turn, so a bare output-token price understates the real bill. I convert dollars
          to tokens with a fixed reference workload. For every 1M output tokens it assumes {WORKLOAD.cacheReadPerOut}M cache-read
          input tokens, {WORKLOAD.cacheWritePerOut}M cache-write tokens and {WORKLOAD.freshInputPerOut}M uncached input tokens.
        </p>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <caption className="sr-only">All-in cost per 1M output tokens for sample models</caption>
            <thead className="text-xs text-ink-3">
              <tr className="border-b border-line">
                <th scope="col" className="px-3 py-2 text-left font-medium">Model</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Out $/M</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">All-in $/M out</th>
              </tr>
            </thead>
            <tbody>
              {sample.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-3 py-2 text-left font-normal text-ink">{m.name}</th>
                  <td className="num px-3 py-2 text-right">{usd(m.output!)}</td>
                  <td className="num px-3 py-2 text-right text-ink">{usd(allInCostPerMOut(m)!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Output tokens per month = API value ÷ all-in cost per 1M output tokens of the reference model you pick on the
          Overview. The ratio is a workload assumption, not a measurement; change it in <Code>src/lib/metrics.ts</Code>.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">4. Intelligence</h2>
        <p>
          The Artificial Analysis Intelligence Index of the best-scoring model you can reach on the plan, taking each model at its
          highest-scoring effort setting. Plans whose top model is not on the leaderboard (for example Kiro, which lists Claude
          Opus 5 but not Opus 5.5) show n/a, and the composite score re-weights over the metrics that exist. Cost per task is
          Artificial Analysis&apos;s own figure for running their suite.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">5. Composite score (0 to 100)</h2>
        <p>
          A weighted average of three normalised parts, with weights you control on the Overview: <em>Subsidy</em> (Value ×,
          log scale from 0.4x to 12x), <em>Intelligence</em> (linear from index 30 to 58) and <em>Capacity</em> (output tokens
          per month, log scale from 0.1M to 100M). Anchors are fixed so a plan&apos;s score does not change when you filter
          the table. Capacity deliberately rewards bigger plans, to balance Subsidy rewarding small, tightly capped ones.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">6. Value over time</h2>
        <p>
          Three kinds of evidence, each labelled with where it comes from. <em>Fetched</em> entries were read from vendor pages
          for this build. <em>Recalled</em> entries (older launches, price changes) come from vendor announcements and press
          coverage and were not re-verified. <em>Snapshots</em> are written by <Code>npm run snapshot</Code> and are the only
          way the chart gains new data points, so the history starts the day you first run it.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">7. What this does not capture</h2>
        <ul className="list-disc pl-5">
          <li>Latency, reliability, editor quality and agent harness differences. A 10x-subsidised plan with a worse agent can still lose.</li>
          <li>Bundled extras: Google AI storage, Claude chat features, Copilot code completions and similar.</li>
          <li>Rate-limit changes. Vendors can tighten limits without notice; check the dated provenance before committing to an annual plan.</li>
          <li>Annual discounts (for example Claude Pro at $17/mo). All prices here are month-to-month list prices.</li>
          <li>Plans I could not read: see &quot;Not scored yet&quot; on the Overview.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">Updating the data</h2>
        <p>
          Everything lives in <Code>src/data/*.json</Code>: <Code>plans.json</Code> (prices and API value ranges),{" "}
          <Code>models.json</Code> (API prices and intelligence), <Code>history.json</Code> (events), and{" "}
          <Code>aa-leaderboard.json</Code>. After editing, run <Code>npm run snapshot</Code> to log a ledger point.
        </p>
      </section>
    </article>
  );
}
