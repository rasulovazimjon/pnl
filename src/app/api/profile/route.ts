import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApi } from "@/lib/session";
import { createSession } from "@/lib/auth";

export async function GET() {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      role: true,
      telegramUsername: true,
      household: { select: { name: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    name: user.name,
    email: user.email,
    role: user.role,
    telegramUsername: user.telegramUsername,
    householdName: user.household.name,
  });
}

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  // Telegram handle: 5–32 chars of letters/digits/underscore. Empty clears it.
  telegramUsername: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data: { name?: string; telegramUsername?: string | null } = {};

  if (parsed.data.name !== undefined) {
    const name = parsed.data.name.trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    data.name = name;
  }

  if (parsed.data.telegramUsername !== undefined) {
    const raw = (parsed.data.telegramUsername ?? "").trim().replace(/^@/, "");
    if (raw === "") {
      data.telegramUsername = null;
    } else if (!/^[A-Za-z0-9_]{5,32}$/.test(raw)) {
      return NextResponse.json(
        { error: "Telegram username must be 5–32 letters, digits or underscores." },
        { status: 400 },
      );
    } else {
      data.telegramUsername = raw;
    }
  }

  const user = await prisma.user.update({ where: { id: session.userId }, data });

  // If the display name changed, refresh the session cookie so the header updates.
  if (data.name !== undefined && data.name !== session.name) {
    await createSession({
      userId: user.id,
      householdId: user.householdId,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  return NextResponse.json({
    name: user.name,
    telegramUsername: user.telegramUsername,
  });
}
