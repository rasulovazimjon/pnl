import { NextRequest, NextResponse } from "next/server";
import { requireApi } from "@/lib/session";
import { buildPnL, monthlyTrend } from "@/lib/pnl";
import { currentMonthKey } from "@/lib/dates";
import { materializeRecurring } from "@/lib/recurring";

export async function GET(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? currentMonthKey();

  await materializeRecurring(session.householdId);

  const [statement, trend] = await Promise.all([
    buildPnL(session.householdId, month),
    monthlyTrend(session.householdId, 6, month),
  ]);

  // Top expense categories this month (COGS + EXPENSE).
  const topExpenses = [...statement.cogs, ...statement.expense]
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 5)
    .map((l) => ({ name: l.name, amount: l.actual }));

  return NextResponse.json({
    month,
    totals: statement.totals,
    trend,
    topExpenses,
  });
}
