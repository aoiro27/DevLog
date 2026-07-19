"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function MarkdownView({ content }: { content: string }) {
  const source = useMemo(() => content || "", [content]);

  if (!source.trim()) {
    return <p className="empty-state">プレビューする内容がありません。</p>;
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
