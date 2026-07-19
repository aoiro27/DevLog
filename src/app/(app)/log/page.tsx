import { LogJournal } from "@/components/log-journal";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types";

type Props = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

type EntryRow = Omit<Entry, "body"> & { body?: string };

export default async function LogPage({ searchParams }: Props) {
  const { q: rawQ, tag: rawTag } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const tag = rawTag?.trim() ?? "";
  const isFiltering = Boolean(q || tag);

  const supabase = await createClient();

  // 一覧は本文なしで軽量化（展開時に取得）
  const { data: recent } = await supabase
    .from("entries")
    .select("id, user_id, title, tags, logged_on, created_at, updated_at")
    .order("logged_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  const allEntries = (recent ?? []) as EntryRow[];

  let entries: EntryRow[] = allEntries;

  if (isFiltering) {
    const { data: found, error } = await supabase.rpc("search_my_entries", {
      search_query: q || null,
      tag_filter: tag || null,
    });

    if (error) {
      // RPC 未適用時はタイトル・タグのみでフォールバック
      const needle = q.toLowerCase();
      entries = allEntries.filter((entry) => {
        const tagOk = !tag || (entry.tags ?? []).includes(tag);
        if (!tagOk) return false;
        if (!needle) return true;
        const inTitle = entry.title?.toLowerCase().includes(needle);
        const inTags = (entry.tags ?? []).some((t) =>
          t.toLowerCase().includes(needle),
        );
        return inTitle || inTags;
      });
    } else {
      // 検索結果は本文ありだが、一覧表示用に要約だけ使う
      entries = (found ?? []) as Entry[];
    }
  }

  return (
    <main>
      <h1 className="page-heading">履歴</h1>
      <p className="page-sub">タイトル・本文・タグから振り返る</p>
      <LogJournal
        key={`${q}\0${tag}`}
        initialEntries={entries as Entry[]}
        allDates={allEntries.map((e) => e.logged_on)}
        allTagsEntries={allEntries}
        q={q}
        tag={tag}
        isFiltering={isFiltering}
      />
    </main>
  );
}
