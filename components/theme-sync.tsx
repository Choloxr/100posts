"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/store/theme";

export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return null;
}
