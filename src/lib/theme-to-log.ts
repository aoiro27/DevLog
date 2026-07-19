import type { Theme, ThemeNodeTree } from "@/lib/types";

/** テーマ＋ツリーを日次ログ用 Markdown にまとめる */
export function themeToLogMarkdown(
  theme: Theme,
  tree: ThemeNodeTree[],
): string {
  const lines: string[] = [
    `> 調査テーマ「${theme.title}」を完了した記録`,
    "",
  ];

  if (theme.summary.trim()) {
    lines.push("## 概要", "", theme.summary.trim(), "");
  }

  if (tree.length === 0) {
    lines.push("_調査ノードはまだありませんでした。_");
    return lines.join("\n").trim();
  }

  lines.push("## 調査メモ", "");

  const walk = (nodes: ThemeNodeTree[], depth: number) => {
    for (const node of nodes) {
      const headingLevel = Math.min(depth + 3, 6);
      lines.push(`${"#".repeat(headingLevel)} ${node.title}`, "");
      if (node.body.trim()) {
        lines.push(node.body.trim(), "");
      }
      if (node.children.length > 0) {
        walk(node.children, depth + 1);
      }
    }
  };

  walk(tree, 0);
  return lines.join("\n").trim();
}
