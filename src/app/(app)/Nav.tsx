"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/pnl", label: "P&L" },
  { href: "/budgets", label: "Budgets" },
  { href: "/recurring", label: "Recurring" },
  { href: "/categories", label: "Categories" },
];

export default function Nav({ name, role }: { name: string; role: "HUSBAND" | "WIFE" }) {
  const roleLabel = role === "WIFE" ? "Wife" : "Husband";
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--primary)]">₴ P&amp;L</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  active ? "bg-[var(--surface-2)] text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-[var(--muted)]">{name} · {roleLabel}</span>
          <button onClick={logout} className="btn btn-ghost text-sm">Sign out</button>
          <button className="md:hidden btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-label="Menu">☰</button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[var(--border)] px-4 py-2 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === l.href ? "bg-[var(--surface-2)]" : "text-[var(--muted)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
