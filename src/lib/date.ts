const TOKYO = "Asia/Tokyo";

/** Asia/Tokyo の今日を YYYY-MM-DD で返す */
export function todayInTokyo(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TOKYO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatJapaneseDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TOKYO,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** YYYY-MM-DD を1日戻す */
export function shiftDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}
