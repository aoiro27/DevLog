import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-atmosphere" aria-hidden />
        <div className="landing-copy">
          <span className="brand-hero">DevLog</span>
          <h1>毎日、少しだけ技術を残す。</h1>
          <p>
            大きな勉強計画は続かなくていい。今日触ったこと、詰まったこと、分かったことを
            1行から書き残す場所です。
          </p>
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
