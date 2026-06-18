"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const NAV_LINKS = [
  { href: "/properties", label: "נכסים" },
  { href: "/agents", label: "סוכנים" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
] as const;

const SCROLL_THRESHOLD = 32;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome, handleScroll]);

  const showAcrylic = !isHome || scrolled;

  return (
    <header
      className={[
        "site-header top-0 left-0 z-50 w-full transition-all duration-500 ease-out",
        isHome ? "site-header--home absolute" : "fixed",
        showAcrylic
          ? "border-b border-white/10 bg-[#0a1929]/70 shadow-[0_8px_32px_rgba(0,0,0,0.24)] backdrop-blur-md"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav
        className="mx-auto flex w-full max-w-[100vw] flex-nowrap items-center justify-between gap-6 ps-6 pe-6 py-5 sm:ps-10 sm:pe-10 lg:ps-12 lg:pe-12 lg:py-6"
        style={{ direction: "rtl" }}
        aria-label="ניווט ראשי"
      >
        <Link
          href="/"
          className="shrink-0 rounded-lg p-2.5 text-[#c9952e] transition-colors duration-300 hover:bg-white/10 hover:text-[#dfa84d]"
          aria-label="חזרה לדף הבית"
        >
          <Home className="h-5 w-5 sm:h-6 sm:w-6" />
        </Link>

        {/* Desktop navigation — inline-end (left in RTL) */}
        <div className="hidden min-w-0 flex-1 flex-nowrap items-center justify-end gap-1 md:flex lg:gap-2">
          {isHome && (
            <span className="site-header__tagline hidden shrink-0 md:inline">
              נדל״ן יוקרה בדרום
            </span>
          )}

          {isHome && (
            <span
              className="mx-2 hidden h-5 w-px shrink-0 bg-white/15 md:block"
              aria-hidden
            />
          )}

          <ul className="flex flex-nowrap items-center gap-0.5 lg:gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    className={[
                      "relative block whitespace-nowrap rounded-lg px-3 py-2 font-display text-sm font-medium tracking-wide transition-colors duration-300 lg:px-4",
                      isActive
                        ? "text-[#c9952e]"
                        : "text-white/85 hover:text-[#c9952e]",
                    ].join(" ")}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-[#c9952e]/60 lg:inset-x-4"
                        aria-hidden
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <span
            className="mx-3 hidden h-5 w-px shrink-0 bg-white/15 lg:block"
            aria-hidden
          />

          <Link
            href="/properties"
            className="luxury-btn-primary shrink-0 whitespace-nowrap !px-5 !py-2.5 text-sm"
          >
            מצאו נכס
          </Link>
        </div>

        {/* Mobile menu toggle — inline-end alongside nav cluster */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="shrink-0 rounded-lg p-2.5 text-[#c9952e] transition-colors duration-300 hover:bg-white/10 hover:text-[#dfa84d] md:hidden"
          aria-label={mobileOpen ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-[#0a1929]/95 backdrop-blur-xl md:hidden"
            style={{ direction: "rtl" }}
          >
            <ul className="flex flex-col gap-1 p-4 ps-6 pe-6">
              {isHome && (
                <li className="mb-1 px-4">
                  <span className="site-header__tagline">נדל״ן יוקרה בדרום</span>
                </li>
              )}
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 font-display text-base text-white/90 transition-colors duration-300 hover:bg-white/5 hover:text-[#c9952e]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/properties"
                  onClick={() => setMobileOpen(false)}
                  className="luxury-btn-primary w-full text-center"
                >
                  מצאו נכס
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
