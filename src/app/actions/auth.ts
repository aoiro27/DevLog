"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "ログインに失敗しました。入力内容を確認してください。" };
  }

  redirect("/today");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
