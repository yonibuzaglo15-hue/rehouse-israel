"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderUserMenu, { MobileHeaderAuth } from "@/components/auth/HeaderUserMenu";

const NAV_LINKS = [
  { href: "/", label: "ראשי" },
  { href: "/properties", label: "נכסים" },
  { href: "/agents", label: "סוכנים" },
  { href: "/projects", label: "פרוייקטים חדשים" },
] as const;

const SCROLL_THRESHOLD = 32;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isHome = pathname === "/";
  const isLoggedIn = status === "authenticated" && Boolean(session);
  const showTagline = isHome && !isLoggedIn;

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
        "site-header top-0 left-0 z-50 w-full transition-all duration-300 ease-out",
        isHome ? "site-header--home absolute" : "fixed",
        showAcrylic
          ? "border-b border-navy-200/60 bg-white/90 shadow-lg shadow-navy-900/5 backdrop-blur-md dark:border-white/10 dark:bg-[#0a1929]/70 dark:shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav
        className="mx-auto flex w-full max-w-[100vw] flex-nowrap items-center justify-between gap-4 px-6 py-4 sm:gap-6 sm:px-10 lg:px-12 lg:py-5"
        style={{ direction: "rtl" }}
        aria-label="ניווט ראשי"
      >
        {/* Brand — far right in RTL */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <Logo variant="header" showTagline linked />
        </div>

        {/* Desktop navigation — structural classes must stay on this wrapper */}
        <div className="site-header__desktop-nav hidden min-w-0 flex-1 flex-row flex-nowrap items-center justify-end gap-4 md:flex lg:gap-6">
          {showTagline ? (
            <>
              <span className="site-header__tagline hidden shrink-0 md:inline">
                נדל״ן יוקרה בדרום
              </span>
              <span
                className="hidden h-5 w-px shrink-0 bg-navy-200 dark:bg-white/15 md:block"
                aria-hidden
              />
            </>
          ) : null}

          <ul className="site-header__nav-list m-0 flex list-none flex-row flex-nowrap items-center gap-4 p-0 lg:gap-6">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <li key={link.href} className="m-0 list-none shrink-0">
                  <Link
                    href={link.href}
                    className={[
                      "site-header__nav-link relative block whitespace-nowrap rounded-lg px-3 py-2 font-display text-sm font-medium tracking-wide no-underline transition-colors duration-300 lg:px-4",
                      isActive
                        ? "text-gold-600 dark:text-[#c9952e]"
                        : "text-navy-800 hover:text-gold-600 dark:text-white/85 dark:hover:text-[#c9952e]",
                    ].join(" ")}
                  >
                    {link.label}
                    {isActive ? (
                      <span
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-gold-500/60 lg:inset-x-4"
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="site-header__actions flex shrink-0 flex-nowrap items-center gap-3 lg:gap-4">
            <ThemeToggle />
            <Link
              href="/properties"
              className="luxury-btn-primary shrink-0 whitespace-nowrap !px-5 !py-2.5 text-sm no-underline"
            >
              מצאו נכס
            </Link>

            <HeaderUserMenu />
          </div>
        </div>

        {/* Mobile: theme toggle + menu */}
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="shrink-0 rounded-lg p-2.5 text-gold-600 transition-colors duration-300 hover:bg-navy-100 hover:text-gold-700 dark:text-[#c9952e] dark:hover:bg-white/10 dark:hover:text-[#dfa84d]"
            aria-label={mobileOpen ? "סגור תפריט" : "פתח תפריט"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-navy-200/60 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a1929]/95 md:hidden"
            style={{ direction: "rtl" }}
          >
            <ul className="m-0 flex list-none flex-col gap-1 p-4 ps-6 pe-6">
              {showTagline ? (
                <li className="mb-1 list-none px-4">
                  <span className="site-header__tagline">נדל״ן יוקרה בדרום</span>
                </li>
              ) : null}
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="list-none">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="site-header__nav-link block rounded-lg px-4 py-3 font-display text-base text-navy-800 no-underline transition-colors duration-300 hover:bg-navy-50 hover:text-gold-600 dark:text-white/90 dark:hover:bg-white/5 dark:hover:text-[#c9952e]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="list-none pt-2">
                <Link
                  href="/properties"
                  onClick={() => setMobileOpen(false)}
                  className="luxury-btn-primary w-full text-center no-underline"
                >
                  מצאו נכס
                </Link>
              </li>
              <li className="list-none pt-2">
                <MobileHeaderAuth onNavigate={() => setMobileOpen(false)} />
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
