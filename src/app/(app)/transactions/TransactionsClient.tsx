"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatUZS, formatNumber, parseAmount } from "@/lib/money";
import { currentMonthKey, toDateInput } from "@/lib/dates";
import type { Category, Transaction, CategoryType } from "@/lib/types";
import MonthSwitcher from "@/components/MonthSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

// Two groups for the category picker: Income, and Expenses (which absorbs any
// legacy COGS categories so they remain selectable).
const CAT_GROUPS: { labelKey: string; match: (t: CategoryType) => boolean }[] = [
  { labelKey: "type.income", match: (t) => t === "INCOME" },
  { labelKey: "type.expenses", match: (t) => t !== "INCOME" },
];

export default function TransactionsClient() {
  const { t, monthLabel, catName } = useLanguage();
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

  // inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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
    if (amt === null || amt <= 0) { setError(t("txn.errAmount")); return; }
    if (!categoryId) { setError(t("txn.errCategory")); return; }
    setSaving(true);
    try {
      await api("/api/transactions", { method: "POST", json: { amount: amt, categoryId, date, note: note || null } });
      setAmount(""); setNote("");
      await loadTxns();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm(t("txn.confirmDelete"))) return;
    await api(`/api/transactions/${id}`, { method: "DELETE" });
    setTxns((list) => list.filter((x) => x.id !== id));
  }

  function startEdit(x: Transaction) {
    setError(null);
    setEditingId(x.id);
    setEditAmount(String(x.amount));
    setEditCategoryId(x.categoryId);
    setEditDate(new Date(x.date).toISOString().slice(0, 10));
    setEditNote(x.note ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    const amt = parseAmount(editAmount);
    if (amt === null || amt <= 0) { setError(t("txn.errAmount")); return; }
    if (!editCategoryId) { setError(t("txn.errCategory")); return; }
    setEditSaving(true);
    try {
      await api(`/api/transactions/${id}`, {
        method: "PATCH",
        json: { amount: amt, categoryId: editCategoryId, date: editDate, note: editNote || null },
      });
      setEditingId(null);
      await loadTxns();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditSaving(false);
    }
  }

  const monthTotal = txns.reduce((s, x) => s + (x.category.type === "INCOME" ? x.amount : -x.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("txn.title")}</h1>
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>

      {/* Add form */}
      <form onSubmit={addTxn} className="card p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-3">
          <label className="label">{t("txn.amount")}</label>
          <input className="input" inputMode="numeric" placeholder="150 000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="sm:col-span-4">
          <label className="label">{t("txn.category")}</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {CAT_GROUPS.map((g) => {
              const cats = activeCats.filter((c) => g.match(c.type));
              if (!cats.length) return null;
              return (
                <optgroup key={g.labelKey} label={t(g.labelKey)}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{catName(c.name)}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">{t("txn.date")}</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">{t("txn.note")}</label>
          <input className="input" placeholder={t("common.optional")} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="sm:col-span-1">
          <button className="btn btn-primary w-full" disabled={saving}>{saving ? "…" : t("common.add")}</button>
        </div>
      </form>

      {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

      {/* Filter + summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select className="input max-w-xs" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">{t("txn.allCategories")}</option>
          {activeCats.map((c) => <option key={c.id} value={c.id}>{catName(c.name)}</option>)}
        </select>
        <div className="text-sm text-[var(--muted-foreground)]">
          {t("txn.netFor", { month: monthLabel(month) })}{" "}
          <span className={monthTotal >= 0 ? "text-[var(--income)] font-semibold" : "text-[var(--expense)] font-semibold"}>
            {monthTotal >= 0 ? "+" : "−"}{formatUZS(Math.abs(monthTotal))}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="card divide-y divide-[var(--border)]">
        {loading ? (
          <div className="p-6 text-center text-[var(--muted-foreground)]">{t("common.loading")}</div>
        ) : txns.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted-foreground)]">{t("txn.none")}</div>
        ) : (
          txns.map((x) =>
            editingId === x.id ? (
              /* Inline edit form */
              <div key={x.id} className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-[var(--secondary)]">
                <div className="sm:col-span-3">
                  <label className="label">{t("txn.amount")}</label>
                  <input className="input" inputMode="numeric" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                </div>
                <div className="sm:col-span-3">
                  <label className="label">{t("txn.category")}</label>
                  <select className="input" value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                    {CAT_GROUPS.map((g) => {
                      const cats = activeCats.filter((c) => g.match(c.type));
                      if (!cats.length) return null;
                      return (
                        <optgroup key={g.labelKey} label={t(g.labelKey)}>
                          {cats.map((c) => <option key={c.id} value={c.id}>{catName(c.name)}</option>)}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">{t("txn.date")}</label>
                  <input className="input" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">{t("txn.note")}</label>
                  <input className="input" placeholder={t("common.optional")} value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button className="btn btn-primary flex-1" onClick={() => saveEdit(x.id)} disabled={editSaving}>
                    {editSaving ? "…" : t("common.save")}
                  </button>
                  <button className="btn btn-ghost" onClick={cancelEdit} disabled={editSaving}>{t("common.cancel")}</button>
                </div>
              </div>
            ) : (
              <div key={x.id} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {catName(x.category.name)}
                    {x.note && <span className="text-[var(--muted-foreground)] font-normal"> — {x.note}</span>}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {new Date(x.date).toISOString().slice(0, 10)} · {x.user.name}
                    {x.recurringRuleId && ` · ${t("txn.recurring")}`}
                  </div>
                </div>
                <div className={`font-semibold tabular-nums ${x.category.type === "INCOME" ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                  {x.category.type === "INCOME" ? "+" : "−"}{formatNumber(x.amount)}
                </div>
                <button className="btn btn-ghost" onClick={() => startEdit(x)} aria-label={t("common.edit")} title={t("common.edit")}>✎</button>
                <button className="btn btn-danger" onClick={() => del(x.id)} aria-label={t("common.delete")} title={t("common.delete")}>✕</button>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
