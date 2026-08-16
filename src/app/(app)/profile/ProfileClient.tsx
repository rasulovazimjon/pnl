"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

interface Profile {
  name: string;
  email: string;
  role: "HUSBAND" | "WIFE";
  telegramUsername: string | null;
  householdName: string;
}

export default function ProfileClient() {
  const { t } = useLanguage();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // profile info form
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api<Profile>("/api/profile")
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setTelegram(p.telegramUsername ? `@${p.telegramUsername}` : "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoMsg(null);
    setSavingInfo(true);
    try {
      const res = await api<{ name: string; telegramUsername: string | null }>("/api/profile", {
        method: "PATCH",
        json: { name, telegramUsername: telegram },
      });
      setTelegram(res.telegramUsername ? `@${res.telegramUsername}` : "");
      setInfoMsg({ ok: true, text: t("profile.saved") });
      router.refresh(); // update the name shown in the header
    } catch (err) {
      setInfoMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: t("profile.passwordMismatch") });
      return;
    }
    setSavingPw(true);
    try {
      await api("/api/profile/password", {
        method: "POST",
        json: { currentPassword: currentPw, newPassword: newPw },
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwMsg({ ok: true, text: t("profile.passwordChanged") });
    } catch (err) {
      setPwMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSavingPw(false);
    }
  }

  if (loading || !profile) {
    return <div className="card p-8 text-center text-[var(--muted-foreground)]">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">{t("profile.title")}</h1>

      {/* Read-only account info */}
      <div className="card p-4 space-y-2">
        <h2 className="font-semibold mb-1">{t("profile.accountInfo")}</h2>
        <InfoRow label={t("profile.email")} value={profile.email} />
        <InfoRow label={t("profile.role")} value={t(`role.${profile.role}`)} />
        <InfoRow label={t("profile.household")} value={profile.householdName} />
      </div>

      {/* Editable: name + telegram */}
      <form onSubmit={saveInfo} className="card p-4 space-y-3">
        <div>
          <label className="label">{t("profile.name")}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">{t("profile.telegram")}</label>
          <input
            className="input"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder={t("profile.telegramPlaceholder")}
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">{t("profile.telegramHint")}</p>
        </div>
        {infoMsg && (
          <p className={`text-sm ${infoMsg.ok ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>{infoMsg.text}</p>
        )}
        <button className="btn btn-primary" disabled={savingInfo}>
          {savingInfo ? "…" : t("common.save")}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={savePassword} className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("profile.changePassword")}</h2>
        <div>
          <label className="label">{t("profile.currentPassword")}</label>
          <input className="input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required autoComplete="current-password" />
        </div>
        <div>
          <label className="label">{t("profile.newPassword")}</label>
          <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label className="label">{t("profile.confirmPassword")}</label>
          <input className="input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required minLength={8} autoComplete="new-password" />
        </div>
        {pwMsg && (
          <p className={`text-sm ${pwMsg.ok ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>{pwMsg.text}</p>
        )}
        <button className="btn btn-primary" disabled={savingPw}>
          {savingPw ? "…" : t("profile.changePassword")}
        </button>
      </form>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm py-1 border-b border-[var(--border)] last:border-0">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
