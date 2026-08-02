import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";
import { materializeRecurring } from "@/lib/recurring";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  amount: z.number().int().positive(),
  categoryId: z.string().min(1),
  dayOfMonth: z.number().int().min(1).max(28),
  note: z.string().max(500).optional().nullable(),
});

export async function GET() {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.recurringRule.findMany({
    where: { householdId: session.householdId },
    include: { category: { select: { name: true, type: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, amount, categoryId, dayOfMonth, note } = parsed.data;

  const cat = await prisma.category.findFirst({
    where: { id: categoryId, householdId: session.householdId },
  });
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });

  const rule = await prisma.recurringRule.create({
    data: { name: name.trim(), amount, categoryId, dayOfMonth, note: note?.trim() || null, householdId: session.householdId },
  });

  // Post immediately for the current month so it shows up right away.
  const created = await materializeRecurring(session.householdId);
  return NextResponse.json({ rule, posted: created }, { status: 201 });
}
