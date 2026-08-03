"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const joinCode = String(form.get("householdId") || "").trim();
    const payload =
      mode === "login"
        ? { email: form.get("email"), password: form.get("password") }
        : {
            name: form.get("name"),
            role: form.get("role"),
            email: form.get("email"),
            password: form.get("password"),
            // If a join code is given, join that household; otherwise create one.
            householdId: joinCode || undefined,
            householdName: joinCode ? undefined : form.get("householdName") || undefined,
          };

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.genericError"));
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("auth.networkError"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>
        <div className="card p-6">
          <div className="mb-5">
            <h1 className="text-xl font-bold">
              {mode === "login" ? t("auth.signInTitle") : t("auth.createTitle")}
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">{t("auth.tagline")}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <div>
                  <label className="label">{t("auth.yourName")}</label>
                  <input name="name" className="input" required placeholder="Azimjon" />
                </div>
                <div>
                  <label className="label">{t("auth.roleInHousehold")}</label>
                  <select name="role" className="input" defaultValue="HUSBAND">
                    <option value="HUSBAND">{t("role.HUSBAND")}</option>
                    <option value="WIFE">{t("role.WIFE")}</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="label">{t("auth.email")}</label>
              <input name="email" type="email" className="input" required placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">{t("auth.password")}</label>
              <input
                name="password"
                type="password"
                className="input"
                required
                minLength={mode === "register" ? 8 : undefined}
                placeholder={mode === "register" ? t("auth.passwordHint") : "••••••••"}
              />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <label className="label">{t("auth.householdName")}</label>
                  <input name="householdName" className="input" placeholder={t("auth.householdNamePlaceholder")} />
                </div>
                <div>
                  <label className="label">{t("auth.joinCodeLabel")}</label>
                  <input name="householdId" className="input" placeholder={t("auth.joinCodePlaceholder")} />
                  <p className="text-xs text-[var(--muted)] mt-1">{t("auth.joinCodeHelp")}</p>
                </div>
              </>
            )}

            {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? t("common.pleaseWait") : mode === "login" ? t("auth.signInBtn") : t("auth.createBtn")}
            </button>
          </form>

          <p className="text-sm text-[var(--muted)] mt-4 text-center">
            {mode === "login" ? (
              <>{t("auth.newHere")} <Link href="/register" className="text-[var(--primary)] font-medium">{t("auth.createOne")}</Link></>
            ) : (
              <>{t("auth.haveAccount")} <Link href="/login" className="text-[var(--primary)] font-medium">{t("auth.signInBtn")}</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
