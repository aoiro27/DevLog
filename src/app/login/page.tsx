import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="auth-layout">
      <div className="auth-card">
        <Link href="/" className="brand-mark">
          DevLog
        </Link>
        <h1>ログイン</h1>
        <p>戻ってきたら、続きの1行を残しましょう。</p>
        <AuthForm />
      </div>
    </main>
  );
}
