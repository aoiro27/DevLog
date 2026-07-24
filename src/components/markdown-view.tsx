"use client";

import {
  Children,
  isValidElement,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { MermaidDiagram } from "@/components/mermaid-diagram";

type CodeProps = ComponentProps<"code">;

function MarkdownCode({ className, children, ...props }: CodeProps) {
  const language = /language-([\w-]+)/.exec(className ?? "")?.[1];
  const text = String(children).replace(/\n$/, "");

  if (language === "mermaid") {
    return <MermaidDiagram chart={text} />;
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];
  if (isValidElement(child) && child.type === MermaidDiagram) {
    return child;
  }
  return <pre>{children}</pre>;
}

export function MarkdownView({ content }: { content: string }) {
  const source = useMemo(() => content || "", [content]);

  if (!source.trim()) {
    return <p className="empty-state">プレビューする内容がありません。</p>;
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{ code: MarkdownCode, pre: MarkdownPre }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
