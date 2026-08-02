import { prisma } from "./db";
import { monthStart, monthEnd } from "./dates";
import type { CategoryType } from "@prisma/client";

export interface CategoryLine {
  categoryId: string;
  name: string;
  parentName: string | null;
  type: CategoryType;
  actual: number;
  budget: number | null;
  variance: number | null; // budget - actual for expenses/cogs; actual - budget for income
}

export interface PnLStatement {
  monthKey: string;
  income: CategoryLine[];
  cogs: CategoryLine[];
  expense: CategoryLine[];
  totals: {
    income: number;
    cogs: number;
    grossProfit: number;
    expense: number;
    netProfit: number;
    marginPct: number | null;
  };
}

/** Build a full monthly P&L statement for a household. */
export async function buildPnL(householdId: string, key: string): Promise<PnLStatement> {
  const start = monthStart(key);
  const end = monthEnd(key);

  const [categories, txns, budgets] = await Promise.all([
    prisma.category.findMany({
      where: { householdId },
      include: { parent: { select: { name: true } } },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { householdId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({ where: { householdId, month: start } }),
  ]);

  const actualByCat = new Map<string, number>();
  for (const t of txns) actualByCat.set(t.categoryId, t._sum.amount ?? 0);

  const budgetByCat = new Map<string, number>();
  for (const b of budgets) budgetByCat.set(b.categoryId, b.amount);

  const lines: CategoryLine[] = categories.map((c) => {
    const actual = actualByCat.get(c.id) ?? 0;
    const budget = budgetByCat.has(c.id) ? budgetByCat.get(c.id)! : null;
    let variance: number | null = null;
    if (budget !== null) {
      variance = c.type === "INCOME" ? actual - budget : budget - actual;
    }
    return {
      categoryId: c.id,
      name: c.name,
      parentName: c.parent?.name ?? null,
      type: c.type,
      actual,
      budget,
      variance,
    };
  });

  // Only show lines with activity or a budget (keeps the statement clean).
  const active = lines.filter((l) => l.actual !== 0 || l.budget !== null);
  const byType = (t: CategoryType) =>
    active
      .filter((l) => l.type === t)
      .sort((a, b) => b.actual - a.actual);

  const income = byType("INCOME");
  const cogs = byType("COGS");
  const expense = byType("EXPENSE");

  const sum = (arr: CategoryLine[]) => arr.reduce((s, l) => s + l.actual, 0);
  const totalIncome = sum(income);
  const totalCogs = sum(cogs);
  const grossProfit = totalIncome - totalCogs;
  const totalExpense = sum(expense);
  const netProfit = grossProfit - totalExpense;

  return {
    monthKey: key,
    income,
    cogs,
    expense,
    totals: {
      income: totalIncome,
      cogs: totalCogs,
      grossProfit,
      expense: totalExpense,
      netProfit,
      marginPct: totalIncome > 0 ? (netProfit / totalIncome) * 100 : null,
    },
  };
}

/** Net profit per month over a trailing window, for the dashboard trend. */
export async function monthlyTrend(
  householdId: string,
  monthsBack: number,
  latestKey: string,
): Promise<{ monthKey: string; income: number; expense: number; net: number }[]> {
  const [y, m] = latestKey.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1 - (monthsBack - 1), 1));
  const end = new Date(Date.UTC(y, m, 1));

  const txns = await prisma.transaction.findMany({
    where: { householdId, date: { gte: start, lt: end } },
    select: { amount: true, date: true, category: { select: { type: true } } },
  });

  const buckets = new Map<string, { income: number; expense: number }>();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    buckets.set(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      { income: 0, expense: 0 },
    );
  }

  for (const t of txns) {
    const k = `${t.date.getUTCFullYear()}-${String(t.date.getUTCMonth() + 1).padStart(2, "0")}`;
    const b = buckets.get(k);
    if (!b) continue;
    if (t.category.type === "INCOME") b.income += t.amount;
    else b.expense += t.amount; // COGS + EXPENSE both reduce profit
  }

  return [...buckets.entries()]
    .map(([monthKey, v]) => ({ monthKey, income: v.income, expense: v.expense, net: v.income - v.expense }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}
