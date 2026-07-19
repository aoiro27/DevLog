"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createThemeNode,
  deleteTheme,
  deleteThemeNode,
  updateTheme,
  updateThemeNode,
  type CreateNodeState,
} from "@/app/actions/themes";
import type { ActionState } from "@/app/actions/auth";
import { MarkdownEditor } from "@/components/markdown-editor";
import type { Theme, ThemeNode } from "@/lib/types";

const initial: ActionState = {};
const createInitial: CreateNodeState = {};

export function ThemeMetaForm({ theme }: { theme: Theme }) {
  const [state, formAction, pending] = useActionState(updateTheme, initial);
  const [deleting, startDelete] = useTransition();

  return (
    <form action={formAction} className="entry-form">
      <input type="hidden" name="id" value={theme.id} />
      <label className="field">
        <span>テーマ名</span>
        <input
          type="text"
          name="title"
          required
          maxLength={120}
          defaultValue={theme.title}
        />
      </label>
      <label className="field">
        <span>概要</span>
        <textarea
          name="summary"
          rows={4}
          maxLength={2000}
          defaultValue={theme.summary}
        />
      </label>
      <label className="field">
        <span>状態</span>
        <select
          name="status"
          defaultValue={theme.status}
          className="select-input"
        >
          <option value="open">調査中</option>
          <option value="done">一段落</option>
        </select>
      </label>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
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
              await deleteTheme(theme.id);
            });
          }}
        >
          {deleting ? "削除中…" : "テーマを削除"}
        </button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "保存中…" : "テーマを保存"}
        </button>
      </div>
    </form>
  );
}

export function NodeCreateForm({
  themeId,
  parentId,
  parentTitle,
}: {
  themeId: string;
  parentId?: string | null;
  parentTitle?: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [state, formAction, pending] = useActionState(
    createThemeNode,
    createInitial,
  );

  useEffect(() => {
    if (state.success && state.id) {
      router.replace(`/themes/${themeId}?node=${state.id}`);
      router.refresh();
    }
  }, [state, themeId, router]);

  return (
    <form action={formAction} className="entry-form">
      <input type="hidden" name="theme_id" value={themeId} />
      {parentId ? (
        <input type="hidden" name="parent_id" value={parentId} />
      ) : null}
      <p className="md-hint">
        {parentId
          ? `「${parentTitle}」の子として追加`
          : "テーマ直下のルートノードとして追加"}
      </p>
      <label className="field">
        <span>タイトル</span>
        <input
          type="text"
          name="title"
          required
          maxLength={120}
          placeholder="例: App Router の fetch キャッシュ"
        />
      </label>
      <div className="field">
        <span>調査メモ（Markdown）</span>
        <MarkdownEditor value={body} onChange={setBody} />
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "追加中…" : "ノードを追加"}
      </button>
    </form>
  );
}

export function NodeEditor({
  themeId,
  node,
}: {
  themeId: string;
  node: ThemeNode;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(node.title);
  const [body, setBody] = useState(node.body);
  const [state, formAction, pending] = useActionState(updateThemeNode, initial);
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    setTitle(node.title);
    setBody(node.body);
  }, [node.id, node.title, node.body]);

  return (
    <form action={formAction} className="entry-form">
      <input type="hidden" name="id" value={node.id} />
      <input type="hidden" name="theme_id" value={themeId} />
      <label className="field">
        <span>タイトル</span>
        <input
          type="text"
          name="title"
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
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}
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
              const result = await deleteThemeNode(node.id, themeId);
              if (!result.error) {
                router.replace(`/themes/${themeId}`);
                router.refresh();
              }
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
