"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber, parseAmount } from "@/lib/money";
import type { Category, RecurringRule, CategoryType } from "@/lib/types";

const TYPE_ORDER: CategoryType[] = ["INCOME", "COGS", "EXPENSE"];
const TYPE_LABELS: Record<CategoryType, string> = { INCOME: "Income", COGS: "Cost of goods", EXPENSE: "Expenses" };

export default function RecurringClient() {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [saving, setSaving] = useState(false);

  const activeCats = useMemo(() => categories.filter((c) => !c.archived), [categories]);

  async function load() {
    setLoading(true);
    const [{ rules }, { categories }] = await Promise.all([
      api<{ rules: RecurringRule[] }>("/api/recurring"),
      api<{ categories: Category[] }>("/api/categories"),
    ]);
    setRules(rules);
    setCategories(categories);
    if (!categoryId && categories.length) setCategoryId(categories[0].id);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseAmount(amount);
    const day = parseInt(dayOfMonth, 10);
    if (!name.trim()) { setError("Enter a name"); return; }
    if (amt === null || amt <= 0) { setError("Enter a valid amount"); return; }
    if (!categoryId) { setError("Pick a category"); return; }
    if (!(day >= 1 && day <= 28)) { setError("Day must be 1–28"); return; }
    setSaving(true);
    try {
      await api("/api/recurring", { method: "POST", json: { name, amount: amt, categoryId, dayOfMonth: day } });
      setName(""); setAmount("");
      await load();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  async function toggle(r: RecurringRule) {
    await api(`/api/recurring/${r.id}`, { method: "PATCH", json: { active: !r.active } });
    load();
  }
  async function remove(r: RecurringRule) {
    if (!confirm(`Delete recurring rule "${r.name}"? Past posted transactions are kept.`)) return;
    await api(`/api/recurring/${r.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recurring transactions</h1>
      <p className="text-sm text-[var(--muted)]">
        Fixed monthly items (rent, salary, subscriptions). These post automatically each month on the chosen day.
      </p>

      <form onSubmit={add} className="card p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4">
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Apartment rent" />
        </div>
        <div className="sm:col-span-3">
          <label className="label">Amount (UZS)</label>
          <input className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="4 000 000" />
        </div>
        <div className="sm:col-span-3">
          <label className="label">Category</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {TYPE_ORDER.map((type) => {
              const cats = activeCats.filter((c) => c.type === type);
              if (!cats.length) return null;
              return (
                <optgroup key={type} label={TYPE_LABELS[type]}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              );
            })}
          </select>
        </div>
        <div className="sm:col-span-1">
          <label className="label">Day</label>
          <input className="input" inputMode="numeric" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
        </div>
        <div className="sm:col-span-1">
          <button className="btn btn-primary w-full" disabled={saving}>{saving ? "…" : "Add"}</button>
        </div>
      </form>

      {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

      {loading ? (
        <div className="card p-8 text-center text-[var(--muted)]">Loading…</div>
      ) : rules.length === 0 ? (
        <div className="card p-8 text-center text-[var(--muted)]">No recurring rules yet.</div>
      ) : (
        <div className="card divide-y divide-[var(--border)]">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${!r.active ? "text-[var(--muted)]" : ""}`}>
                  {r.name} {!r.active && <span className="text-xs">(paused)</span>}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {r.category.name} · day {r.dayOfMonth} of each month
                </div>
              </div>
              <div className={`font-semibold tabular-nums ${r.category.type === "INCOME" ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                {r.category.type === "INCOME" ? "+" : "−"}{formatNumber(r.amount)}
              </div>
              <button className="btn btn-ghost text-xs" onClick={() => toggle(r)}>{r.active ? "Pause" : "Resume"}</button>
              <button className="btn btn-danger text-xs" onClick={() => remove(r)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
