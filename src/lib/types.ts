export type Entry = {
  id: string;
  user_id: string;
  title: string;
  body?: string;
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

export type ThemeStatus = "open" | "done";

export type Theme = {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  status: ThemeStatus;
  created_at: string;
  updated_at: string;
};

export type ThemeNode = {
  id: string;
  theme_id: string;
  parent_id: string | null;
  user_id: string;
  title: string;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ThemeNodeTree = ThemeNode & {
  children: ThemeNodeTree[];
};
