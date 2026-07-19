"use client";

import { useEffect, useMemo, useState } from "react";
import { EntryForm } from "@/components/entry-form";
import { EntryList } from "@/components/entry-list";
import { MonthHeatmap } from "@/components/month-heatmap";
import { StreakPanel } from "@/components/streak-panel";
import { formatJapaneseDate, todayInTokyo } from "@/lib/date";
import { calcStreak } from "@/lib/streak";
import { createClient } from "@/lib/supabase/client";
import type { Entry } from "@/lib/types";

export function TodayJournal() {
  const today = todayInTokyo();
  const [todays, setTodays] = useState<Entry[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void Promise.all([
      supabase.from("entries").select("logged_on"),
      supabase
        .from("entries")
        .select("*")
        .eq("logged_on", today)
        .order("created_at", { ascending: false }),
    ]).then(([datesRes, todaysRes]) => {
      setDates([
        ...new Set((datesRes.data ?? []).map((r) => r.logged_on as string)),
      ]);
      setTodays((todaysRes.data ?? []) as Entry[]);
      setLoading(false);
    });
  }, [today]);

  const stats = useMemo(() => calcStreak(dates), [dates]);
  const monthPrefix = today.slice(0, 7);
  const monthDates = useMemo(
    () => [...new Set(dates.filter((d) => d.startsWith(monthPrefix)))],
    [dates, monthPrefix],
  );

  return (
    <main>
      <h1 className="page-heading">ログを残す</h1>
      <p className="page-sub">{formatJapaneseDate(today)}</p>

      {loading ? (
        <p className="empty-state">読み込み中…</p>
      ) : (
        <>
          <StreakPanel stats={stats} />

          <div className="two-col" style={{ marginTop: "1.1rem" }}>
            <section className="panel">
              <h2 className="section-title">新規</h2>
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
            <h2 className="section-title">今日のログ</h2>
            <EntryList
              entries={todays}
              defaultExpanded
              emptyMessage="まだありません。"
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
      )}
    </main>
  );
}
