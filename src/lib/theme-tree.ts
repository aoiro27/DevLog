import type { ThemeNode, ThemeNodeTree } from "@/lib/types";

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
