import type { StreakStats } from "@/lib/types";

export function StreakPanel({ stats }: { stats: StreakStats }) {
  return (
    <section className="streak-panel" aria-label="連続記録">
      <div className="streak-main">
        <p className="streak-label">連続日数</p>
        <p className="streak-value">
          <span className="streak-number">{stats.current}</span>
          <span className="streak-unit">日</span>
        </p>
      </div>
      <dl className="streak-side">
        <div>
          <dt>最長</dt>
          <dd>{stats.longest}日</dd>
        </div>
        <div>
          <dt>累計日数</dt>
          <dd>{stats.totalDays}日</dd>
        </div>
      </dl>
    </section>
  );
}
