"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber, parseAmount } from "@/lib/money";
import { currentMonthKey } from "@/lib/dates";
import MonthSwitcher from "@/components/MonthSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

interface Line {
  categoryId: string;
  name: string;
  type: "INCOME" | "COGS" | "EXPENSE";
  actual: number;
  budget: number | null;
  variance: number | null;
}
interface Statement {
  income: Line[]; cogs: Line[]; expense: Line[];
}

export default function BudgetsClient() {
  const { t } = useLanguage();
  const [month, setMonth] = useState(currentMonthKey());
  const [lines, setLines] = useState<Line[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    // Reuse the P&L endpoint (it includes actual + budget per category), but we
    // also need categories with zero activity, so pull categories too.
    const [{ statement }, { categories }] = await Promise.all([
      api<{ statement: Statement }>(`/api/pnl?month=${month}`),
      api<{ categories: { id: string; name: string; type: Line["type"]; archived: boolean }[] }>(`/api/categories`),
    ]);
    const map = new Map<string, Line>();
    for (const l of [...statement.income, ...statement.cogs, ...statement.expense]) map.set(l.categoryId, l);
    const all: Line[] = categories
      .filter((c) => !c.archived)
      .map((c) => map.get(c.id) ?? { categoryId: c.id, name: c.name, type: c.type, actual: 0, budget: null, variance: null });
    setLines(all);
    const d: Record<string, string> = {};
    for (const l of all) d[l.categoryId] = l.budget !== null ? String(l.budget) : "";
    setDrafts(d);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [month]);

  async function save(l: Line) {
    const amount = parseAmount(drafts[l.categoryId] ?? "") ?? 0;
    setSavingId(l.categoryId);
    try {
      await api("/api/budgets", { method: "POST", json: { categoryId: l.categoryId, month, amount } });
      await load();
    } finally { setSavingId(null); }
  }

  const groups: { key: Line["type"]; title: string }[] = [
    { key: "INCOME", title: t("bud.incomeTargets") },
    { key: "COGS", title: t("type.cogsFull") },
    { key: "EXPENSE", title: t("pnl.operatingExpenses") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("bud.title")}</h1>
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>
      <p className="text-sm text-[var(--muted)]">{t("bud.description")}</p>

      {loading ? (
        <div className="card p-8 text-center text-[var(--muted)]">{t("common.loading")}</div>
      ) : (
        groups.map((g) => {
          const group = lines.filter((l) => l.type === g.key);
          if (!group.length) return null;
          return (
            <div key={g.key} className="card overflow-x-auto">
              <div className="px-4 py-2 bg-[var(--surface-2)] font-semibold text-sm">{g.title}</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[var(--muted)] text-xs uppercase">
                    <th className="px-4 py-2 text-left font-semibold">{t("txn.category")}</th>
                    <th className="px-4 py-2 text-right font-semibold">{t("pnl.actual")}</th>
                    <th className="px-4 py-2 text-right font-semibold">{t("bud.budget")}</th>
                    <th className="px-4 py-2 text-right font-semibold">{t("pnl.variance")}</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((l) => {
                    const draftAmt = parseAmount(drafts[l.categoryId] ?? "") ?? 0;
                    const variance = draftAmt > 0 ? (l.type === "INCOME" ? l.actual - draftAmt : draftAmt - l.actual) : null;
                    return (
                      <tr key={l.categoryId} className="border-t border-[var(--border)]">
                        <td className="px-4 py-2">{l.name}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{formatNumber(l.actual)}</td>
                        <td className="px-4 py-2 text-right">
                          <input
                            className="input text-right w-32 ml-auto"
                            inputMode="numeric"
                            value={drafts[l.categoryId] ?? ""}
                            placeholder="—"
                            onChange={(e) => setDrafts((d) => ({ ...d, [l.categoryId]: e.target.value }))}
                          />
                        </td>
                        <td className={`px-4 py-2 text-right tabular-nums ${variance === null ? "text-[var(--muted)]" : variance >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                          {variance === null ? "—" : `${variance >= 0 ? "+" : "−"}${formatNumber(Math.abs(variance))}`}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button className="btn btn-ghost text-xs" onClick={() => save(l)} disabled={savingId === l.categoryId}>
                            {savingId === l.categoryId ? "…" : t("common.save")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
