"use server";

import { revalidatePath } from "next/cache";
import { todayInTokyo } from "@/lib/date";
import { parseTags } from "@/lib/tags";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/actions/auth";

const MAX_BODY = 50000;
const MAX_TITLE = 120;
const SUGGESTED_BODY = 800;

export async function createEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));

  if (title.length < 1) {
    return { error: "タイトルを入力してください。" };
  }
  if (title.length > MAX_TITLE) {
    return { error: `タイトルは${MAX_TITLE}文字以内にしてください。` };
  }
  if (body.length < 1) {
    return { error: "本文を1文字以上書いてください。" };
  }
  if (body.length > MAX_BODY) {
    return { error: `${MAX_BODY}文字以内にしてください。` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const { error } = await supabase.from("entries").insert({
    user_id: user.id,
    title,
    body,
    tags,
    logged_on: todayInTokyo(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/today");
  revalidatePath("/log");
  return {
    success:
      body.length <= SUGGESTED_BODY
        ? "残しました。また明日も小さく。"
        : "残しました。長くても大丈夫、続ければ資産になる。",
  };
}

export async function deleteEntry(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/today");
  revalidatePath("/log");
  return { success: "削除しました。" };
}
