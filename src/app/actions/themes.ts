"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

const MAX_TITLE = 120;
const MAX_SUMMARY = 2000;
const MAX_BODY = 50000;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null };
  return { supabase, user };
}

function revalidateTheme(themeId?: string) {
  revalidatePath("/themes");
  if (themeId) revalidatePath(`/themes/${themeId}`);
}

export async function createTheme(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (title.length < 1) return { error: "テーマ名を入力してください。" };
  if (title.length > MAX_TITLE) {
    return { error: `テーマ名は${MAX_TITLE}文字以内にしてください。` };
  }
  if (summary.length > MAX_SUMMARY) {
    return { error: `概要は${MAX_SUMMARY}文字以内にしてください。` };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data, error } = await supabase
    .from("themes")
    .insert({
      user_id: user.id,
      title,
      summary,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidateTheme(data.id);
  redirect(`/themes/${data.id}`);
}

export async function updateTheme(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const status = String(formData.get("status") ?? "open");

  if (!id) return { error: "テーマが見つかりません。" };
  if (title.length < 1) return { error: "テーマ名を入力してください。" };
  if (title.length > MAX_TITLE) {
    return { error: `テーマ名は${MAX_TITLE}文字以内にしてください。` };
  }
  if (summary.length > MAX_SUMMARY) {
    return { error: `概要は${MAX_SUMMARY}文字以内にしてください。` };
  }
  if (status !== "open" && status !== "done") {
    return { error: "ステータスが不正です。" };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "ログインが必要です。" };

  const { error } = await supabase
    .from("themes")
    .update({ title, summary, status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidateTheme(id);
  return { success: "テーマを更新しました。" };
}

export async function deleteTheme(id: string): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "ログインが必要です。" };

  const { error } = await supabase
    .from("themes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/themes");
  redirect("/themes");
}

export async function createThemeNode(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const themeId = String(formData.get("theme_id") ?? "");
  const parentIdRaw = String(formData.get("parent_id") ?? "").trim();
  const parentId = parentIdRaw.length > 0 ? parentIdRaw : null;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!themeId) return { error: "テーマが見つかりません。" };
  if (title.length < 1) return { error: "ノードのタイトルを入力してください。" };
  if (title.length > MAX_TITLE) {
    return { error: `タイトルは${MAX_TITLE}文字以内にしてください。` };
  }
  if (body.length > MAX_BODY) {
    return { error: `${MAX_BODY}文字以内にしてください。` };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data: theme } = await supabase
    .from("themes")
    .select("id")
    .eq("id", themeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!theme) return { error: "テーマが見つかりません。" };

  let siblingQuery = supabase
    .from("theme_nodes")
    .select("sort_order")
    .eq("theme_id", themeId)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  siblingQuery = parentId
    ? siblingQuery.eq("parent_id", parentId)
    : siblingQuery.is("parent_id", null);

  const { data: siblings } = await siblingQuery;

  const sortOrder = (siblings?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("theme_nodes")
    .insert({
      theme_id: themeId,
      parent_id: parentId,
      user_id: user.id,
      title,
      body,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidateTheme(themeId);
  redirect(`/themes/${themeId}?node=${data.id}`);
}

export async function updateThemeNode(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const themeId = String(formData.get("theme_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!id || !themeId) return { error: "ノードが見つかりません。" };
  if (title.length < 1) return { error: "タイトルを入力してください。" };
  if (title.length > MAX_TITLE) {
    return { error: `タイトルは${MAX_TITLE}文字以内にしてください。` };
  }
  if (body.length > MAX_BODY) {
    return { error: `${MAX_BODY}文字以内にしてください。` };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "ログインが必要です。" };

  const { error } = await supabase
    .from("theme_nodes")
    .update({ title, body })
    .eq("id", id)
    .eq("theme_id", themeId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidateTheme(themeId);
  return { success: "調査メモを保存しました。" };
}

export async function deleteThemeNode(
  id: string,
  themeId: string,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "ログインが必要です。" };

  const { error } = await supabase
    .from("theme_nodes")
    .delete()
    .eq("id", id)
    .eq("theme_id", themeId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidateTheme(themeId);
  redirect(`/themes/${themeId}`);
}
