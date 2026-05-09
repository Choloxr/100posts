import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function loginAuthErrorRedirect(origin: string, reason?: string) {
  const params = new URLSearchParams({ error: "auth" });
  if (reason) {
    params.set("reason", reason.slice(0, 400));
  }
  return NextResponse.redirect(`${origin}/login?${params.toString()}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // Modern Supabase email links usually send token_hash + type.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return loginAuthErrorRedirect(origin, error.message);
  }

  // Fallback path for older code-based callbacks.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return loginAuthErrorRedirect(origin, error.message);
  }

  return loginAuthErrorRedirect(origin, "missing_token");
}
