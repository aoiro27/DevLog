import { EntryForm } from "@/components/entry-form";
import { EntryList } from "@/components/entry-list";
import { MonthHeatmap } from "@/components/month-heatmap";
import { StreakPanel } from "@/components/streak-panel";
import { formatJapaneseDate, todayInTokyo } from "@/lib/date";
import { calcStreak } from "@/lib/streak";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types";

export default async function TodayPage() {
  const supabase = await createClient();
  const today = todayInTokyo();

  const { data: recent } = await supabase
    .from("entries")
    .select("*")
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  const entries = (recent ?? []) as Entry[];
  const dates = entries.map((e) => e.logged_on);
  const stats = calcStreak(dates);
  const todays = entries.filter((e) => e.logged_on === today);

  const monthPrefix = today.slice(0, 7);
  const monthDates = [...new Set(dates.filter((d) => d.startsWith(monthPrefix)))];

  return (
    <main>
      <h1 className="page-heading">今日のログ</h1>
      <p className="page-sub">{formatJapaneseDate(today)} · 小さくていいから残す</p>

      <StreakPanel stats={stats} />

      <div className="two-col" style={{ marginTop: "1.1rem" }}>
        <section className="panel">
          <h2 className="section-title">書く</h2>
          <EntryForm />
        </section>

        <MonthHeatmap activeDates={monthDates} />
      </div>

      <section className="panel" style={{ marginTop: "1.1rem" }}>
        <h2 className="section-title">今日の記録</h2>
        <EntryList
          entries={todays}
          emptyMessage="まだ今日の記録はありません。上の欄に1行書いてみましょう。"
        />
      </section>
    </main>
  );
}
