import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEV_AUTH_COOKIE } from "@/lib/auth/dev-credentials";

function missingConfigHtml(): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>100posts — Configuración</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
  .box{max-width:520px;background:#1e293b;border:1px solid #334155;border-radius:16px;padding:28px;}
  h1{font-size:1.25rem;margin:0 0 12px;color:#f8fafc;}
  p{line-height:1.5;color:#94a3b8;font-size:0.95rem;margin:0 0 16px;}
  code{display:block;background:#0f172a;padding:12px;border-radius:8px;font-size:0.8rem;color:#a5b4fc;overflow-x:auto;}
  a{color:#818cf8;}
</style></head><body><div class="box">
<h1>Faltan variables en Vercel</h1>
<p>Para que la app arranque, agregá en <strong>Project → Settings → Environment Variables</strong>:</p>
<code>NEXT_PUBLIC_SUPABASE_URL<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
<p>Luego redeploy. Guía: README del repo.</p>
</div></body></html>`;
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api");
  const isAuthPath = path.startsWith("/login") || path.startsWith("/auth");
  const hasDevSession = request.cookies.get(DEV_AUTH_COOKIE)?.value === "1";
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (hasDevSession) {
    // In temporary credential mode, let server components decide what to render.
    // Redirecting /login -> / can create loops with pages that still check Supabase user.
    if (
      !hasSupabaseEnv &&
      path !== "/" &&
      path !== "/login" &&
      path !== "/products/new" &&
      path !== "/api/dev-login" &&
      path !== "/api/dev-logout"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) {
    if (isApi) {
      return NextResponse.json(
        {
          error:
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure Vercel env.",
        },
        { status: 503 }
      );
    }
    return new NextResponse(missingConfigHtml(), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, responseHeaders) {
        // Next.js 15+: request.cookies.set throws in middleware (read-only).
        // Only mutate the outgoing response; see @supabase/ssr SetAllCookies docs.
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(responseHeaders ?? {}).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isAuthPath && !isApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
