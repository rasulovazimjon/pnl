import { prisma } from "./db";
import { monthStart, currentMonthKey } from "./dates";

/**
 * Materialize all active recurring rules for the given household up to and
 * including the current month. Idempotent: a rule tracks lastPosted, and we
 * only create a transaction for months it hasn't been posted for yet.
 * Returns the number of transactions created.
 */
export async function materializeRecurring(householdId: string): Promise<number> {
  const rules = await prisma.recurringRule.findMany({
    where: { householdId, active: true },
  });

  const nowKey = currentMonthKey();
  const [ny, nm] = nowKey.split("-").map(Number);
  let created = 0;

  for (const rule of rules) {
    // Determine the first month to post. Start from the month after lastPosted,
    // or from the rule's creation month if never posted.
    let cursor: Date;
    if (rule.lastPosted) {
      cursor = new Date(Date.UTC(rule.lastPosted.getUTCFullYear(), rule.lastPosted.getUTCMonth() + 1, 1));
    } else {
      cursor = new Date(Date.UTC(rule.createdAt.getUTCFullYear(), rule.createdAt.getUTCMonth(), 1));
    }

    let lastPosted = rule.lastPosted;
    while (cursor.getUTCFullYear() < ny || (cursor.getUTCFullYear() === ny && cursor.getUTCMonth() <= nm - 1)) {
      const year = cursor.getUTCFullYear();
      const month = cursor.getUTCMonth();
      const day = Math.min(rule.dayOfMonth, daysInMonth(year, month));
      const postDate = new Date(Date.UTC(year, month, day));

      await prisma.transaction.create({
        data: {
          amount: rule.amount,
          date: postDate,
          note: rule.note || `${rule.name} (recurring)`,
          categoryId: rule.categoryId,
          userId: (await firstUserId(householdId)),
          householdId,
          recurringRuleId: rule.id,
        },
      });
      created++;
      lastPosted = new Date(Date.UTC(year, month, 1));
      cursor = new Date(Date.UTC(year, month + 1, 1));
    }

    if (lastPosted && (!rule.lastPosted || lastPosted > rule.lastPosted)) {
      await prisma.recurringRule.update({
        where: { id: rule.id },
        data: { lastPosted },
      });
    }
  }

  return created;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

// Recurring transactions are attributed to the first (oldest) household member.
async function firstUserId(householdId: string): Promise<string> {
  const u = await prisma.user.findFirst({
    where: { householdId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!u) throw new Error("No user in household");
  return u.id;
}

export { monthStart };
