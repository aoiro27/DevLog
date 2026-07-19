import { Suspense } from "react";
import { LogJournal } from "@/components/log-journal";

export default function LogPage() {
  return (
    <Suspense fallback={<p className="empty-state">読み込み中…</p>}>
      <LogJournal />
    </Suspense>
  );
}
