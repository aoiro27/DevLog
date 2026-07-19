import { EntryList } from "@/components/entry-list";
import { MonthHeatmap } from "@/components/month-heatmap";
import { SearchPanel } from "@/components/search-panel";
import { StreakPanel } from "@/components/streak-panel";
import { todayInTokyo } from "@/lib/date";
import { calcStreak } from "@/lib/streak";
import { collectTags } from "@/lib/tags";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types";

type Props = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export default async function LogPage({ searchParams }: Props) {
  const { q: rawQ, tag: rawTag } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const tag = rawTag?.trim() ?? "";
  const isFiltering = Boolean(q || tag);

  const supabase = await createClient();
  const today = todayInTokyo();

  // ストリーク・タグ一覧用に直近を取得
  const { data: recent } = await supabase
    .from("entries")
    .select("*")
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  const allEntries = (recent ?? []) as Entry[];
  const dates = allEntries.map((e) => e.logged_on);
  const stats = calcStreak(dates);
  const monthPrefix = today.slice(0, 7);
  const monthDates = [
    ...new Set(dates.filter((d) => d.startsWith(monthPrefix))),
  ];
  const popularTags = collectTags(allEntries);

  let entries = allEntries;

  if (isFiltering) {
    const { data: found, error } = await supabase.rpc("search_my_entries", {
      search_query: q || null,
      tag_filter: tag || null,
    });

    if (error) {
      // RPC 未適用時のフォールバック（クライアント側フィルタ）
      const needle = q.toLowerCase();
      entries = allEntries.filter((entry) => {
        const tagOk = !tag || (entry.tags ?? []).includes(tag);
        if (!tagOk) return false;
        if (!needle) return true;
        const inTitle = entry.title?.toLowerCase().includes(needle);
        const inBody = entry.body.toLowerCase().includes(needle);
        const inTags = (entry.tags ?? []).some((t) =>
          t.toLowerCase().includes(needle),
        );
        return inTitle || inBody || inTags;
      });
    } else {
      entries = (found ?? []) as Entry[];
    }
  }

  return (
    <main>
      <h1 className="page-heading">履歴</h1>
      <p className="page-sub">タイトル・本文・タグから振り返る</p>

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
            />
          </section>
        </div>
        <MonthHeatmap activeDates={monthDates} />
      </div>
    </main>
  );
}
