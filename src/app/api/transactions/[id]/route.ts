import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";

const patchSchema = z.object({
  amount: z.number().int().positive().optional(),
  categoryId: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  note: z.string().max(500).nullable().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, householdId: session.householdId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: data.categoryId, householdId: session.householdId },
    });
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const txn = await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.date !== undefined && { date: new Date(`${data.date}T00:00:00.000Z`) }),
      ...(data.note !== undefined && { note: data.note?.trim() || null }),
    },
  });

  return NextResponse.json({ transaction: txn });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, householdId: session.householdId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
