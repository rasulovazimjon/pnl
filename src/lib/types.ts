// Lightweight shapes shared with client components (no Prisma import on client).
export type CategoryType = "INCOME" | "COGS" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parentId: string | null;
  parent: { name: string } | null;
  archived: boolean;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  categoryId: string;
  category: { name: string; type: CategoryType };
  user: { name: string };
  recurringRuleId: string | null;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  amount: number;
}

export interface RecurringRule {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  active: boolean;
  note: string | null;
  categoryId: string;
  category: { name: string; type: CategoryType };
}

export const TYPE_LABEL: Record<CategoryType, string> = {
  INCOME: "Income",
  COGS: "Cost of goods sold",
  EXPENSE: "Expense",
};
