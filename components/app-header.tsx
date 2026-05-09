"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useThemeStore } from "@/lib/store/theme";

export function AppHeader() {
  const router = useRouter();
  const toggle = useThemeStore((s) => s.toggle);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[var(--fg)]">
          100posts
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <Link href="/brand" className="hover:text-[var(--fg)]">
            Marca
          </Link>
          <Link href="/products/new" className="hover:text-[var(--fg)]">
            Nuevo producto
          </Link>
          <button
            type="button"
            onClick={() => toggle()}
            className="rounded-md px-2 py-1 hover:bg-[var(--muted-bg)] hover:text-[var(--fg)]"
          >
            Tema
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-md px-2 py-1 hover:bg-[var(--muted-bg)] hover:text-[var(--fg)]"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
