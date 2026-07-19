"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function ThemeCreateForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
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
          setError("テーマ名を入力してください。");
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
            .from("themes")
            .insert({
              user_id: user.id,
              title: nextTitle,
              summary: summary.trim(),
            })
            .select("id")
            .single();

          if (insertError || !data) {
            setError(insertError?.message ?? "作成に失敗しました。");
            return;
          }

          onCreated?.();
          router.push(`/themes/${data.id}`);
        });
      }}
    >
      <label className="field">
        <span>調べたいテーマ</span>
        <input
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: Next.js のキャッシュ戦略"
        />
      </label>
      <label className="field">
        <span>いま分かっていること・調べたいこと（任意）</span>
        <textarea
          rows={4}
          maxLength={2000}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="概要"
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "作成中…" : "テーマを登録"}
      </button>
    </form>
  );
}
