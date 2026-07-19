"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeCreateForm } from "@/components/theme-create-form";
import { createClient } from "@/lib/supabase/client";
import type { Theme } from "@/lib/types";

export function ThemesBrowser() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("themes")
      .select("id, user_id, title, summary, status, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setThemes((data ?? []) as Theme[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  const openThemes = themes.filter((t) => t.status === "open");
  const doneThemes = themes.filter((t) => t.status === "done");

  return (
    <main>
      <h1 className="page-heading">調査テーマ</h1>
      <p className="page-sub">
        調べたいことを登録し、結果をツリーで積み上げる
      </p>

      <div className="two-col">
        <section className="panel">
          <h2 className="section-title">新しいテーマ</h2>
          <ThemeCreateForm
            onCreated={() => {
              void reload();
            }}
          />
        </section>

        <section className="panel">
          {loading ? (
            <p className="empty-state">読み込み中…</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : (
            <>
              <h2 className="section-title">調査中（{openThemes.length}）</h2>
              <ThemeList
                themes={openThemes}
                empty="調査中のテーマはありません。"
              />
              {doneThemes.length > 0 ? (
                <>
                  <h2
                    className="section-title"
                    style={{ marginTop: "1.25rem" }}
                  >
                    完了（{doneThemes.length}）
                  </h2>
                  <ThemeList themes={doneThemes} />
                </>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ThemeList({
  themes,
  empty = "まだありません。",
}: {
  themes: Theme[];
  empty?: string;
}) {
  if (themes.length === 0) {
    return <p className="empty-state">{empty}</p>;
  }

  return (
    <ul className="theme-list">
      {themes.map((theme) => (
        <li key={theme.id}>
          <Link href={`/themes/${theme.id}`} className="theme-card-link" prefetch>
            <span className="theme-card-title">{theme.title}</span>
            {theme.summary ? (
              <span className="theme-card-summary">{theme.summary}</span>
            ) : null}
            <span className="theme-card-meta">
              {theme.status === "open" ? "調査中" : "完了"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
