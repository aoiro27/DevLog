const MAX_TAG_LENGTH = 30;
const MAX_TAGS = 10;

/** カンマ・読点・空白区切りのタグ文字列を配列にする */
export function parseTags(raw: string): string[] {
  const parts = raw
    .split(/[,、\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.slice(0, MAX_TAG_LENGTH));

  return [...new Set(parts)].slice(0, MAX_TAGS);
}

export function formatTagsInput(tags: string[]): string {
  return tags.join(", ");
}

/** エントリ群から出現頻度順のタグ一覧 */
export function collectTags(entries: { tags: string[] | null }[]): string[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .map(([tag]) => tag);
}
