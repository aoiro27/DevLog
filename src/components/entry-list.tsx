import Link from "next/link";
import { formatJapaneseDate, formatShortTime } from "@/lib/date";
import type { Entry } from "@/lib/types";
import { DeleteEntryButton } from "@/components/delete-entry-button";
import { MarkdownView } from "@/components/markdown-view";

export function EntryList({
  entries,
  emptyMessage = "まだ記録がありません。",
  activeTag,
}: {
  entries: Entry[];
  emptyMessage?: string;
  activeTag?: string;
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
                    <time dateTime={entry.created_at}>
                      {formatShortTime(entry.created_at)}
                    </time>
                  </div>
                  <DeleteEntryButton id={entry.id} />
                </div>
                <h4 className="entry-title">{entry.title}</h4>
                {entry.tags?.length ? (
                  <ul className="tag-list">
                    {entry.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/log?tag=${encodeURIComponent(tag)}`}
                          className={
                            activeTag === tag ? "topic-tag is-active" : "topic-tag"
                          }
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <MarkdownView content={entry.body} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
