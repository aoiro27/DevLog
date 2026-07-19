"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createEntry } from "@/app/actions/entries";
import type { ActionState } from "@/app/actions/auth";

const initial: ActionState = {};
const SOFT_LIMIT = 400;
const HARD_LIMIT = 1000;

export function EntryForm() {
  const [body, setBody] = useState("");
  const [state, formAction, pending] = useActionState(createEntry, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setBody("");
      formRef.current?.reset();
    }
  }, [state.success]);

  const overSoft = body.length > SOFT_LIMIT;

  return (
    <form ref={formRef} action={formAction} className="entry-form">
      <label className="field">
        <span>トピック（任意）</span>
        <input
          type="text"
          name="topic"
          maxLength={40}
          placeholder="例: React / SQL / 設計"
        />
      </label>

      <label className="field">
        <span>今日の小さな学び</span>
        <textarea
          name="body"
          required
          rows={7}
          maxLength={HARD_LIMIT}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="今日触ったこと、詰まったこと、分かったことを短く。"
        />
      </label>

      <div className="entry-meta">
        <span className={overSoft ? "char-count is-soft" : "char-count"}>
          {body.length} / {HARD_LIMIT}
          {overSoft ? " · 長くてもOK、続きやすさ優先" : " · 目安 400 字以内"}
        </span>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "保存中…" : "今日の分を残す"}
        </button>
      </div>

      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
    </form>
  );
}
