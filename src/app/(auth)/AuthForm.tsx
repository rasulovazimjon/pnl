"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
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
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold">
            {mode === "login" ? "Sign in" : "Create your account"}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Personal P&amp;L — your finances, corporate-style.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="label">Your name</label>
                <input name="name" className="input" required placeholder="Azimjon" />
              </div>
              <div>
                <label className="label">Role in household</label>
                <select name="role" className="input" defaultValue="HUSBAND">
                  <option value="HUSBAND">Husband</option>
                  <option value="WIFE">Wife</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              className="input"
              required
              minLength={mode === "register" ? 8 : undefined}
              placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
            />
          </div>
          {mode === "register" && (
            <>
              <div>
                <label className="label">Household name (optional)</label>
                <input name="householdName" className="input" placeholder="Our household" />
              </div>
              <div>
                <label className="label">Joining your partner? Household code (optional)</label>
                <input name="householdId" className="input" placeholder="Leave blank to start fresh" />
                <p className="text-xs text-[var(--muted)] mt-1">
                  Your partner can find this code on the dashboard after signing in.
                </p>
              </div>
            </>
          )}

          {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-[var(--muted)] mt-4 text-center">
          {mode === "login" ? (
            <>New here? <Link href="/register" className="text-[var(--primary)] font-medium">Create an account</Link></>
          ) : (
            <>Already have an account? <Link href="/login" className="text-[var(--primary)] font-medium">Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
