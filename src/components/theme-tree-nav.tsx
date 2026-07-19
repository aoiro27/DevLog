"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ThemeNodeTree } from "@/lib/types";

type Props = {
  themeId: string;
  tree: ThemeNodeTree[];
  selectedId?: string;
};

function TreeItem({
  node,
  themeId,
  selectedId,
  depth,
}: {
  node: ThemeNodeTree;
  themeId: string;
  selectedId?: string;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <li>
      <div
        className={isSelected ? "tree-row is-selected" : "tree-row"}
        style={{ paddingLeft: `${0.35 + depth * 0.95}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="tree-toggle"
            aria-label={open ? "折りたたむ" : "展開する"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "▼" : "▶"}
          </button>
        ) : (
          <span className="tree-toggle is-leaf" aria-hidden>
            ·
          </span>
        )}
        <Link
          href={`/themes/${themeId}?node=${node.id}`}
          className="tree-link"
        >
          {node.title}
        </Link>
      </div>
      {hasChildren && open ? (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              themeId={themeId}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ThemeTreeNav({ themeId, tree, selectedId }: Props) {
  const empty = useMemo(() => tree.length === 0, [tree]);

  if (empty) {
    return (
      <p className="empty-state">
        まだ調査メモがありません。右のフォームから最初のノードを追加してください。
      </p>
    );
  }

  return (
    <ul className="theme-tree">
      {tree.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          themeId={themeId}
          selectedId={selectedId}
          depth={0}
        />
      ))}
    </ul>
  );
}
