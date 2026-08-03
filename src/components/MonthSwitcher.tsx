"use client";

import { shiftMonth } from "@/lib/dates";
import { useLanguage } from "./LanguageProvider";

export default function MonthSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const { monthLabel } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <button className="btn btn-ghost" onClick={() => onChange(shiftMonth(value, -1))} aria-label="Previous month">
        ←
      </button>
      <span className="font-semibold min-w-[9.5rem] text-center">{monthLabel(value)}</span>
      <button className="btn btn-ghost" onClick={() => onChange(shiftMonth(value, 1))} aria-label="Next month">
        →
      </button>
    </div>
  );
}
