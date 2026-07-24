"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import type { ThemeNodeTree } from "@/lib/types";

type Props = {
  tree: ThemeNodeTree[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
};

function SortableTreeItem({
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
  const childIds = useMemo(
    () => node.children.map((child) => child.id),
    [node.children],
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? "tree-item is-dragging" : "tree-item"}
    >
      <div
        className={isSelected ? "tree-row is-selected" : "tree-row"}
        style={{ paddingLeft: `${0.35 + depth * 0.95}rem` }}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="tree-drag-handle"
          aria-label={`「${node.title}」を並べ替え`}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        {hasChildren ? (
          <button
            type="button"
            className="tree-toggle"
            aria-label={open ? "折りたたむ" : "展開する"}
            onClick={() => setOpen((value) => !value)}
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
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          <ul className="tree-children">
            {node.children.map((child) => (
              <SortableTreeItem
                key={child.id}
                node={child}
                selectedId={selectedId}
                depth={depth + 1}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </SortableContext>
      ) : null}
    </li>
  );
}

export function ThemeTreeNav({
  tree,
  selectedId,
  onSelect,
  onReorder,
}: Props) {
  const rootIds = useMemo(() => tree.map((node) => node.id), [tree]);
  const empty = useMemo(() => tree.length === 0, [tree]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    onReorder(String(active.id), String(over.id));
  };

  if (empty) {
    return <p className="empty-state">ノードがありません。</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
        <ul className="theme-tree">
          {tree.map((node) => (
            <SortableTreeItem
              key={node.id}
              node={node}
              selectedId={selectedId}
              depth={0}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
