import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-atmosphere" aria-hidden />
        <div className="landing-copy">
          <span className="brand-hero">DevLog</span>
          <div className="cta-row">
            <Link href="/login" className="btn-primary">
              ログイン
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
