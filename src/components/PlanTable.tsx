"use client";

import Link from "next/link";
import { useState } from "react";
import { useSettings } from "./SettingsProvider";
import { VendorDot } from "./ui";
import { mult, r2, tokensM, usd } from "@/lib/format";
import type { PlanMetrics } from "@/lib/types";

type SortKey = "score" | "price" | "apiValue" | "multiple" | "outputTokensM" | "costPerMOut" | "intel";

const COLS: { key: SortKey; label: string; hint: string; align?: "right" }[] = [
  { key: "price", label: "Price/mo", hint: "Month-to-month list price in USD", align: "right" },
  { key: "apiValue", label: "API value", hint: "Dollar value of included usage at API list prices. Click a value to enter your own.", align: "right" },
  { key: "multiple", label: "Value ×", hint: "API value ÷ price. 1.0x means no subsidy.", align: "right" },
  { key: "outputTokensM", label: "Output tok/mo", hint: "Output tokens that dollar value buys on the plan's best model (shown under the plan name), including the cached context re-read", align: "right" },
  { key: "costPerMOut", label: "$ / 1M out", hint: "Effective plan cost per 1M output tokens on the plan's best model", align: "right" },
  { key: "intel", label: "Intel", hint: "Artificial Analysis Intelligence Index of the best model on the plan", align: "right" },
  { key: "score", label: "Score", hint: "Weighted composite, 0 to 100", align: "right" },
];

function ValueCell({ row }: { row: PlanMetrics }) {
  const { settings, setOverride } = useSettings();
  // null while not editing: show the computed value; a string while the user types
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(Math.round(row.apiValue * 100) / 100);

  const commit = () => {
    const text = draft ?? "";
    setDraft(null);
    const n = Number(text);
    if (text.trim() === "" || !isFinite(n) || n < 0) {
      setOverride(row.plan.id, null);
      return;
    }
    if (!row.overridden && Math.abs(n - row.plan.apiValue[settings.scenario]) < 0.005) return;
    setOverride(row.plan.id, n);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <span className="text-ink-3">$</span>
      <input
        aria-label={`API-equivalent value per month for ${row.plan.name}`}
        inputMode="decimal"
        value={shown}
        onFocus={() => setDraft(shown)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(null);
            setOverride(row.plan.id, null);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={`num w-16 rounded border bg-transparent px-1 py-0.5 text-right ${
          row.overridden ? "border-accent font-medium text-ink" : "border-transparent hover:border-line"
        }`}
      />
      {row.overridden && (
        <button
          type="button"
          aria-label={`Reset ${row.plan.name} to the default value`}
          onClick={() => setOverride(row.plan.id, null)}
          className="text-xs text-accent-ink underline"
          title="Reset to default"
        >
          reset
        </button>
      )}
    </div>
  );
}

export function PlanTable({ rows }: { rows: PlanMetrics[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "score", dir: -1 });

  const sorted = [...rows].sort((a, b) => {
    const get = (r: PlanMetrics) => (sort.key === "price" ? r.plan.price : (r[sort.key] as number | null));
    const av = get(a), bv = get(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return (av - bv) * sort.dir;
  });

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: key === "price" || key === "costPerMOut" ? 1 : -1 }));

  return (
    <div className="card corners overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <caption className="sr-only">AI coding plans ranked by composite value score. Column headers sort the table.</caption>
        <thead>
          <tr className="eyebrow border-b border-line bg-surface-2/50 text-left">
            <th scope="col" className="sticky left-0 z-10 bg-surface-2 px-3 py-3 font-normal">Plan</th>
            {COLS.map((c) => {
              const on = sort.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                  className={`px-3 py-3 font-normal ${c.align === "right" ? "text-right" : ""}`}
                >
                  <button type="button" onClick={() => toggle(c.key)} title={c.hint} className="inline-flex items-center gap-1 hover:text-ink">
                    {c.label}
                    <span aria-hidden className={on ? "text-ink" : "opacity-30"}>{on ? (sort.dir === 1 ? "↑" : "↓") : "↕"}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.plan.id} className="border-b border-line last:border-0 hover:bg-surface-2/60">
              <th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-left font-normal">
                <Link href={`/vendors/${r.vendor.slug}`} className="group flex items-center gap-2">
                  <VendorDot vendor={r.vendor} />
                  <span>
                    <span className="block font-medium text-ink group-hover:underline">{r.plan.name}</span>
                    <span className="block text-[11px] text-ink-3">
                      {r.topModel ? r.topModel.name : "model menu varies"}
                      {r.tokenModelAssumed && <span title="This plan's best model has no known API price, so tokens are priced as if on Claude Sonnet 5.5"> · tokens at {r.tokenModel.name} (assumed)</span>}
                    </span>
                  </span>
                </Link>
              </th>
              <td className="num px-3 py-2.5 text-right">{usd(r.plan.price)}</td>
              <td className="px-3 py-1.5"><ValueCell row={r} /></td>
              <td className="num px-3 py-2.5 text-right font-medium">{mult(r.multiple)}</td>
              <td className="num px-3 py-2.5 text-right">{tokensM(r.outputTokensM)}</td>
              <td className="num px-3 py-2.5 text-right">{usd(r.costPerMOut)}</td>
              <td className="num px-3 py-2.5 text-right">{r.intel ?? <span className="text-ink-3" title="Best model on this plan is not on the Artificial Analysis leaderboard">n/a</span>}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <div aria-hidden className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${r2(r.score)}%`, background: "var(--accent)" }} />
                  </div>
                  <span className="num w-7 text-right font-medium">{r.score.toFixed(0)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
