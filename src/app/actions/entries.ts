"use server";

import { revalidatePath } from "next/cache";
import { todayInTokyo } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/app/actions/auth";

const MAX_BODY = 1000;
const SUGGESTED_BODY = 400;

export async function createEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const body = String(formData.get("body") ?? "").trim();
  const topicRaw = String(formData.get("topic") ?? "").trim();
  const topic = topicRaw.length > 0 ? topicRaw.slice(0, 40) : null;

  if (body.length < 1) {
    return { error: "今日の学びを1文字以上書いてください。" };
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
    body,
    topic,
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
