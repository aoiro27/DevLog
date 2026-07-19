import { shiftDate, todayInTokyo } from "@/lib/date";
import type { StreakStats } from "@/lib/types";

/** 投稿があった日付（YYYY-MM-DD）の配列からストリークを計算 */
export function calcStreak(loggedOnDates: string[]): StreakStats {
  const unique = [...new Set(loggedOnDates)].sort();
  const today = todayInTokyo();
  const wroteToday = unique.includes(today);

  let current = 0;
  let cursor = wroteToday ? today : shiftDate(today, -1);

  while (unique.includes(cursor)) {
    current += 1;
    cursor = shiftDate(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let prev: string | null = null;

  for (const day of unique) {
    if (prev && day === shiftDate(prev, 1)) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = day;
  }

  return {
    current,
    longest: Math.max(longest, current),
    totalDays: unique.length,
    wroteToday,
  };
}
