"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RunRefresh() {
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => {
      router.refresh();
    }, 2500);
    return () => clearInterval(t);
  }, [router]);

  return (
    <p className="text-sm text-[var(--muted)]">
      Generando piezas… esta página se actualiza sola.
    </p>
  );
}
