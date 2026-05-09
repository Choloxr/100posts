"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setMessage("");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage("Revisá tu correo para el enlace mágico.");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-[var(--fg)]">100posts</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ingresá con enlace mágico (sin contraseña).
        </p>
        <form onSubmit={sendLink} className="mt-6 space-y-3">
          <label className="block text-xs font-medium text-[var(--muted)]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] outline-none ring-[var(--accent)] focus:ring-2"
              placeholder="vos@tutienda.com"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--accent-fg)] hover:opacity-90"
          >
            Enviar enlace
          </button>
        </form>
        {message ? (
          <p
            className={`mt-3 text-sm ${status === "error" ? "text-red-500" : "text-[var(--muted)]"}`}
          >
            {message}
          </p>
        ) : null}
      </div>
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Al continuar aceptás el uso de cookies de sesión.{" "}
        <Link href="/" className="underline">
          Volver
        </Link>
      </p>
    </div>
  );
}
