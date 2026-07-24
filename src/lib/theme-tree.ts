import { arrayMove } from "@dnd-kit/sortable";
import type { ThemeNode, ThemeNodeTree } from "@/lib/types";

function compareNodes(a: ThemeNode, b: ThemeNode) {
  return (
    a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)
  );
}

export function getSiblingIds(
  nodes: ThemeNode[],
  parentId: string | null,
): string[] {
  return nodes
    .filter((node) => node.parent_id === parentId)
    .sort(compareNodes)
    .map((node) => node.id);
}

export function reorderThemeNodeSiblings(
  nodes: ThemeNode[],
  activeId: string,
  overId: string,
): ThemeNode[] | null {
  const active = nodes.find((node) => node.id === activeId);
  const over = nodes.find((node) => node.id === overId);
  if (!active || !over || active.parent_id !== over.parent_id) {
    return null;
  }

  const siblings = nodes
    .filter((node) => node.parent_id === active.parent_id)
    .sort(compareNodes);
  const oldIndex = siblings.findIndex((node) => node.id === activeId);
  const newIndex = siblings.findIndex((node) => node.id === overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return null;
  }

  const reordered = arrayMove(siblings, oldIndex, newIndex);
  const orderMap = new Map(
    reordered.map((node, index) => [node.id, index] as const),
  );

  return nodes.map((node) => {
    const nextOrder = orderMap.get(node.id);
    if (nextOrder === undefined || node.sort_order === nextOrder) {
      return node;
    }
    return { ...node, sort_order: nextOrder };
  });
}

export function buildThemeTree(nodes: ThemeNode[]): ThemeNodeTree[] {
  const map = new Map<string, ThemeNodeTree>();

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  const roots: ThemeNodeTree[] = [];

  for (const node of nodes) {
    const current = map.get(node.id)!;
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(current);
    } else {
      roots.push(current);
    }
  }

  const sortRecursive = (list: ThemeNodeTree[]) => {
    list.sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        a.created_at.localeCompare(b.created_at),
    );
    list.forEach((n) => sortRecursive(n.children));
  };

  sortRecursive(roots);
  return roots;
}

export function countNodes(tree: ThemeNodeTree[]): number {
  return tree.reduce(
    (sum, node) => sum + 1 + countNodes(node.children),
    0,
  );
}
