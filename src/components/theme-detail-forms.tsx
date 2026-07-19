"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { todayInTokyo } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import { themeToLogMarkdown } from "@/lib/theme-to-log";
import { MarkdownEditor } from "@/components/markdown-editor";
import type { Theme, ThemeNode, ThemeNodeTree } from "@/lib/types";

export function ThemeMetaForm({
  theme,
  tree,
  onUpdated,
}: {
  theme: Theme;
  tree: ThemeNodeTree[];
  onUpdated?: (theme: Theme) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(theme.title);
  const [summary, setSummary] = useState(theme.summary);
  const [status, setStatus] = useState(theme.status);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [linkedToday, setLinkedToday] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    setTitle(theme.title);
    setSummary(theme.summary);
    setStatus(theme.status);
    setLinkedToday(false);
  }, [theme.id, theme.title, theme.summary, theme.status]);

  return (
    <form
      className="entry-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLinkedToday(false);

        const nextTitle = title.trim();
        if (!nextTitle) {
          setError("テーマ名を入力してください。");
          return;
        }

        const becomingComplete =
          theme.status !== "done" && status === "done";

        startTransition(async () => {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            setError("ログインが必要です。");
            return;
          }

          const { data, error: updateError } = await supabase
            .from("themes")
            .update({
              title: nextTitle,
              summary: summary.trim(),
              status,
            })
            .eq("id", theme.id)
            .select("*")
            .single();

          if (updateError || !data) {
            setError(updateError?.message ?? "更新に失敗しました。");
            return;
          }

          const updated = data as Theme;
          onUpdated?.(updated);

          if (!becomingComplete) {
            setSuccess("テーマを更新しました。");
            return;
          }

          // すでにこのテーマから作ったログがあれば再利用（重複防止）
          const { data: existing } = await supabase
            .from("entries")
            .select("id")
            .eq("source_theme_id", theme.id)
            .maybeSingle();

          const body = themeToLogMarkdown(
            { ...updated, title: nextTitle, summary: summary.trim() },
            tree,
          );
          const entryTitle = `調査完了: ${nextTitle}`.slice(0, 120);
          const tags = ["調査完了"];

          if (existing?.id) {
            const { error: entryError } = await supabase
              .from("entries")
              .update({
                title: entryTitle,
                body,
                tags,
                logged_on: todayInTokyo(),
              })
              .eq("id", existing.id);

            if (entryError) {
              setError(
                `完了にはしましたが、ログ更新に失敗しました: ${entryError.message}`,
              );
              return;
            }
            setSuccess("保存しました。ログを更新しました。");
            setLinkedToday(true);
            return;
          }

          const { error: insertError } = await supabase.from("entries").insert({
            user_id: user.id,
            title: entryTitle,
            body,
            tags,
            logged_on: todayInTokyo(),
            source_theme_id: theme.id,
          });

          if (insertError) {
            // マイグレーション未適用時は source_theme_id なしで再試行
            if (insertError.message.includes("source_theme_id")) {
              const { error: fallbackError } = await supabase
                .from("entries")
                .insert({
                  user_id: user.id,
                  title: entryTitle,
                  body,
                  tags,
                  logged_on: todayInTokyo(),
                });
              if (fallbackError) {
                setError(
                  `完了しましたが、ログ作成に失敗しました: ${fallbackError.message}`,
                );
                return;
              }
              setSuccess("保存しました。ログを作成しました。");
              setLinkedToday(true);
              return;
            }
            setError(
              `完了しましたが、ログ作成に失敗しました: ${insertError.message}`,
            );
            return;
          }

          setSuccess("保存しました。ログを作成しました。");
          setLinkedToday(true);
        });
      }}
    >
      <label className="field">
        <span>テーマ名</span>
        <input
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="field">
        <span>概要</span>
        <textarea
          rows={4}
          maxLength={2000}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>
      <label className="field">
        <span>状態</span>
        <select
          className="select-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as Theme["status"])}
        >
          <option value="open">調査中</option>
          <option value="done">完了</option>
        </select>
      </label>
      <p className="md-hint">
        完了にすると、内容を今日のログへ書き出します。
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}
      {linkedToday ? (
        <p className="md-hint">
          <Link href="/today" className="topic-tag">
            今日のログを見る
          </Link>
        </p>
      ) : null}
      <div className="entry-meta">
        <button
          type="button"
          className="btn-ghost"
          disabled={deleting}
          onClick={() => {
            if (
              !confirm("このテーマと配下の調査メモをすべて削除しますか？")
            ) {
              return;
            }
            startDelete(async () => {
              const supabase = createClient();
              const { error: deleteError } = await supabase
                .from("themes")
                .delete()
                .eq("id", theme.id);
              if (!deleteError) router.replace("/themes");
            });
          }}
        >
          {deleting ? "削除中…" : "テーマを削除"}
        </button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending
            ? "保存中…"
            : status === "done" && theme.status !== "done"
              ? "完了して保存"
              : "保存"}
        </button>
      </div>
    </form>
  );
}

