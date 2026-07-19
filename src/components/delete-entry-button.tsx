"use client";

import { useTransition } from "react";
import { deleteEntry } from "@/app/actions/entries";

export function DeleteEntryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn-ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("この記録を削除しますか？")) return;
        startTransition(async () => {
          await deleteEntry(id);
        });
      }}
    >
      {pending ? "…" : "削除"}
    </button>
  );
}
