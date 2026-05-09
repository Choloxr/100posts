"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function describeSignInError(raw: string): string {
  const m = raw.trim().toLowerCase();
  if (
    m.includes("rate limit") ||
    m.includes("too many requests") ||
    m.includes("email rate limit") ||
    m === "429" ||
    m.includes("over_email_send_rate_limit")
  ) {
    return "Llegamos al límite de envíos de email (Supabase). Esperá varios minutos y volvé a pedir el link. Para muchos intentos en desarrollo, configurá SMTP en el proyecto (enlace abajo).";
  }
  return raw;
}

function describeAuthCallbackFailure(reason: string): string {
  const r = reason.trim().toLowerCase();
  if (r === "missing_token") {
    return "No pudimos abrir el enlace (faltan datos o el mail es antiguo). Pedí un link nuevo abajo.";
  }
  if (
    r.includes("expired") ||
    r.includes("invalid") ||
    r.includes("otp") ||
    r.includes("already been used") ||
    r.includes("already used")
  ) {
    return "El enlace venció, ya se usó o no es válido. Escribí tu email y tocá «Enviar link de acceso» para recibir otro.";
  }
  return "No pudimos completar el acceso con ese enlace. Pedí uno nuevo con tu email abajo.";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [authErrorText, setAuthErrorText] = useState<string | null>(null);
  const [isRateLimitError, setIsRateLimitError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") !== "auth") return;
    const reason = params.get("reason") ?? "";
    setAuthErrorText(describeAuthCallbackFailure(reason || "unknown"));
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setIsRateLimitError(false);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error) {
      const friendly = describeSignInError(error.message);
      setStatus("error");
      setMessage(friendly);
      setIsRateLimitError(friendly !== error.message);
      return;
    }
    setStatus("sent");
    setMessage("Revisá tu email, te enviamos un link de acceso");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-4 py-12">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,92,252,0.2),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(139,92,246,0.08),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="mb-10 text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--accent)]">
            100posts
          </p>
          <h1 className="mt-3 text-[36px] font-bold tracking-[-0.03em] leading-[1.1] text-[var(--fg)]">
            Carruseles que venden
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
            Para tiendas de celulares. Tres estilos, marca coherente, listo para Instagram
            en un clic.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-card-lg border border-[var(--border)] bg-[var(--surface)] p-7 shadow-card sm:p-9">
          <h2 className="text-sm font-bold text-[var(--fg)]">Entrá con tu email</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Te enviamos un link de acceso. Sin contraseña.
          </p>
          {authErrorText ? (
            <p className="mt-4 rounded-btn border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-2.5 text-xs leading-relaxed text-[var(--warning)]">
              {authErrorText}
            </p>
          ) : null}
          <form onSubmit={(e) => void sendMagicLink(e)} className="mt-6 space-y-5">
            <label className="block text-xs font-semibold text-[var(--muted)]">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-input border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3.5 text-sm text-[var(--fg)] outline-none transition-all duration-fast placeholder:text-[var(--muted2)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
                placeholder="vos@tutienda.com"
                autoComplete="email"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-btn bg-[var(--accent)] py-3.5 text-sm font-semibold text-white transition-all duration-fast hover:-translate-y-px hover:shadow-glow active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {status === "loading" ? "Enviando…" : "Enviar link de acceso"}
            </button>
          </form>
          {message ? (
            <div
              className={`mt-4 text-sm leading-relaxed ${
                status === "error"
                  ? isRateLimitError
                    ? "text-[var(--warning)]"
                    : "text-[var(--error)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <p>{message}</p>
              {isRateLimitError ? (
                <p className="mt-2">
                  <a
                    href="https://supabase.com/docs/guides/auth/auth-smtp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--warning)] underline decoration-[var(--warning)]/40 underline-offset-2 hover:text-[var(--fg)]"
                  >
                    Configurar SMTP en Supabase
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted2)]">
          Al continuar aceptás cookies de sesión.{" "}
          <span className="text-[var(--muted)]">
            (Si ves una pantalla de &ldquo;configuración&rdquo;, faltan variables en Vercel.)
          </span>
        </p>
      </div>
    </div>
  );
}
