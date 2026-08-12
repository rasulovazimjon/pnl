import type { CategoryType } from "@prisma/client";

// Starter chart of accounts created for every new household.
// Users can rename, add, or archive these later.
export const DEFAULT_CATEGORIES: { name: string; type: CategoryType }[] = [
  // Income
  { name: "Salary", type: "INCOME" },
  { name: "Business income", type: "INCOME" },
  { name: "Investments", type: "INCOME" },
  { name: "Other income", type: "INCOME" },

  // Expenses
  { name: "Housing / Rent", type: "EXPENSE" },
  { name: "Utilities", type: "EXPENSE" },
  { name: "Groceries", type: "EXPENSE" },
  { name: "Dining out", type: "EXPENSE" },
  { name: "Transport", type: "EXPENSE" },
  { name: "Health", type: "EXPENSE" },
  { name: "Education", type: "EXPENSE" },
  { name: "Entertainment", type: "EXPENSE" },
  { name: "Shopping", type: "EXPENSE" },
  { name: "Subscriptions", type: "EXPENSE" },
  { name: "Taxes", type: "EXPENSE" },
  { name: "Other expenses", type: "EXPENSE" },
];
