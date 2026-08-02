import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  amount: z.number().int().positive().optional(),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
  active: z.boolean().optional(),
  note: z.string().max(500).nullable().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.recurringRule.findFirst({
    where: { id, householdId: session.householdId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rule = await prisma.recurringRule.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ rule });
}

// Deleting a rule keeps the transactions it already created (they become normal).
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.recurringRule.findFirst({
    where: { id, householdId: session.householdId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.recurringRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
