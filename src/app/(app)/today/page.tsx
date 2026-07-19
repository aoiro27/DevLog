import { TodayHeading, TodayJournal } from "@/components/today-journal";
import { todayInTokyo } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types";

export default async function TodayPage() {
  const supabase = await createClient();
  const today = todayInTokyo();

  const [datesRes, todaysRes] = await Promise.all([
    supabase.from("entries").select("logged_on").order("logged_on", {
      ascending: false,
    }),
    supabase
      .from("entries")
      .select("*")
      .eq("logged_on", today)
      .order("created_at", { ascending: false }),
  ]);

  const initialDates = [
    ...new Set((datesRes.data ?? []).map((row) => row.logged_on as string)),
  ];
  const initialTodays = (todaysRes.data ?? []) as Entry[];

  return (
    <main>
      <TodayHeading />
      <TodayJournal
        initialTodays={initialTodays}
        initialDates={initialDates}
      />
    </main>
  );
}
