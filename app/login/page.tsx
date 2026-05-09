"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const response = await fetch("/api/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(body?.error ?? "No se pudo iniciar sesión.");
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
          <h2 className="text-sm font-medium text-slate-200">Iniciar sesión</h2>
          <p className="mt-1 text-xs text-slate-500">Acceso temporal con usuario y contraseña.</p>
          <form onSubmit={signIn} className="mt-6 space-y-4">
            <label className="block text-xs font-medium text-slate-400">
              Usuario
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/30"
                placeholder="cholo"
                autoComplete="username"
              />
            </label>
            <label className="block text-xs font-medium text-slate-400">
              Contraseña
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/30"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Ingresando..." : "Ingresar"}
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
