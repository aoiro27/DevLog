"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NodeCreateForm,
  NodeEditor,
  ThemeMetaForm,
} from "@/components/theme-detail-forms";
import { ThemeTreeNav } from "@/components/theme-tree-nav";
import {
  buildThemeTree,
  countNodes,
  reorderThemeNodeSiblings,
} from "@/lib/theme-tree";
import { createClient } from "@/lib/supabase/client";
import type { Theme, ThemeNode } from "@/lib/types";

type Mode =
  | { type: "settings" }
  | { type: "node"; id: string }
  | { type: "add-root" }
  | { type: "add-child"; parentId: string };

export function ThemeWorkspace({ themeId }: { themeId: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [nodes, setNodes] = useState<ThemeNode[]>([]);
  const [mode, setMode] = useState<Mode>({ type: "settings" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const [themeRes, nodesRes] = await Promise.all([
      supabase.from("themes").select("*").eq("id", themeId).maybeSingle(),
      supabase
        .from("theme_nodes")
        .select("*")
        .eq("theme_id", themeId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (themeRes.error || !themeRes.data) {
      setError(themeRes.error?.message ?? "テーマが見つかりません。");
      setLoading(false);
      return;
    }

    setTheme(themeRes.data as Theme);
    setNodes((nodesRes.data ?? []) as ThemeNode[]);
    setLoading(false);
  }, [themeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildThemeTree(nodes), [nodes]);

  const handleReorder = useCallback(
    async (activeId: string, overId: string) => {
      const nextNodes = reorderThemeNodeSiblings(nodes, activeId, overId);
      if (!nextNodes) {
        return;
      }

      const updates = nextNodes.filter((node) => {
        const prev = nodes.find((current) => current.id === node.id);
        return prev && prev.sort_order !== node.sort_order;
      });

      if (updates.length === 0) {
        return;
      }

      setReorderError(null);
      setNodes(nextNodes);

      const supabase = createClient();
      const results = await Promise.all(
        updates.map((node) =>
          supabase
            .from("theme_nodes")
            .update({ sort_order: node.sort_order })
            .eq("id", node.id)
            .eq("theme_id", themeId),
        ),
      );

      const failed = results.find((result) => result.error);
      if (failed?.error) {
        setReorderError(failed.error.message);
        void load();
      }
    },
    [nodes, themeId, load],
  );
  const selected =
    mode.type === "node" || mode.type === "add-child"
      ? nodes.find((n) =>
          n.id === (mode.type === "node" ? mode.id : mode.parentId),
        ) ?? null
      : null;

  if (loading) {
    return <p className="empty-state">読み込み中…</p>;
  }

  if (error || !theme) {
    return (
      <main>
        <p className="form-error">{error ?? "エラー"}</p>
        <Link href="/themes" className="btn-ghost">
          一覧へ戻る
        </Link>
      </main>
    );
  }

  return (
    <main>
      <p className="breadcrumb">
        <Link href="/themes">調べてるやつ</Link>
        <span aria-hidden> / </span>
        <span>{theme.title}</span>
      </p>
      <h1 className="page-heading">{theme.title}</h1>
      <p className="page-sub">
        {theme.status === "open" ? "調査中" : "完了"} · {countNodes(tree)}{" "}
        ノード
      </p>

      <div className="theme-workspace">
        <aside className="panel theme-sidebar">
          <div className="theme-sidebar-head">
            <h2 className="section-title">ツリー</h2>
            <div className="theme-sidebar-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setMode({ type: "add-root" })}
              >
                ルート追加
              </button>
              {mode.type === "node" ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    setMode({ type: "add-child", parentId: mode.id })
                  }
                >
                  子を追加
                </button>
              ) : null}
            </div>
          </div>
          {reorderError ? (
            <p className="form-error">{reorderError}</p>
          ) : null}
          <ThemeTreeNav
            tree={tree}
            selectedId={mode.type === "node" ? mode.id : undefined}
            onSelect={(id) => setMode({ type: "node", id })}
            onReorder={(activeId, overId) => {
              void handleReorder(activeId, overId);
            }}
          />
          <div className="theme-sidebar-foot">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setMode({ type: "settings" })}
            >
              テーマ設定を開く
            </button>
          </div>
        </aside>

        <section className="panel">
          {mode.type === "add-child" && selected ? (
            <>
              <h2 className="section-title">子ノードを追加</h2>
              <NodeCreateForm
                themeId={theme.id}
                parentId={selected.id}
                parentTitle={selected.title}
                onCreated={(node) => {
                  setNodes((prev) => [...prev, node]);
                  setMode({ type: "node", id: node.id });
                }}
              />
            </>
          ) : mode.type === "add-root" ? (
            <>
              <h2 className="section-title">ルートノードを追加</h2>
              <NodeCreateForm
                themeId={theme.id}
                onCreated={(node) => {
                  setNodes((prev) => [...prev, node]);
                  setMode({ type: "node", id: node.id });
                }}
              />
            </>
          ) : mode.type === "node" && selected ? (
            <>
              <div className="theme-detail-head">
                <h2 className="section-title">調査メモ</h2>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    setMode({ type: "add-child", parentId: selected.id })
                  }
                >
                  この下に子を追加
                </button>
              </div>
              <NodeEditor
                themeId={theme.id}
                node={selected}
                onUpdated={(node) => {
                  setNodes((prev) =>
                    prev.map((n) => (n.id === node.id ? node : n)),
                  );
                }}
                onDeleted={(id) => {
                  const removeIds = collectDescendantIds(nodes, id);
                  setNodes((prev) =>
                    prev.filter((n) => !removeIds.has(n.id)),
                  );
                  setMode({ type: "settings" });
                }}
              />
            </>
          ) : (
            <>
              <h2 className="section-title">テーマ設定</h2>
              <ThemeMetaForm
                theme={theme}
                tree={tree}
                onUpdated={(next) => setTheme(next)}
              />
              {nodes.length === 0 ? (
                <>
                  <hr className="soft-hr" />
                  <h2 className="section-title">最初のノードを追加</h2>
                  <NodeCreateForm
                    themeId={theme.id}
                    onCreated={(node) => {
                      setNodes((prev) => [...prev, node]);
                      setMode({ type: "node", id: node.id });
                    }}
                  />
                </>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function collectDescendantIds(
  nodes: ThemeNode[],
  rootId: string,
): Set<string> {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (node.parent_id && ids.has(node.parent_id) && !ids.has(node.id)) {
        ids.add(node.id);
        changed = true;
      }
    }
  }
  return ids;
}
