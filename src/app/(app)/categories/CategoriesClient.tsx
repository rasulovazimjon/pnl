"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category, CategoryType } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

const TYPES: { value: CategoryType; labelKey: string }[] = [
  { value: "INCOME", labelKey: "type.income" },
  { value: "COGS", labelKey: "type.cogsFull" },
  { value: "EXPENSE", labelKey: "type.expense" },
];

export default function CategoriesClient() {
  const { t } = useLanguage();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { categories } = await api<{ categories: Category[] }>("/api/categories");
    setCats(categories);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null); setSaving(true);
    try {
      await api("/api/categories", { method: "POST", json: { name, type } });
      setName("");
      await load();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  async function rename(c: Category) {
    const next = prompt(t("cat.renamePrompt"), c.name);
    if (!next || next === c.name) return;
    await api(`/api/categories/${c.id}`, { method: "PATCH", json: { name: next } });
    load();
  }

  async function toggleArchive(c: Category) {
    await api(`/api/categories/${c.id}`, { method: "PATCH", json: { archived: !c.archived } });
    load();
  }

  async function remove(c: Category) {
    if (!confirm(t("cat.confirmDelete", { name: c.name }))) return;
    await api(`/api/categories/${c.id}`, { method: "DELETE" });
    load();
  }

  const visible = cats.filter((c) => showArchived || !c.archived);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("cat.title")}</h1>
        <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          {t("cat.showArchived")}
        </label>
      </div>

      <form onSubmit={add} className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[12rem]">
          <label className="label">{t("cat.new")}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("cat.newPlaceholder")} />
        </div>
        <div>
          <label className="label">{t("cat.type")}</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as CategoryType)}>
            {TYPES.map((ty) => <option key={ty.value} value={ty.value}>{t(ty.labelKey)}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? "…" : t("common.add")}</button>
      </form>

      {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

      {loading ? (
        <div className="card p-8 text-center text-[var(--muted-foreground)]">{t("common.loading")}</div>
      ) : (
        <div className="space-y-5">
          {TYPES.map((ty) => {
            const group = visible.filter((c) => c.type === ty.value);
            if (!group.length) return null;
            return (
              <div key={ty.value} className="card">
                <div className="px-4 py-2 bg-[var(--secondary)] font-semibold text-sm rounded-t-xl">{t(ty.labelKey)}</div>
                <div className="divide-y divide-[var(--border)]">
                  {group.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 px-4 py-2.5">
                      <span className={`flex-1 ${c.archived ? "text-[var(--muted-foreground)] line-through" : ""}`}>{c.name}</span>
                      <button className="btn btn-ghost text-xs" onClick={() => rename(c)}>{t("common.rename")}</button>
                      <button className="btn btn-ghost text-xs" onClick={() => toggleArchive(c)}>{c.archived ? t("cat.unarchive") : t("cat.archive")}</button>
                      <button className="btn btn-danger text-xs" onClick={() => remove(c)}>{t("common.delete")}</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
