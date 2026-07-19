"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { createClient } from "@/lib/supabase/client";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setEmail(data.session.user.email ?? null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setEmail(session.user.email ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="shell">
        <p className="empty-state" style={{ paddingTop: "2rem" }}>
          読み込み中…
        </p>
      </div>
    );
  }

  return (
    <div className="shell">
      <AppNav email={email} />
      {children}
    </div>
  );
}
