import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";
import { monthStart, monthEnd } from "@/lib/dates";

const createSchema = z.object({
  amount: z.number().int().positive("Amount must be positive"),
  categoryId: z.string().min(1),
  date: z.string().min(1), // ISO date (YYYY-MM-DD)
  note: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM
  const categoryId = searchParams.get("categoryId");

  const where: Record<string, unknown> = { householdId: session.householdId };
  if (month) where.date = { gte: monthStart(month), lt: monthEnd(month) };
  if (categoryId) where.categoryId = categoryId;

  const txns = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { name: true, type: true } },
      user: { select: { name: true } },
    },
    take: 500,
  });

  return NextResponse.json({ transactions: txns });
}

export async function POST(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { amount, categoryId, date, note } = parsed.data;

  // Ensure the category belongs to this household.
  const cat = await prisma.category.findFirst({
    where: { id: categoryId, householdId: session.householdId },
  });
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });

  const txn = await prisma.transaction.create({
    data: {
      amount,
      categoryId,
      date: new Date(`${date}T00:00:00.000Z`),
      note: note?.trim() || null,
      userId: session.userId,
      householdId: session.householdId,
    },
  });

  return NextResponse.json({ transaction: txn }, { status: 201 });
}
