"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { api } from "@/lib/api";
import { formatUZS, formatNumber } from "@/lib/money";
import { currentMonthKey, monthLabel } from "@/lib/dates";
import MonthSwitcher from "@/components/MonthSwitcher";
import HouseholdCard from "@/components/HouseholdCard";

interface Data {
  month: string;
  totals: { income: number; cogs: number; grossProfit: number; expense: number; netProfit: number; marginPct: number | null };
  trend: { monthKey: string; income: number; expense: number; net: number }[];
  topExpenses: { name: string; amount: number }[];
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "income" | "expense" | "net" }) {
  const color =
    tone === "income" ? "text-[var(--income)]" :
    tone === "expense" ? "text-[var(--expense)]" :
    tone === "net" ? (value >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]") : "";
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className={`text-xl font-bold mt-1 tabular-nums ${color}`}>{formatUZS(value)}</div>
    </div>
  );
}

export default function DashboardClient() {
  const [month, setMonth] = useState(currentMonthKey());
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<Data>(`/api/dashboard?month=${month}`).then(setData).finally(() => setLoading(false));
  }, [month]);

  const trendData = data?.trend.map((d) => ({ ...d, label: monthLabel(d.monthKey).split(" ")[0].slice(0, 3) })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <MonthSwitcher value={month} onChange={setMonth} />
          <Link href="/transactions" className="btn btn-primary">+ Add transaction</Link>
        </div>
      </div>

      {loading || !data ? (
        <div className="card p-8 text-center text-[var(--muted)]">Loading…</div>
      ) : (
        <>
          <HouseholdCard />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Income" value={data.totals.income} tone="income" />
            <Kpi label="Expenses" value={data.totals.cogs + data.totals.expense} tone="expense" />
            <Kpi label="Net profit" value={data.totals.netProfit} tone="net" />
            <div className="card p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Net margin</div>
              <div className="text-xl font-bold mt-1 tabular-nums">
                {data.totals.marginPct === null ? "—" : `${data.totals.marginPct.toFixed(1)}%`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <h2 className="font-semibold mb-3">Net profit — last 6 months</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => (v / 1_000_000).toFixed(0) + "M"} tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip
                      formatter={(v) => formatUZS(Number(v))}
                      contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
                    />
                    <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                      {trendData.map((d, i) => (
                        <Cell key={i} fill={d.net >= 0 ? "var(--income)" : "var(--expense)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <h2 className="font-semibold mb-3">Top expenses — {monthLabel(month)}</h2>
              {data.topExpenses.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No expenses recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.topExpenses.map((e) => {
                    const max = data.topExpenses[0].amount || 1;
                    return (
                      <li key={e.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{e.name}</span>
                          <span className="tabular-nums font-medium">{formatNumber(e.amount)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                          <div className="h-full bg-[var(--expense)]" style={{ width: `${(e.amount / max) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link href="/pnl" className="btn btn-ghost w-full mt-4">View full P&amp;L →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
