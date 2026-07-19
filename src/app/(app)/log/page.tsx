import { EntryList } from "@/components/entry-list";
import { MonthHeatmap } from "@/components/month-heatmap";
import { StreakPanel } from "@/components/streak-panel";
import { todayInTokyo } from "@/lib/date";
import { calcStreak } from "@/lib/streak";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types";

export default async function LogPage() {
  const supabase = await createClient();
  const today = todayInTokyo();

  const { data } = await supabase
    .from("entries")
    .select("*")
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  const entries = (data ?? []) as Entry[];
  const dates = entries.map((e) => e.logged_on);
  const stats = calcStreak(dates);
  const monthPrefix = today.slice(0, 7);
  const monthDates = [...new Set(dates.filter((d) => d.startsWith(monthPrefix)))];

  return (
    <main>
      <h1 className="page-heading">履歴</h1>
      <p className="page-sub">積み上げた学びを、日付ごとに振り返る</p>

      <StreakPanel stats={stats} />

      <div className="two-col" style={{ marginTop: "1.1rem" }}>
        <section className="panel">
          <h2 className="section-title">すべての記録</h2>
          <EntryList entries={entries} />
        </section>
        <MonthHeatmap activeDates={monthDates} />
      </div>
    </main>
  );
}
