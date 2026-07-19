"use client";

import {
  useCallback,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { MarkdownView } from "@/components/markdown-view";

type Mode = "write" | "preview";

const ACCEPT = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
}

export function MarkdownEditor({
  name = "body",
  value,
  onChange,
  placeholder,
}: Props) {
  const [mode, setMode] = useState<Mode>("write");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const el = textareaRef.current;
      if (!el) {
        onChange(value ? `${value}\n${snippet}` : snippet);
        return;
      }

      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
      onChange(next);

      requestAnimationFrame(() => {
        el.focus();
        const pos = start + snippet.length;
        el.setSelectionRange(pos, pos);
      });
    },
    [onChange, value],
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!ACCEPT.has(file.type)) {
        setUploadError("PNG / JPEG / GIF / WebP のみ対応しています。");
        return;
      }
      if (file.size > MAX_BYTES) {
        setUploadError("画像は 5MB 以下にしてください。");
        return;
      }

      setUploading(true);
      setUploadError(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setUploadError("画像アップロードにはログインが必要です。");
          return;
        }

        const ext = extFromMime(file.type);
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("entry-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadErr) {
          setUploadError(
            uploadErr.message.includes("Bucket not found")
              ? "画像用バケットが未作成です。マイグレーションを実行してください。"
              : uploadErr.message,
          );
          return;
        }

        const { data } = supabase.storage
          .from("entry-images")
          .getPublicUrl(path);

        const alt = file.name.replace(/\.[^.]+$/, "") || "image";
        insertAtCursor(`![${alt}](${data.publicUrl})`);
        setMode("write");
      } catch (e) {
        setUploadError(
          e instanceof Error ? e.message : "アップロードに失敗しました。",
        );
      } finally {
        setUploading(false);
      }
    },
    [insertAtCursor],
  );

  const onPaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await uploadImage(file);
        return;
      }
    }
  };

  const onDrop = async (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      await uploadImage(file);
    }
  };

  return (
    <div className="md-editor">
      <div className="md-editor-toolbar">
        <div className="md-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "write"}
            className={mode === "write" ? "is-active" : undefined}
            onClick={() => setMode("write")}
          >
            書く
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            className={mode === "preview" ? "is-active" : undefined}
            onClick={() => setMode("preview")}
          >
            プレビュー
          </button>
        </div>
        <label className="md-upload-btn">
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            hidden
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
              e.target.value = "";
            }}
          />
          {uploading ? "アップロード中…" : "画像を挿入"}
        </label>
      </div>

      {/* プレビュー時も form に値が送られるようにする */}
      <input type="hidden" name={name} value={value} />

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          rows={14}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPaste}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          placeholder={
            placeholder ??
            "Markdown で書けます。画像はペーストまたはドロップで挿入。"
          }
          className="md-textarea"
        />
      ) : (
        <div className="md-preview-pane">
          <MarkdownView content={value} />
        </div>
      )}

      <p className="md-hint">
        Markdown 対応 · クリップボードの画像をそのまま貼り付け可
        {uploading ? " · 画像をアップロード中…" : ""}
      </p>
      {uploadError ? <p className="form-error">{uploadError}</p> : null}
    </div>
  );
}
