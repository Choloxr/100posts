"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "verifying">("idle");
  const [message, setMessage] = useState("");
  const [hasAuthError, setHasAuthError] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHasAuthError(params.get("error") === "auth");
  }, []);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSec]);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (cooldownSec > 0) {
      setStatus("error");
      setMessage(`Esperá ${cooldownSec}s antes de pedir otro email.`);
      return;
    }
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
      if (error.message.toLowerCase().includes("rate limit")) {
        setCooldownSec(60);
        setMessage("Llegaste al límite de envíos. Esperá 60s y volvé a intentar.");
        return;
      }
      setMessage(error.message);
      return;
    }
    setCooldownSec(60);
    setStatus("sent");
    setMessage("Revisá tu correo. Podés entrar desde el enlace o pegar el código de 6 dígitos.");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(14,165,233,0.12),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/90">
            100posts
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Carruseles que venden
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            Para tiendas de celulares. Tres estilos, marca coherente, listo para Instagram
            en un clic.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur-md sm:p-8">
          <h2 className="text-sm font-medium text-slate-200">Entrá con tu correo</h2>
          <p className="mt-1 text-xs text-slate-500">
            Te enviamos un enlace o código de acceso. Sin contraseña.
          </p>
          {hasAuthError ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              El enlace/código venció o no es válido. Pedí uno nuevo e intentá otra vez.
            </p>
          ) : null}
          <form onSubmit={sendLink} className="mt-6 space-y-4">
            <label className="block text-xs font-medium text-slate-400">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/30"
                placeholder="vos@tutienda.com"
                autoComplete="email"
              />
            </label>
            <button
              type="submit"
              disabled={cooldownSec > 0}
              className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cooldownSec > 0 ? `Reenviar en ${cooldownSec}s` : "Enviar enlace"}
            </button>
          </form>
          <form onSubmit={verifyCode} className="mt-4 space-y-3">
            <label className="block text-xs font-medium text-slate-400">
              Código de 6 dígitos
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm tracking-[0.35em] text-slate-100 outline-none ring-2 ring-transparent transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/30"
                placeholder="123456"
              />
            </label>
            <button
              type="submit"
              disabled={!email || otp.length !== 6 || status === "verifying"}
              className="w-full rounded-xl border border-white/15 bg-slate-800 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Validar código
            </button>
          </form>
          {message ? (
            <p
              className={`mt-4 text-sm ${status === "error" ? "text-red-400" : "text-slate-400"}`}
            >
              {message}
            </p>
          ) : null}
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          Al continuar aceptás cookies de sesión.{" "}
          <span className="text-slate-500">
            (Si ves una pantalla de “configuración”, faltan variables en Vercel.)
          </span>
        </p>
      </div>
    </div>
  );
}
