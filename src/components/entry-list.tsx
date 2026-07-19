"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { formatJapaneseDate, formatShortTime } from "@/lib/date";
import { plainExcerpt } from "@/lib/excerpt";
import type { Entry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { MarkdownView } from "@/components/markdown-view";

export function EntryList({
  entries,
  emptyMessage = "まだ記録がありません。",
  activeTag,
  onDeleted,
  defaultExpanded = false,
}: {
  entries: Entry[];
  emptyMessage?: string;
  activeTag?: string;
  onDeleted?: (id: string) => void;
  defaultExpanded?: boolean;
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
              <EntryItem
                key={entry.id}
                entry={entry}
                activeTag={activeTag}
                onDeleted={onDeleted}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EntryItem({
  entry,
  activeTag,
  onDeleted,
  defaultExpanded,
}: {
  entry: Entry;
  activeTag?: string;
  onDeleted?: (id: string) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [body, setBody] = useState(entry.body ?? "");
  const [loadingBody, setLoadingBody] = useState(false);
  const [pending, startTransition] = useTransition();
  const excerpt = useMemo(
    () => (body ? plainExcerpt(body) : "（展開して本文を表示）"),
    [body],
  );

  const ensureBody = async () => {
    if (body) {
      setExpanded(true);
      return;
    }
    setLoadingBody(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("entries")
      .select("body")
      .eq("id", entry.id)
      .single();
    setBody(data?.body ?? "");
    setLoadingBody(false);
    setExpanded(true);
  };

  return (
    <li className="entry-item">
      <div className="entry-item-head">
        <div className="entry-item-meta">
          <time dateTime={entry.created_at}>
            {formatShortTime(entry.created_at)}
          </time>
        </div>
        <button
          type="button"
          className="btn-ghost"
          disabled={pending}
          onClick={() => {
            if (!confirm("この記録を削除しますか？")) return;
            startTransition(async () => {
              const supabase = createClient();
              const { error } = await supabase
                .from("entries")
                .delete()
                .eq("id", entry.id);
              if (!error) onDeleted?.(entry.id);
            });
          }}
        >
          {pending ? "…" : "削除"}
        </button>
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

      {expanded ? (
        <>
          <MarkdownView content={body} />
          <button
            type="button"
            className="btn-ghost entry-expand"
            onClick={() => setExpanded(false)}
          >
            折りたたむ
          </button>
        </>
      ) : (
        <>
          <p className="entry-excerpt">{excerpt}</p>
          <button
            type="button"
            className="btn-ghost entry-expand"
            disabled={loadingBody}
            onClick={() => {
              void ensureBody();
            }}
          >
            {loadingBody ? "読み込み中…" : "本文を展開"}
          </button>
        </>
      )}
    </li>
  );
}
