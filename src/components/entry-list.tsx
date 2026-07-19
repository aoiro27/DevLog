import { formatJapaneseDate, formatShortTime } from "@/lib/date";
import type { Entry } from "@/lib/types";
import { DeleteEntryButton } from "@/components/delete-entry-button";
import { MarkdownView } from "@/components/markdown-view";

export function EntryList({
  entries,
  emptyMessage = "まだ記録がありません。",
}: {
  entries: Entry[];
  emptyMessage?: string;
}) {
  if (entries.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  const grouped = entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    (acc[entry.logged_on] ??= []).push(entry);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="entry-groups">
      {days.map((day) => (
        <section key={day} className="entry-day">
          <h3 className="entry-day-title">{formatJapaneseDate(day)}</h3>
          <ul className="entry-list">
            {grouped[day].map((entry) => (
              <li key={entry.id} className="entry-item">
                <div className="entry-item-head">
                  <div className="entry-item-meta">
                    {entry.topic ? (
                      <span className="topic-tag">{entry.topic}</span>
                    ) : null}
                    <time dateTime={entry.created_at}>
                      {formatShortTime(entry.created_at)}
                    </time>
                  </div>
                  <DeleteEntryButton id={entry.id} />
                </div>
                <MarkdownView content={entry.body} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
