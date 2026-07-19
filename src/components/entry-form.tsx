"use client";

import { useState, useTransition } from "react";
import { todayInTokyo } from "@/lib/date";
import { parseTags } from "@/lib/tags";
import { createClient } from "@/lib/supabase/client";
import { MarkdownEditor } from "@/components/markdown-editor";
import type { Entry } from "@/lib/types";

const SOFT_LIMIT = 800;
const HARD_LIMIT = 50000;

type Props = {
  onCreated?: (entry: Entry) => void;
};

export function EntryForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const overSoft = body.length > SOFT_LIMIT;

  return (
    <form
      className="entry-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const nextTitle = title.trim();
        const nextBody = body.trim();
        const nextTags = parseTags(tags);

        if (!nextTitle) {
          setError("タイトルを入力してください。");
          return;
        }
        if (!nextBody) {
          setError("本文を1文字以上書いてください。");
          return;
        }
        if (nextBody.length > HARD_LIMIT) {
          setError(`${HARD_LIMIT}文字以内にしてください。`);
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

          const payload = {
            user_id: user.id,
            title: nextTitle,
            body: nextBody,
            tags: nextTags,
            logged_on: todayInTokyo(),
          };

          const { data, error: insertError } = await supabase
            .from("entries")
            .insert(payload)
            .select("*")
            .single();

          if (insertError || !data) {
            setError(insertError?.message ?? "保存に失敗しました。");
            return;
          }

          setTitle("");
          setTags("");
          setBody("");
          setSuccess(
            nextBody.length <= SOFT_LIMIT
              ? "残しました。また明日も小さく。"
              : "残しました。長くても大丈夫、続ければ資産になる。",
          );
          onCreated?.(data as Entry);
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
          placeholder="例: useEffect の依存配列でハマった"
        />
      </label>

      <label className="field">
        <span>タグ（任意・カンマ区切り）</span>
        <input
          type="text"
          maxLength={200}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="例: React, Hooks, 詰まったこと"
        />
      </label>

      <div className="field">
        <span>本文</span>
        <MarkdownEditor value={body} onChange={setBody} name="body-editor" />
      </div>

      <div className="entry-meta">
        <span className={overSoft ? "char-count is-soft" : "char-count"}>
          {body.length} / {HARD_LIMIT}
          {overSoft ? " · 長くてもOK" : " · 目安は短めで十分"}
        </span>
        <button
          type="submit"
          className="btn-primary"
          disabled={pending || !title.trim() || !body.trim()}
        >
          {pending ? "保存中…" : "今日の分を残す"}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-success">{success}</p> : null}
    </form>
  );
}
