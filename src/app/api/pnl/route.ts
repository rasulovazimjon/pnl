import { NextRequest, NextResponse } from "next/server";
import { requireApi } from "@/lib/session";
import { buildPnL } from "@/lib/pnl";
import { currentMonthKey } from "@/lib/dates";
import { materializeRecurring } from "@/lib/recurring";

export async function GET(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? currentMonthKey();

  // Make sure recurring items are posted before we compute the statement.
  await materializeRecurring(session.householdId);

  const statement = await buildPnL(session.householdId, month);
  return NextResponse.json({ statement });
}
