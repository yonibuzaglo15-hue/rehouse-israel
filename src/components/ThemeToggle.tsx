"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={[
          "theme-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
          "border-navy-200/50 bg-white/70 text-gold-600 shadow-sm backdrop-blur-sm",
          "dark:border-white/15 dark:bg-white/5 dark:text-gold-400",
          className,
        ].join(" ")}
        aria-label="טוען ערכת נושא"
      >
        <Sun className="h-4 w-4 opacity-60" />
      </button>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className={[
        "theme-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
        "border-navy-200/50 bg-white/70 text-gold-600 shadow-sm backdrop-blur-sm",
        "transition-all duration-300 hover:border-gold-500/50 hover:bg-gold-500/10 hover:text-gold-700",
        "dark:border-white/15 dark:bg-white/5 dark:text-gold-400 dark:hover:text-gold-300",
        className,
      ].join(" ")}
      aria-label={isLight ? "עבור למצב לילה" : "עבור למצב יום"}
      title={isLight ? "מצב לילה" : "מצב יום"}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
