"use client";

import { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [defaultTheme, setDefaultTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDefaultTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  // Avoid next-themes hydration mismatch — THEME_INIT_SCRIPT already set html class
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
