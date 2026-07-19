import type { Metadata } from "next";
import { Fredoka, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "DevLog — 毎日の小さな技術ログ",
  description:
    "完璧を目指さず、毎日少しずつ技術の学びを残す。続くためのマイクロアウトプット。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${fredoka.variable} ${zenMaru.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
