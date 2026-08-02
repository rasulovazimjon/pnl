import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";

export async function GET() {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const household = await prisma.household.findUnique({
    where: { id: session.householdId },
    include: {
      users: {
        select: { name: true, role: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!household) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: household.id, // this is the join code
    name: household.name,
    members: household.users,
  });
}
