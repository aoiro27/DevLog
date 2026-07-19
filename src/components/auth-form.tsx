"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type ActionState } from "@/app/actions/auth";

const initial: ActionState = {};

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="auth-panel">
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={mode === "signin" ? "is-active" : undefined}
          onClick={() => setMode("signin")}
        >
          ログイン
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "is-active" : undefined}
          onClick={() => setMode("signup")}
        >
          新規登録
        </button>
      </div>

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
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            placeholder="6文字以上"
          />
        </label>

        {state.error ? <p className="form-error">{state.error}</p> : null}
        {state.success ? <p className="form-success">{state.success}</p> : null}

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending
            ? "処理中…"
            : mode === "signin"
              ? "ログインして書く"
              : "アカウントを作る"}
        </button>
      </form>

      <p className="auth-note">
        完璧なメモは不要です。1行でも、今日の積み上げになります。
      </p>
    </div>
  );
}
