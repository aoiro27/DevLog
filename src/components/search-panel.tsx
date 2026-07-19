import Link from "next/link";

type Props = {
  q?: string;
  tag?: string;
  tags?: string[];
  resultCount?: number;
};

export function SearchPanel({ q = "", tag = "", tags = [], resultCount }: Props) {
  return (
    <section className="panel search-panel">
      <h2 className="section-title">検索</h2>
      <form action="/log" method="get" className="search-form">
        <label className="field">
          <span>キーワード</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="タイトル・本文・タグから探す"
            autoComplete="off"
          />
        </label>
        <div className="search-actions">
          <button type="submit" className="btn-primary">
            検索
          </button>
          {q || tag ? (
            <Link href="/log" className="btn-ghost">
              クリア
            </Link>
          ) : null}
        </div>
      </form>

      {typeof resultCount === "number" && (q || tag) ? (
        <p className="search-result-meta">
          {resultCount} 件
          {q ? ` · 「${q}」` : ""}
          {tag ? ` · タグ: ${tag}` : ""}
        </p>
      ) : null}

      {tags.length > 0 ? (
        <div className="tag-cloud">
          <p className="tag-cloud-label">タグから絞り込み</p>
          <ul className="tag-list">
            {tags.map((t) => {
              const href = q
                ? `/log?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(t)}`
                : `/log?tag=${encodeURIComponent(t)}`;
              return (
                <li key={t}>
                  <Link
                    href={href}
                    className={tag === t ? "topic-tag is-active" : "topic-tag"}
                  >
                    {t}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
