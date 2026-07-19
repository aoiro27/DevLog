"use client";

import { useMemo, useState } from "react";
import { EntryForm } from "@/components/entry-form";
import { EntryList } from "@/components/entry-list";
import { MonthHeatmap } from "@/components/month-heatmap";
import { StreakPanel } from "@/components/streak-panel";
import { formatJapaneseDate, todayInTokyo } from "@/lib/date";
import { calcStreak } from "@/lib/streak";
import type { Entry } from "@/lib/types";

type Props = {
  initialTodays: Entry[];
  initialDates: string[];
};

export function TodayJournal({ initialTodays, initialDates }: Props) {
  const [todays, setTodays] = useState(initialTodays);
  const [dates, setDates] = useState(initialDates);
  const today = todayInTokyo();

  const stats = useMemo(() => calcStreak(dates), [dates]);
  const monthPrefix = today.slice(0, 7);
  const monthDates = useMemo(
    () => [...new Set(dates.filter((d) => d.startsWith(monthPrefix)))],
    [dates, monthPrefix],
  );

  return (
    <>
      <StreakPanel stats={stats} />

      <div className="two-col" style={{ marginTop: "1.1rem" }}>
        <section className="panel">
          <h2 className="section-title">書く</h2>
          <EntryForm
            onCreated={(entry) => {
              setTodays((prev) => [entry, ...prev]);
              setDates((prev) =>
                prev.includes(entry.logged_on)
                  ? prev
                  : [...prev, entry.logged_on],
              );
            }}
          />
        </section>

        <MonthHeatmap activeDates={monthDates} />
      </div>

      <section className="panel" style={{ marginTop: "1.1rem" }}>
        <h2 className="section-title">今日の記録</h2>
        <EntryList
          entries={todays}
          defaultExpanded
          emptyMessage="まだ今日の記録はありません。上の欄に1行書いてみましょう。"
          onDeleted={(id) => {
            setTodays((prev) => {
              const next = prev.filter((e) => e.id !== id);
              if (next.length === 0) {
                setDates((d) => d.filter((day) => day !== today));
              }
              return next;
            });
          }}
        />
      </section>
    </>
  );
}

export function TodayHeading() {
  return (
    <>
      <h1 className="page-heading">今日のログ</h1>
      <p className="page-sub">
        {formatJapaneseDate(todayInTokyo())} · 小さくていいから残す
      </p>
    </>
  );
}
