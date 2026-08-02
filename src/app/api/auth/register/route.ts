import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/lib/defaults";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  role: z.enum(["HUSBAND", "WIFE"]),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  householdName: z.string().min(1).max(80).optional(),
  // Optional: join an existing household by its code (the household id) instead
  // of creating a new one. Used by the second partner to join shared books.
  householdId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { name, role, email, password, householdName, householdId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    let hid = householdId;
    if (hid) {
      const hh = await tx.household.findUnique({ where: { id: hid } });
      if (!hh) throw new Error("HOUSEHOLD_NOT_FOUND");
      // Each household has at most one Husband and one Wife.
      const taken = await tx.user.findFirst({ where: { householdId: hid, role } });
      if (taken) throw new Error("ROLE_TAKEN");
    } else {
      const hh = await tx.household.create({
        data: { name: householdName?.trim() || `${name}'s household` },
      });
      hid = hh.id;
      // Seed default chart of accounts for the new household.
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((c, i) => ({
          name: c.name,
          type: c.type,
          sortOrder: i,
          householdId: hid!,
        })),
      });
    }
    return tx.user.create({
      data: { name: name.trim(), role, email, passwordHash, householdId: hid! },
    });
  }).catch((e) => {
    if (e instanceof Error && e.message === "HOUSEHOLD_NOT_FOUND") return "HOUSEHOLD_NOT_FOUND";
    if (e instanceof Error && e.message === "ROLE_TAKEN") return "ROLE_TAKEN";
    throw e;
  });

  if (user === "HOUSEHOLD_NOT_FOUND") {
    return NextResponse.json({ error: "Household code not found. Check the code and try again." }, { status: 404 });
  }
  if (user === "ROLE_TAKEN") {
    return NextResponse.json({ error: "That role is already taken in this household. Pick the other one." }, { status: 409 });
  }

  await createSession({
    userId: user.id,
    householdId: user.householdId,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({ ok: true });
}
