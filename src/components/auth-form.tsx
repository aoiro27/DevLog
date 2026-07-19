"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/actions/auth";

const initial: ActionState = {};

export function AuthForm() {
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <div className="auth-panel">
      <form action={formAction} className="stack-form">
        <label className="field">
          <span>メールアドレス</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label className="field">
          <span>パスワード</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={6}
            placeholder="パスワード"
          />
        </label>

        {state.error ? <p className="form-error">{state.error}</p> : null}

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "処理中…" : "ログインして書く"}
        </button>
      </form>

      <p className="auth-note">
        個人用アプリです。アカウントの追加はアプリからはできません。
      </p>
    </div>
  );
}
