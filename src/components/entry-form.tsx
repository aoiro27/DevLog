"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createEntry } from "@/app/actions/entries";
import type { ActionState } from "@/app/actions/auth";
import { MarkdownEditor } from "@/components/markdown-editor";

const initial: ActionState = {};
const SOFT_LIMIT = 800;
const HARD_LIMIT = 50000;

export function EntryForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [state, formAction, pending] = useActionState(createEntry, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setTitle("");
      setBody("");
      formRef.current?.reset();
    }
  }, [state.success]);

  const overSoft = body.length > SOFT_LIMIT;

  return (
    <form ref={formRef} action={formAction} className="entry-form">
      <label className="field">
        <span>タイトル</span>
        <input
          type="text"
          name="title"
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
          name="tags"
          maxLength={200}
          placeholder="例: React, Hooks, 詰まったこと"
        />
      </label>

      <div className="field">
        <span>本文</span>
        <MarkdownEditor value={body} onChange={setBody} />
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

      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
    </form>
  );
}
