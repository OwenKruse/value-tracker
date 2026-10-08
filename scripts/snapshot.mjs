// Appends today's plan prices and API-value ranges to src/data/snapshots.json.
// Run after editing src/data/plans.json:  npm run snapshot
// The Value Over Time page plots this ledger, so each run adds a data point.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const plansPath = new URL("../src/data/plans.json", import.meta.url);
const outPath = new URL("../src/data/snapshots.json", import.meta.url);
const { asOf, plans } = JSON.parse(readFileSync(plansPath, "utf8"));
const date = process.argv[2] ?? asOf;

const ledger = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : [];
const entry = {
  date,
  plans: Object.fromEntries(
    plans.map((p) => [p.id, { price: p.price, low: p.apiValue.low, mid: p.apiValue.mid, high: p.apiValue.high }]),
  ),
};
const i = ledger.findIndex((s) => s.date === date);
if (i >= 0) ledger[i] = entry; else ledger.push(entry);
ledger.sort((a, b) => a.date.localeCompare(b.date));
writeFileSync(outPath, JSON.stringify(ledger, null, 2) + "\n");
console.log(`Snapshot ${date}: ${plans.length} plans, ${ledger.length} total snapshot(s).`);
