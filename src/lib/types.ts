export type Basis = "published" | "estimated";
export type Confidence = "high" | "medium" | "low";
export type Scenario = "low" | "mid" | "high";

export interface Model {
  id: string;
  name: string;
  creator: string;
  input: number | null;
  output: number | null;
  cacheRead: number | null;
  cacheWrite: number | null;
  aaIndex: number | null;
  aaConfig: string | null;
  aaCostPerTask: number | null;
  tokensPerSec: number | null;
}

export interface Plan {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  apiValue: { low: number; mid: number; high: number };
  basis: Basis;
  confidence: Confidence;
  topModelId: string | null;
  limits: string;
  note: string;
  sourceUrl: string;
}

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  company: string;
  colorSlot: number;
  tagline: string;
  summary: string;
  strengths: string[];
  caveats: string[];
  pricingUrl: string;
  sources: { label: string; url: string }[];
}

export interface Weights {
  value: number;
  intel: number;
  capacity: number;
}

export interface Settings {
  scenario: Scenario;
  refModelId: string;
  basisFilter: "all" | "published";
  weights: Weights;
  overrides: Record<string, number>;
}

export interface PlanMetrics {
  plan: Plan;
  vendor: Vendor;
  apiValue: number;
  overridden: boolean;
  multiple: number;
  subsidyPct: number;
  outputTokensM: number;
  costPerMOut: number;
  intel: number | null;
  topModel: Model | null;
  score: number;
}

export interface AaRow {
  name: string;
  creator: string;
  context: string;
  index: number;
  costPerTask: number | null;
  tokensPerSec: number | null;
}

export interface HistoryEvent {
  date: string;
  precision: "day" | "year";
  vendorId: string;
  title: string;
  detail: string;
  provenance: "fetched" | "recalled" | "estimated";
  upcoming?: boolean;
}

export interface ValuePoint {
  date: string;
  price: number;
  apiValue: number;
  note: string;
  provenance: "fetched" | "recalled" | "estimated";
}

export interface Snapshot {
  date: string;
  plans: Record<string, { price: number; low: number; mid: number; high: number }>;
}
