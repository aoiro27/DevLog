"use client";

import { useMemo, useState } from "react";
import { EntryList } from "@/components/entry-list";
import { MonthHeatmap } from "@/components/month-heatmap";
import { SearchPanel } from "@/components/search-panel";
import { StreakPanel } from "@/components/streak-panel";
import { todayInTokyo } from "@/lib/date";
import { calcStreak } from "@/lib/streak";
import { collectTags } from "@/lib/tags";
import type { Entry } from "@/lib/types";

type Props = {
  initialEntries: Entry[];
  allDates: string[];
  allTagsEntries: Pick<Entry, "tags">[];
  q: string;
  tag: string;
  isFiltering: boolean;
};

export function LogJournal({
  initialEntries,
  allDates,
  allTagsEntries,
  q,
  tag,
  isFiltering,
}: Props) {
  const [entries, setEntries] = useState(initialEntries);

  const stats = useMemo(() => calcStreak(allDates), [allDates]);
  const today = todayInTokyo();
  const monthPrefix = today.slice(0, 7);
  const monthDates = useMemo(
    () => [...new Set(allDates.filter((d) => d.startsWith(monthPrefix)))],
    [allDates, monthPrefix],
  );
  const popularTags = useMemo(
    () => collectTags(allTagsEntries),
    [allTagsEntries],
  );

  return (
    <>
      <StreakPanel stats={stats} />

      <div className="two-col" style={{ marginTop: "1.1rem" }}>
        <div className="stack-col">
          <SearchPanel
            q={q}
            tag={tag}
            tags={popularTags}
            resultCount={isFiltering ? entries.length : undefined}
          />
          <section className="panel">
            <h2 className="section-title">
              {isFiltering ? "検索結果" : "すべての記録"}
            </h2>
            <EntryList
              entries={entries}
              activeTag={tag || undefined}
              emptyMessage={
                isFiltering
                  ? "条件に合う記録がありません。"
                  : "まだ記録がありません。"
              }
              onDeleted={(id) =>
                setEntries((prev) => prev.filter((e) => e.id !== id))
              }
            />
          </section>
        </div>
        <MonthHeatmap activeDates={monthDates} />
      </div>
    </>
  );
}
