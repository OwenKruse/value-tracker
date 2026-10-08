export function usd(n: number): string {
  if (!isFinite(n)) return "n/a";
  const whole = Math.abs(n) >= 100 || Number.isInteger(n);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
}

export function mult(n: number): string {
  return (n >= 10 ? n.toFixed(0) : n.toFixed(1)) + "x";
}

/** Millions of tokens, humanised. */
export function tokensM(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "B";
  if (n >= 100) return n.toFixed(0) + "M";
  if (n >= 10) return n.toFixed(1) + "M";
  if (n >= 1) return n.toFixed(1) + "M";
  return (n * 1000).toFixed(0) + "K";
}

export function pct(n: number): string {
  const s = n >= 0 ? "+" : "";
  return s + n.toFixed(0) + "%";
}

export function fmtDate(date: string, precision: "day" | "year" = "day"): string {
  if (precision === "year") return date;
  const [y, m, d] = date.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

/** Round geometry so server and client floating-point output serialises identically. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;
