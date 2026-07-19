import Link from "next/link";
import { notFound } from "next/navigation";
import {
  NodeCreateForm,
  NodeEditor,
  ThemeMetaForm,
} from "@/components/theme-detail-forms";
import { ThemeTreeNav } from "@/components/theme-tree-nav";
import { buildThemeTree, countNodes } from "@/lib/theme-tree";
import { createClient } from "@/lib/supabase/server";
import type { Theme, ThemeNode } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ node?: string; add?: string }>;
};

export default async function ThemeDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { node: nodeId, add } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: themeData } = await supabase
    .from("themes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!themeData) notFound();
  const theme = themeData as Theme;

  const { data: nodeRows } = await supabase
    .from("theme_nodes")
    .select("*")
    .eq("theme_id", id)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const nodes = (nodeRows ?? []) as ThemeNode[];
  const tree = buildThemeTree(nodes);
  const selected = nodeId
    ? nodes.find((n) => n.id === nodeId) ?? null
    : null;

  const showAddChild = add === "child" && selected;
  const showAddRoot = add === "root";

  return (
    <main>
      <p className="breadcrumb">
        <Link href="/themes">調査テーマ</Link>
        <span aria-hidden> / </span>
        <span>{theme.title}</span>
      </p>
      <h1 className="page-heading">{theme.title}</h1>
      <p className="page-sub">
        {theme.status === "open" ? "調査中" : "一段落"} · ノード{" "}
        {countNodes(tree)} 件
      </p>

      <div className="theme-workspace">
        <aside className="panel theme-sidebar">
          <div className="theme-sidebar-head">
            <h2 className="section-title">ツリー</h2>
            <div className="theme-sidebar-actions">
              <Link
                href={`/themes/${theme.id}?add=root`}
                className="btn-ghost"
              >
                ルート追加
              </Link>
              {selected ? (
                <Link
                  href={`/themes/${theme.id}?node=${selected.id}&add=child`}
                  className="btn-ghost"
                >
                  子を追加
                </Link>
              ) : null}
            </div>
          </div>
          <ThemeTreeNav
            themeId={theme.id}
            tree={tree}
            selectedId={selected?.id}
          />
          <div className="theme-sidebar-foot">
            <Link href={`/themes/${theme.id}`} className="btn-ghost">
              テーマ設定を開く
            </Link>
          </div>
        </aside>

        <section className="panel">
          {showAddChild && selected ? (
            <>
              <h2 className="section-title">子ノードを追加</h2>
              <NodeCreateForm
                themeId={theme.id}
                parentId={selected.id}
                parentTitle={selected.title}
              />
            </>
          ) : showAddRoot ? (
            <>
              <h2 className="section-title">ルートノードを追加</h2>
              <NodeCreateForm themeId={theme.id} />
            </>
          ) : selected ? (
            <>
              <div className="theme-detail-head">
                <h2 className="section-title">調査メモ</h2>
                <Link
                  href={`/themes/${theme.id}?node=${selected.id}&add=child`}
                  className="btn-ghost"
                >
                  この下に子を追加
                </Link>
              </div>
              <NodeEditor themeId={theme.id} node={selected} />
            </>
          ) : (
            <>
              <h2 className="section-title">テーマ設定</h2>
              <ThemeMetaForm theme={theme} />
              {nodes.length === 0 ? (
                <>
                  <hr className="soft-hr" />
                  <h2 className="section-title">最初のノードを追加</h2>
                  <NodeCreateForm themeId={theme.id} />
                </>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
