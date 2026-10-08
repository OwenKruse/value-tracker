import modelsJson from "@/data/models.json";
import plansJson from "@/data/plans.json";
import vendorsJson from "@/data/vendors.json";
import historyJson from "@/data/history.json";
import aaJson from "@/data/aa-leaderboard.json";
import snapshotsJson from "@/data/snapshots.json";
import type { AaRow, HistoryEvent, Model, Plan, Snapshot, ValuePoint, Vendor } from "./types";

export const AS_OF = plansJson.asOf;
export const models = modelsJson.models as Model[];
export const plans = plansJson.plans as Plan[];
export const watchlist = plansJson.watchlist;
export const vendors = vendorsJson.vendors as Vendor[];
export const aaLeaderboard = aaJson as AaRow[];
export const snapshots = snapshotsJson as Snapshot[];

export const history = historyJson as unknown as {
  disclaimer: string;
  events: HistoryEvent[];
  valueHistory: { planId: string; points: ValuePoint[] }[];
  generations: {
    family: string;
    steps: { label: string; input: number; output: number; cacheRead: number; cacheWrite: number; when: string }[];
  }[];
};

export const modelById = (id: string | null) => models.find((m) => m.id === id) ?? null;
export const vendorById = (id: string) => vendors.find((v) => v.id === id)!;
export const vendorBySlug = (slug: string) => vendors.find((v) => v.slug === slug) ?? null;
export const plansForVendor = (vendorId: string) => plans.filter((p) => p.vendorId === vendorId);
