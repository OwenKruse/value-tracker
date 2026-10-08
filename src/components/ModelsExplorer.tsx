"use client";

import { useMemo, useState } from "react";
import { LogScatter, type ScatterPoint } from "./charts/LogScatter";
import { Segmented, SectionHeading, Stat } from "./ui";
import { aaLeaderboard, models } from "@/lib/data";
import { allInCostPerMOut } from "@/lib/metrics";
import { usd } from "@/lib/format";

const baseName = (n: string) => n.replace(/\s*\(.*\)$/, "");
type Row = (typeof aaLeaderboard)[number] & { base: string; tracked: boolean; allIn: number | null };

export function ModelsExplorer() {
  const [view, setView] = useState<"best" | "all">("best");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: "index" | "costPerTask" | "tokensPerSec" | "allIn"; dir: 1 | -1 }>({ key: "index", dir: -1 });

  const rows: Row[] = useMemo(() => {
    const all = aaLeaderboard.map((r) => {
      const m = models.find((m) => r.name.startsWith(m.name) && r.index === m.aaIndex);
      return { ...r, base: baseName(r.name), tracked: !!m, allIn: m ? allInCostPerMOut(m) : null };
    });
    if (view === "all") return all;
    const best = new Map<string, Row>();
    for (const r of all) {
      const cur = best.get(r.base);
      if (!cur || r.index > cur.index || (r.index === cur.index && (r.costPerTask ?? 1e9) < (cur.costPerTask ?? 1e9))) best.set(r.base, r);
    }
    return [...best.values()];
  }, [view]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const f = rows.filter((r) => !needle || r.name.toLowerCase().includes(needle) || r.creator.toLowerCase().includes(needle));
    return f.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return ((av as number) - (bv as number)) * sort.dir;
    });
  }, [rows, q, sort]);

  const points: ScatterPoint[] = rows
    .filter((r) => r.costPerTask != null && r.costPerTask > 0 && r.index >= 25)
    .map((r) => ({
      id: r.name,
      label: view === "best" ? r.base : r.name,
      x: r.costPerTask!,
      y: r.index,
      series: r.tracked ? "tracked" : "other",
      labelled: view === "best" && (r.tracked || r.index >= 46),
      tooltip: [`Intelligence ${r.index}`, `${usd(r.costPerTask!)} per task`, r.creator],
    }));

  const opus = models.find((m) => m.id === "opus-5.5")!;
  const sol = models.find((m) => m.id === "gpt-6.1-sol")!;

  const head = (key: typeof sort.key, label: string) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className="px-3 py-2.5 text-right font-medium">
      <button type="button" className="hover:text-ink" onClick={() => setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === "index" || key === "tokensPerSec" ? -1 : 1 }))}>
        {label} {sort.key === key ? (sort.dir === 1 ? "↑" : "↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Top intelligence" value={`${opus.aaIndex}`} sub={`${opus.name}, ${usd(opus.aaCostPerTask!)}/task`} />
        <Stat label="Best near-top value" value={`${sol.aaIndex}`} sub={`${sol.name}, ${usd(sol.aaCostPerTask!)}/task`} />
        <Stat label="Cost per task ratio" value={`${(opus.aaCostPerTask! / sol.aaCostPerTask!).toFixed(1)}x`} sub="Opus 5.5 vs GPT-6.1 Sol, for 58 vs 52 on the index" />
      </section>

      <section className="card p-4 sm:p-5" aria-labelledby="scatter">
        <SectionHeading id="scatter" title="Intelligence vs cost per task">
          Artificial Analysis Intelligence Index against what it costs to run their benchmark suite on that model. Up and to the left is better.
        </SectionHeading>
        <div className="mb-3">
          <Segmented
            label="Effort levels"
            value={view}
            onChange={setView}
            options={[
              { value: "best", label: "Best setting per model" },
              { value: "all", label: "Every effort level" },
            ]}
          />
        </div>
        <LogScatter
          points={points}
          xLabel="Cost per task (USD, log scale)"
          yLabel="Intelligence Index"
          xTicks={[0.01, 0.03, 0.1, 0.3, 1, 3, 10]}
          yTicks={[25, 30, 35, 40, 45, 50, 55, 60]}
          yScale="linear"
          xFmt={(n) => "$" + n}
          yFmt={(n) => String(n)}
          legend={[
            { key: "tracked", label: "Priced and tracked here", color: "var(--s-published)" },
            { key: "other", label: "Other models", color: "var(--ink-3)" },
          ]}
          ariaLabel="Scatter plot of Artificial Analysis intelligence index against cost per task for current models"
        />
      </section>

      <section aria-labelledby="table">
        <SectionHeading id="table" title="Leaderboard data">
          Source: Artificial Analysis LLM leaderboard, fetched 2026-10-08. &quot;All-in $/1M out&quot; is this site&apos;s reference agentic workload priced at the model&apos;s list prices (see Methodology); shown only where list prices are known.
        </SectionHeading>
        <label className="mb-2 block">
          <span className="sr-only">Filter models</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by model or lab"
            className="w-full max-w-xs rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
        </label>
        <div className="card max-h-[560px] overflow-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Model intelligence, cost and speed</caption>
            <thead className="sticky top-0 bg-surface text-xs text-ink-3">
              <tr className="border-b border-line">
                <th scope="col" className="px-3 py-2.5 text-left font-medium">Model</th>
                <th scope="col" className="px-3 py-2.5 text-left font-medium">Lab</th>
                {head("index", "Intelligence")}
                {head("costPerTask", "Cost / task")}
                {head("tokensPerSec", "Tokens/s")}
                {head("allIn", "All-in $/1M out")}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.name} className="border-b border-line last:border-0 hover:bg-surface-2/60">
                  <th scope="row" className="px-3 py-2 text-left font-normal">{r.name}</th>
                  <td className="px-3 py-2 text-ink-2">{r.creator}</td>
                  <td className="num px-3 py-2 text-right font-medium">{r.index}</td>
                  <td className="num px-3 py-2 text-right">{r.costPerTask != null ? usd(r.costPerTask) : "n/a"}</td>
                  <td className="num px-3 py-2 text-right">{r.tokensPerSec ?? "n/a"}</td>
                  <td className="num px-3 py-2 text-right">{r.allIn != null ? usd(r.allIn) : "n/a"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
