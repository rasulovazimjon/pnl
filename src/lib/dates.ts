// Month helpers. A "month key" is "YYYY-MM". Month boundaries are computed in UTC
// so they are stable regardless of server timezone.

export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthStart(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
}

export function monthEnd(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1, 0, 0, 0, 0)); // first instant of next month
}

export function currentMonthKey(): string {
  return monthKey(new Date());
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return monthKey(d);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/** Format a Date as YYYY-MM-DD (UTC) for <input type="date"> */
export function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}
