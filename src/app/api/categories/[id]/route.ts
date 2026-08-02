import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  archived: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.category.findFirst({
    where: { id, householdId: session.householdId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ category });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.category.findFirst({
    where: { id, householdId: session.householdId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Don't hard-delete a category that has transactions; archive it instead.
  if (existing._count.transactions > 0) {
    await prisma.category.update({ where: { id }, data: { archived: true } });
    return NextResponse.json({ ok: true, archived: true });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true, archived: false });
}
