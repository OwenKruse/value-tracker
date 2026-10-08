# Value Tracker

Compares AI coding subscriptions (Claude, ChatGPT/Codex, Cursor, GitHub Copilot, Devin/Windsurf, Kiro, Zed, Google Antigravity) by
how much API-equivalent usage each plan buys per dollar, how many output tokens that is, and how smart the models are.

- `/` single-page dashboard: leaderboard, value-multiple chart, price vs API-value scatter, vendor cards
- `/vendors/[slug]` per-product plan ladder, limits, strengths/caveats, value-over-time and timeline
- `/models` intelligence vs cost per task (Artificial Analysis data) and a sortable model table
- `/value-over-time` dated before/after subsidies, snapshot ledger, API price by Claude generation, plan-change timeline
- `/methodology` exactly what is published, derived or estimated

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Data

All data is JSON in `src/data/`, as of 2026-10-08:

| File | Contents |
| --- | --- |
| `plans.json` | price, API-value range (low/mid/high), `basis` (`published` or `estimated`), confidence, best model |
| `models.json` | API prices per 1M tokens and Artificial Analysis intelligence index |
| `vendors.json` | descriptions, strengths, caveats, sources |
| `history.json` | dated events, before/after reference points, API prices by model generation |
| `aa-leaderboard.json` | Artificial Analysis leaderboard rows |
| `snapshots.json` | ledger written by `npm run snapshot` |

Plans marked `estimated` are editorial estimates because the vendor does not publish the dollar value of included usage. Users can
overwrite any plan's API value in the leaderboard (stored in browser localStorage). After editing `plans.json`, run:

```bash
npm run snapshot   # appends today's prices and value ranges to src/data/snapshots.json
```
