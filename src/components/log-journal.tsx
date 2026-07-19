"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EntryList } from "@/components/entry-list";
import { MonthHeatmap } from "@/components/month-heatmap";
import { SearchPanel } from "@/components/search-panel";
import { StreakPanel } from "@/components/streak-panel";
import { todayInTokyo } from "@/lib/date";
import { calcStreak } from "@/lib/streak";
import { collectTags } from "@/lib/tags";
import { createClient } from "@/lib/supabase/client";
import type { Entry } from "@/lib/types";

type EntryRow = Omit<Entry, "body"> & { body?: string };

export function LogJournal() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const tag = (searchParams.get("tag") ?? "").trim();
  const isFiltering = Boolean(q || tag);

  const [allEntries, setAllEntries] = useState<EntryRow[]>([]);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function run() {
      setLoading(true);

      const { data: recent } = await supabase
        .from("entries")
        .select("id, user_id, title, tags, logged_on, created_at, updated_at")
        .order("logged_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(500);

      if (cancelled) return;
      const base = (recent ?? []) as EntryRow[];
      setAllEntries(base);

      if (!q && !tag) {
        setEntries(base);
        setLoading(false);
        return;
      }

      const { data: found, error } = await supabase.rpc("search_my_entries", {
        search_query: q || null,
        tag_filter: tag || null,
      });

      if (cancelled) return;

      if (error) {
        const needle = q.toLowerCase();
        setEntries(
          base.filter((entry) => {
            const tagOk = !tag || (entry.tags ?? []).includes(tag);
            if (!tagOk) return false;
            if (!needle) return true;
            const inTitle = entry.title?.toLowerCase().includes(needle);
            const inTags = (entry.tags ?? []).some((t) =>
              t.toLowerCase().includes(needle),
            );
            return inTitle || inTags;
          }),
        );
      } else {
        setEntries((found ?? []) as Entry[]);
      }
      setLoading(false);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [q, tag]);

  const dates = useMemo(
    () => allEntries.map((e) => e.logged_on),
    [allEntries],
  );
  const stats = useMemo(() => calcStreak(dates), [dates]);
  const today = todayInTokyo();
  const monthPrefix = today.slice(0, 7);
  const monthDates = useMemo(
    () => [...new Set(dates.filter((d) => d.startsWith(monthPrefix)))],
    [dates, monthPrefix],
  );
  const popularTags = useMemo(() => collectTags(allEntries), [allEntries]);

  return (
    <main className="page-log">
      <h1 className="page-heading">これまでのログ</h1>

      {loading ? (
        <p className="empty-state">読み込み中…</p>
      ) : (
        <>
          <StreakPanel stats={stats} />

          <div className="log-tools" style={{ marginTop: "1.1rem" }}>
            <SearchPanel
              q={q}
              tag={tag}
              tags={popularTags}
              resultCount={isFiltering ? entries.length : undefined}
            />
            <MonthHeatmap activeDates={monthDates} />
          </div>

          <section className="panel panel-log-entries" style={{ marginTop: "1.1rem" }}>
                <h2 className="section-title">
                  {isFiltering ? "検索結果" : "一覧"}
                </h2>
            <EntryList
              entries={entries as Entry[]}
              activeTag={tag || undefined}
              emptyMessage={
                isFiltering
                  ? "条件に合うログがありません。"
                  : "まだログがありません。"
              }
              onDeleted={(id) => {
                setEntries((prev) => prev.filter((e) => e.id !== id));
                setAllEntries((prev) => prev.filter((e) => e.id !== id));
              }}
            />
          </section>
        </>
      )}
    </main>
  );
}
