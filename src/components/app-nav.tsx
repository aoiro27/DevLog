import Link from "next/link";
import { signOut } from "@/app/actions/auth";

export function AppNav({ email }: { email?: string | null }) {
  return (
    <header className="app-nav">
      <Link href="/today" className="brand-mark" prefetch>
        DevLog
      </Link>
      <nav className="app-nav-links">
        <Link href="/today" prefetch>
          今日
        </Link>
        <Link href="/log" prefetch>
          履歴
        </Link>
        <Link href="/themes" prefetch>
          調査
        </Link>
      </nav>
      <div className="app-nav-end">
        {email ? <span className="nav-email">{email}</span> : null}
        <form action={signOut}>
          <button type="submit" className="btn-ghost">
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
