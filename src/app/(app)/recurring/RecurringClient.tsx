"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber, parseAmount } from "@/lib/money";
import type { Category, RecurringRule, CategoryType } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

const CAT_GROUPS: { labelKey: string; match: (t: CategoryType) => boolean }[] = [
  { labelKey: "type.income", match: (t) => t === "INCOME" },
  { labelKey: "type.expenses", match: (t) => t !== "INCOME" },
];

export default function RecurringClient() {
  const { t, catName } = useLanguage();
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
    if (!name.trim()) { setError(t("rec.errName")); return; }
    if (amt === null || amt <= 0) { setError(t("txn.errAmount")); return; }
    if (!categoryId) { setError(t("txn.errCategory")); return; }
    if (!(day >= 1 && day <= 28)) { setError(t("rec.errDay")); return; }
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
    if (!confirm(t("rec.confirmDelete", { name: r.name }))) return;
    await api(`/api/recurring/${r.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("rec.title")}</h1>
      <p className="text-sm text-[var(--muted-foreground)]">{t("rec.description")}</p>

      <form onSubmit={add} className="card p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4">
          <label className="label">{t("rec.name")}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("rec.namePlaceholder")} />
        </div>
        <div className="sm:col-span-3">
          <label className="label">{t("txn.amount")}</label>
          <input className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="4 000 000" />
        </div>
        <div className="sm:col-span-3">
          <label className="label">{t("txn.category")}</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
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
        <div className="sm:col-span-1">
          <label className="label">{t("rec.day")}</label>
          <input className="input" inputMode="numeric" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
        </div>
        <div className="sm:col-span-1">
          <button className="btn btn-primary w-full" disabled={saving}>{saving ? "…" : t("common.add")}</button>
        </div>
      </form>

      {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

      {loading ? (
        <div className="card p-8 text-center text-[var(--muted-foreground)]">{t("common.loading")}</div>
      ) : rules.length === 0 ? (
        <div className="card p-8 text-center text-[var(--muted-foreground)]">{t("rec.none")}</div>
      ) : (
        <div className="card divide-y divide-[var(--border)]">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${!r.active ? "text-[var(--muted-foreground)]" : ""}`}>
                  {r.name} {!r.active && <span className="text-xs">{t("rec.paused")}</span>}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {catName(r.category.name)} · {t("rec.dayOf", { day: r.dayOfMonth })}
                </div>
              </div>
              <div className={`font-semibold tabular-nums ${r.category.type === "INCOME" ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                {r.category.type === "INCOME" ? "+" : "−"}{formatNumber(r.amount)}
              </div>
              <button className="btn btn-ghost text-xs" onClick={() => toggle(r)}>{r.active ? t("rec.pause") : t("rec.resume")}</button>
              <button className="btn btn-danger text-xs" onClick={() => remove(r)}>{t("common.delete")}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
