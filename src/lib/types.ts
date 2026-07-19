export type Entry = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  tags: string[];
  logged_on: string;
  created_at: string;
  updated_at: string;
};

export type StreakStats = {
  current: number;
  longest: number;
  totalDays: number;
  wroteToday: boolean;
};
