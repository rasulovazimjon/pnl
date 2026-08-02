"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Household {
  id: string;
  name: string;
  members: { name: string; role: "HUSBAND" | "WIFE" }[];
}

const ROLE_LABEL = { HUSBAND: "Husband", WIFE: "Wife" };

export default function HouseholdCard() {
  const [hh, setHh] = useState<Household | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<Household>("/api/household").then(setHh).catch(() => {});
  }, []);

  if (!hh) return null;
  const bothJoined = hh.members.length >= 2;

  async function copy() {
    try {
      await navigator.clipboard.writeText(hh!.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard may be blocked; the code is still visible */ }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{hh.name}</h2>
        <div className="flex gap-1">
          {hh.members.map((m) => (
            <span key={m.role} className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
              {ROLE_LABEL[m.role]}: {m.name}
            </span>
          ))}
        </div>
      </div>

      {!bothJoined && (
        <div className="mt-3">
          <p className="text-sm text-[var(--muted)] mb-1">
            Invite your partner: share this household code so they can join the same books.
          </p>
          <div className="flex items-center gap-2">
            <code className="input flex-1 text-xs truncate select-all">{hh.id}</code>
            <button className="btn btn-ghost" onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
