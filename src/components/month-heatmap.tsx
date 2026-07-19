import { todayInTokyo } from "@/lib/date";

type Props = {
  activeDates: string[];
};

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function MonthHeatmap({ activeDates }: Props) {
  const today = todayInTokyo();
  const [year, month] = today.split("-").map(Number);
  const total = daysInMonth(year, month);
  const active = new Set(activeDates);
  const weekdayOfFirst = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  const cells: Array<{ date: string | null; key: string }> = [];
  for (let i = 0; i < weekdayOfFirst; i += 1) {
    cells.push({ date: null, key: `pad-${i}` });
  }
  for (let day = 1; day <= total; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ date, key: date });
  }

  const monthLabel = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <section className="panel heatmap" aria-label={`${monthLabel}の記録`}>
      <h2 className="section-title">{monthLabel}</h2>
      <div className="heatmap-weekdays" aria-hidden>
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="heatmap-grid">
        {cells.map((cell) => {
          if (!cell.date) {
            return <span key={cell.key} className="heat-cell is-empty" />;
          }
          const isActive = active.has(cell.date);
          const isToday = cell.date === today;
          return (
            <span
              key={cell.key}
              title={cell.date}
              className={[
                "heat-cell",
                isActive ? "is-active" : "",
                isToday ? "is-today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          );
        })}
      </div>
      <p className="heatmap-legend">
        <span className="heat-cell is-active legend-swatch" /> 書いた日
      </p>
    </section>
  );
}
