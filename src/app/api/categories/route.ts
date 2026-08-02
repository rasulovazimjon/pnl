import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["INCOME", "COGS", "EXPENSE"]),
  parentId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { householdId: session.householdId },
    include: { parent: { select: { name: true } } },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, type, parentId } = parsed.data;

  if (parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: parentId, householdId: session.householdId },
    });
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name: name.trim(), type, parentId: parentId || null, householdId: session.householdId },
  });
  return NextResponse.json({ category }, { status: 201 });
}
