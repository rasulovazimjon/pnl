"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LINKS = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/transactions", key: "nav.transactions" },
  { href: "/pnl", key: "nav.pnl" },
  { href: "/budgets", key: "nav.budgets" },
  { href: "/recurring", key: "nav.recurring" },
  { href: "/categories", key: "nav.categories" },
];

export default function Nav({ name, role }: { name: string; role: "HUSBAND" | "WIFE" }) {
  const { t } = useLanguage();
  const roleLabel = t(`role.${role}`);
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
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
                  active ? "bg-[var(--secondary)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-[var(--muted-foreground)]">{name} · {roleLabel}</span>
          <LanguageSwitcher />
          <button onClick={logout} className="btn btn-ghost text-sm">{t("nav.signOut")}</button>
          <button className="md:hidden btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-label={t("nav.menu")}>☰</button>
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
                pathname === l.href ? "bg-[var(--secondary)]" : "text-[var(--muted-foreground)]"
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
