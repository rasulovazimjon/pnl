"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category, CategoryType } from "@/lib/types";

const TYPES: { value: CategoryType; label: string }[] = [
  { value: "INCOME", label: "Income" },
  { value: "COGS", label: "Cost of goods sold" },
  { value: "EXPENSE", label: "Expense" },
];

export default function CategoriesClient() {
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
    const next = prompt("Rename category", c.name);
    if (!next || next === c.name) return;
    await api(`/api/categories/${c.id}`, { method: "PATCH", json: { name: next } });
    load();
  }

  async function toggleArchive(c: Category) {
    await api(`/api/categories/${c.id}`, { method: "PATCH", json: { archived: !c.archived } });
    load();
  }

  async function remove(c: Category) {
    if (!confirm(`Delete "${c.name}"? If it has transactions it will be archived instead.`)) return;
    await api(`/api/categories/${c.id}`, { method: "DELETE" });
    load();
  }

  const visible = cats.filter((c) => showArchived || !c.archived);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Categories</h1>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      <form onSubmit={add} className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[12rem]">
          <label className="label">New category</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gym membership" />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as CategoryType)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? "…" : "Add"}</button>
      </form>

      {error && <p className="text-sm text-[var(--expense)]">{error}</p>}

      {loading ? (
        <div className="card p-8 text-center text-[var(--muted)]">Loading…</div>
      ) : (
        <div className="space-y-5">
          {TYPES.map((t) => {
            const group = visible.filter((c) => c.type === t.value);
            if (!group.length) return null;
            return (
              <div key={t.value} className="card">
                <div className="px-4 py-2 bg-[var(--surface-2)] font-semibold text-sm rounded-t-xl">{t.label}</div>
                <div className="divide-y divide-[var(--border)]">
                  {group.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 px-4 py-2.5">
                      <span className={`flex-1 ${c.archived ? "text-[var(--muted)] line-through" : ""}`}>{c.name}</span>
                      <button className="btn btn-ghost text-xs" onClick={() => rename(c)}>Rename</button>
                      <button className="btn btn-ghost text-xs" onClick={() => toggleArchive(c)}>{c.archived ? "Unarchive" : "Archive"}</button>
                      <button className="btn btn-danger text-xs" onClick={() => remove(c)}>Delete</button>
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
