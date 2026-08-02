// All amounts are whole UZS integers.

const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** 1500000 -> "1 500 000 so'm" */
export function formatUZS(amount: number): string {
  return `${fmt.format(Math.round(amount))} so'm`;
}

/** 1500000 -> "1 500 000" (no suffix) */
export function formatNumber(amount: number): string {
  return fmt.format(Math.round(amount));
}

/** Parse user input like "1 500 000", "1,500,000", "1500000" -> 1500000 */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[\s,]/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}
