"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatUZS, formatNumber, parseAmount } from "@/lib/money";
import { currentMonthKey, monthLabel, shiftMonth, toDateInput } from "@/lib/dates";
import type { Category, Transaction, CategoryType } from "@/lib/types";
import MonthSwitcher from "@/components/MonthSwitcher";

const TYPE_ORDER: CategoryType[] = ["INCOME", "COGS", "EXPENSE"];
const TYPE_LABELS: Record<CategoryType, string> = { INCOME: "Income", COGS: "Cost of goods", EXPENSE: "Expenses" };

export default function TransactionsClient() {
  const [month, setMonth] = useState(currentMonthKey());
  const [categories, setCategories] = useState<Category[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("");

  // add form state
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(toDateInput(new Date()));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const activeCats = useMemo(() => categories.filter((c) => !c.archived), [categories]);

  async function loadCategories() {
    const { categories } = await api<{ categories: Category[] }>("/api/categories");
    setCategories(categories);
    if (!categoryId && categories.length) setCategoryId(categories.find((c) => c.type === "EXPENSE")?.id ?? categories[0].id);
  }

  async function loadTxns() {
    setLoading(true);
    try {
      const q = new URLSearchParams({ month });
      if (filterCat) q.set("categoryId", filterCat);
      const { transactions } = await api<{ transactions: Transaction[] }>(`/api/transactions?${q}`);
      setTxns(transactions);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadTxns(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [month, filterCat]);

  async function addTxn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseAmount(amount);
    if (amt === null || amt <= 0) { setError("Enter a valid amount"); return; }
    if (!categoryId) { setError("Pick a category"); return; }
    setSaving(true);
    try {
      await api("/api/transactions", { method: "POST", json: { amount: amt, categoryId, date, note: note || null } });
      setAmount(""); setNote("");
      await loadTxns();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await api(`/api/transactions/${id}`, { method: "DELETE" });
    setTxns((t) => t.filter((x) => x.id !== id));
  }

  const monthTotal = txns.reduce((s, t) => s + (t.category.type === "INCOME" ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>

      {/* Add form */}
      <form onSubmit={addTxn} className="card p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-3">
          <label className="label">Amount (UZS)</label>
          <input className="input" inputMode="numeric" placeholder="150 000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="sm:col-span-4">
          <label className="label">Category</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {TYPE_ORDER.map((type) => {
              const cats = activeCats.filter((c) => c.type === type);
              if (!cats.length) return null;
              return (
                <optgroup key={type} label={TYPE_LABELS[type]}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Note</label>
          <input className="input" placeholder="optional" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="sm:col-span-1">
          <button className="btn btn-primary w-full" disabled={saving}>{saving ? "…" : "Add"}</button>
        </div>
      </form>

      {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

      {/* Filter + summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select className="input max-w-xs" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {activeCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="text-sm text-[var(--muted)]">
          Net for {monthLabel(month)}:{" "}
          <span className={monthTotal >= 0 ? "text-[var(--income)] font-semibold" : "text-[var(--expense)] font-semibold"}>
            {monthTotal >= 0 ? "+" : "−"}{formatUZS(Math.abs(monthTotal))}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="card divide-y divide-[var(--border)]">
        {loading ? (
          <div className="p-6 text-center text-[var(--muted)]">Loading…</div>
        ) : txns.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted)]">No transactions this month yet.</div>
        ) : (
          txns.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {t.category.name}
                  {t.note && <span className="text-[var(--muted)] font-normal"> — {t.note}</span>}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {new Date(t.date).toISOString().slice(0, 10)} · {t.user.name}
                  {t.recurringRuleId && " · recurring"}
                </div>
              </div>
              <div className={`font-semibold tabular-nums ${t.category.type === "INCOME" ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                {t.category.type === "INCOME" ? "+" : "−"}{formatNumber(t.amount)}
              </div>
              <button className="btn btn-danger" onClick={() => del(t.id)} aria-label="Delete">✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
