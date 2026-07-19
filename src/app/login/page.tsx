import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="auth-layout">
      <div className="auth-card">
        <Link href="/" className="brand-mark">
          DevLog
        </Link>
        <h1>続くための入り口</h1>
        <p>アカウントを作って、今日の1行から始めましょう。</p>
        <AuthForm />
      </div>
    </main>
  );
}
