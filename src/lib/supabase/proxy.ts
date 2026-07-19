import { NextResponse, type NextRequest } from "next/server";

/**
 * Cookie を次のハンドラへ通すだけ。
 * getUser() のネットワーク往復はナビを数百ms〜数秒遅くするので呼ばない。
 * トークン更新はブラウザ側の Supabase クライアントに任せる。
 */
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
