"use client";

import { useMemo, useState } from "react";
import type { ThemeNodeTree } from "@/lib/types";

type Props = {
  tree: ThemeNodeTree[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

function TreeItem({
  node,
  selectedId,
  depth,
  onSelect,
}: {
  node: ThemeNodeTree;
  selectedId?: string;
  depth: number;
  onSelect: (id: string) => void;
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
        <button
          type="button"
          className="tree-link"
          onClick={() => onSelect(node.id)}
        >
          {node.title}
        </button>
      </div>
      {hasChildren && open ? (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ThemeTreeNav({ tree, selectedId, onSelect }: Props) {
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
          selectedId={selectedId}
          depth={0}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
