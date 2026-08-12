"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/money";
import { currentMonthKey } from "@/lib/dates";
import MonthSwitcher from "@/components/MonthSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

interface Line {
  categoryId: string;
  name: string;
  actual: number;
  budget: number | null;
  variance: number | null;
}
interface Statement {
  monthKey: string;
  income: Line[];
  expense: Line[];
  totals: {
    income: number;
    expense: number;
    netProfit: number;
    marginPct: number | null;
  };
}

function Section({ title, lines, sign }: { title: string; lines: Line[]; sign: "+" | "−" }) {
  const { catName } = useLanguage();
  if (!lines.length) return null;
  return (
    <>
      <tr className="bg-[var(--secondary)]">
        <td className="px-4 py-2 font-semibold text-sm" colSpan={4}>{title}</td>
      </tr>
      {lines.map((l) => (
        <tr key={l.categoryId} className="border-t border-[var(--border)]">
          <td className="px-4 py-2 pl-8">{catName(l.name)}</td>
          <td className="px-4 py-2 text-right tabular-nums">{sign}{formatNumber(l.actual)}</td>
          <td className="px-4 py-2 text-right tabular-nums text-[var(--muted-foreground)]">
            {l.budget !== null ? formatNumber(l.budget) : "—"}
          </td>
          <td className={`px-4 py-2 text-right tabular-nums ${l.variance === null ? "text-[var(--muted-foreground)]" : l.variance >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
            {l.variance === null ? "—" : `${l.variance >= 0 ? "+" : "−"}${formatNumber(Math.abs(l.variance))}`}
          </td>
        </tr>
      ))}
    </>
  );
}

function TotalRow({ label, value, strong, positive }: { label: string; value: number; strong?: boolean; positive?: boolean }) {
  return (
    <tr className={`border-t-2 border-[var(--border)] ${strong ? "text-base" : "text-sm"}`}>
      <td className={`px-4 py-2 ${strong ? "font-bold" : "font-semibold"}`}>{label}</td>
      <td className={`px-4 py-2 text-right tabular-nums ${strong ? "font-bold" : "font-semibold"} ${positive === undefined ? "" : positive ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
        {formatNumber(value)}
      </td>
      <td /><td />
    </tr>
  );
}

export default function PnLClient() {
  const { t } = useLanguage();
  const [month, setMonth] = useState(currentMonthKey());
  const [stmt, setStmt] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<{ statement: Statement }>(`/api/pnl?month=${month}`)
      .then((d) => setStmt(d.statement))
      .finally(() => setLoading(false));
  }, [month]);

  const tot = stmt?.totals;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("pnl.title")}</h1>
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>

      {loading || !stmt ? (
        <div className="card p-8 text-center text-[var(--muted-foreground)]">{t("common.loading")}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--muted-foreground)] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">{t("pnl.lineItem")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("pnl.actual")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("pnl.budget")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("pnl.variance")}</th>
              </tr>
            </thead>
            <tbody>
              <Section title={t("pnl.revenue")} lines={stmt.income} sign="+" />
              <TotalRow label={t("pnl.totalRevenue")} value={tot!.income} />

              <Section title={t("pnl.operatingExpenses")} lines={stmt.expense} sign="−" />
              <TotalRow label={t("pnl.totalExpenses")} value={tot!.expense} />

              <TotalRow label={t("pnl.netProfit")} value={tot!.netProfit} strong positive={tot!.netProfit >= 0} />
            </tbody>
          </table>
          <div className="px-4 py-3 text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]">
            {t("pnl.netMargin")}: {tot!.marginPct === null ? "—" : `${tot!.marginPct.toFixed(1)}%`}
            <span className="mx-2">·</span>
            {t("pnl.footer")}
          </div>
        </div>
      )}
    </div>
  );
}
