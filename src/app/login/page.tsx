import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="auth-layout">
      <div className="auth-card">
        <Link href="/" className="brand-mark">
          DevLog
        </Link>
        <h1>ログイン</h1>
        <AuthForm />
      </div>
    </main>
  );
}
