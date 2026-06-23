"use client";

import { useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { getIsraelThemeDefault, THEME_STORAGE_KEY } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [defaultTheme] = useState(() => getIsraelThemeDefault());

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
