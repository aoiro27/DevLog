"use client";

import { useActionState } from "react";
import { createTheme } from "@/app/actions/themes";
import type { ActionState } from "@/app/actions/auth";

const initial: ActionState = {};

export function ThemeCreateForm() {
  const [state, formAction, pending] = useActionState(createTheme, initial);

  return (
    <form action={formAction} className="entry-form">
      <label className="field">
        <span>調べたいテーマ</span>
        <input
          type="text"
          name="title"
          required
          maxLength={120}
          placeholder="例: Next.js のキャッシュ戦略"
        />
      </label>
      <label className="field">
        <span>いま分かっていること・調べたいこと（任意）</span>
        <textarea
          name="summary"
          rows={4}
          maxLength={2000}
          placeholder="なぜ調べたいか、分かっている範囲を短く。"
        />
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "作成中…" : "テーマを登録"}
      </button>
    </form>
  );
}