export function NodeCreateForm({
  themeId,
  parentId,
  parentTitle,
  onCreated,
}: {
  themeId: string;
  parentId?: string | null;
  parentTitle?: string;
  onCreated?: (node: ThemeNode) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="entry-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const nextTitle = title.trim();
        if (!nextTitle) {
          setError("ノードのタイトルを入力してください。");
          return;
        }

        startTransition(async () => {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            setError("ログインが必要です。");
            return;
          }

          const { data, error: insertError } = await supabase
            .from("theme_nodes")
            .insert({
              theme_id: themeId,
              parent_id: parentId ?? null,
              user_id: user.id,
              title: nextTitle,
              body: body.trim(),
              sort_order: Date.now() % 1000000,
            })
            .select("*")
            .single();

          if (insertError || !data) {
            setError(insertError?.message ?? "追加に失敗しました。");
            return;
          }

          setTitle("");
          setBody("");
          onCreated?.(data as ThemeNode);
        });
      }}
    >
      <p className="md-hint">
        {parentId
          ? `「${parentTitle}」の子として追加`
          : "テーマ直下のルートノードとして追加"}
      </p>
      <label className="field">
        <span>タイトル</span>
        <input
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: App Router の fetch キャッシュ"
        />
      </label>
      <div className="field">
        <span>調査メモ（Markdown）</span>
        <MarkdownEditor value={body} onChange={setBody} />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "追加中…" : "ノードを追加"}
      </button>
    </form>
  );
}

export function NodeEditor({
  themeId,
  node,
  onUpdated,
  onDeleted,
}: {
  themeId: string;
  node: ThemeNode;
  onUpdated?: (node: ThemeNode) => void;
  onDeleted?: (id: string) => void;
}) {
  const [title, setTitle] = useState(node.title);
  const [body, setBody] = useState(node.body);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    setTitle(node.title);
    setBody(node.body);
    setError(null);
    setSuccess(null);
  }, [node.id, node.title, node.body]);

  return (
    <form
      className="entry-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const nextTitle = title.trim();
        if (!nextTitle) {
          setError("タイトルを入力してください。");
          return;
        }

        startTransition(async () => {
          const supabase = createClient();
          const { data, error: updateError } = await supabase
            .from("theme_nodes")
            .update({ title: nextTitle, body: body.trim() })
            .eq("id", node.id)
            .eq("theme_id", themeId)
            .select("*")
            .single();

          if (updateError || !data) {
            setError(updateError?.message ?? "保存に失敗しました。");
            return;
          }
          setSuccess("調査メモを保存しました。");
          onUpdated?.(data as ThemeNode);
        });
      }}
    >
      <label className="field">
        <span>タイトル</span>
        <input
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <div className="field">
        <span>調査メモ（Markdown）</span>
        <MarkdownEditor value={body} onChange={setBody} />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}
      <div className="entry-meta">
        <button
          type="button"
          className="btn-ghost"
          disabled={deleting}
          onClick={() => {
            if (
              !confirm(
                "このノードと配下の子ノードをすべて削除しますか？",
              )
            ) {
              return;
            }
            startDelete(async () => {
              const supabase = createClient();
              const { error: deleteError } = await supabase
                .from("theme_nodes")
                .delete()
                .eq("id", node.id)
                .eq("theme_id", themeId);
              if (!deleteError) onDeleted?.(node.id);
            });
          }}
        >
          {deleting ? "削除中…" : "ノードを削除"}
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending || !title.trim()}
        >
          {pending ? "保存中…" : "メモを保存"}
        </button>
      </div>
    </form>
  );
}
