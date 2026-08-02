import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";
import { monthStart } from "@/lib/dates";

const upsertSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  amount: z.number().int().min(0),
});

export async function GET(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const where: Record<string, unknown> = { householdId: session.householdId };
  if (month) where.month = monthStart(month);

  const budgets = await prisma.budget.findMany({ where });
  return NextResponse.json({ budgets });
}

// Upsert a budget for a category+month. amount 0 deletes it.
export async function POST(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { categoryId, month, amount } = parsed.data;

  const cat = await prisma.category.findFirst({
    where: { id: categoryId, householdId: session.householdId },
  });
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });

  const monthDate = monthStart(month);

  if (amount === 0) {
    await prisma.budget.deleteMany({ where: { categoryId, month: monthDate } });
    return NextResponse.json({ ok: true, deleted: true });
  }

  const budget = await prisma.budget.upsert({
    where: { categoryId_month: { categoryId, month: monthDate } },
    create: { categoryId, month: monthDate, amount, householdId: session.householdId },
    update: { amount },
  });
  return NextResponse.json({ budget });
}
