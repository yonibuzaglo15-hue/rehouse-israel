"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
        "top-0 left-0 z-50 w-full transition-all duration-300 ease-out",
        isHome ? "absolute" : "fixed",
        showAcrylic
          ? "border-b border-navy-200/60 bg-white/90 shadow-lg shadow-navy-900/5 backdrop-blur-md dark:border-white/10 dark:bg-[#0a1929]/70 dark:shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <nav
        className="relative mx-auto flex w-full max-w-[100vw] items-center justify-between px-6 py-4 sm:px-10 lg:px-12 lg:py-5"
        style={{ direction: "rtl" }}
        aria-label="ניווט ראשי"
      >
        <div className="z-10 flex shrink-0 items-center gap-4">
          <Logo variant="header" linked />
          <ThemeToggle />
        </div>

        <div className="absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 items-center md:flex">
          <ul className="m-0 flex list-none flex-row flex-nowrap items-center gap-4 p-0 lg:gap-6">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <li key={link.href} className="m-0 shrink-0 list-none">
                  <Link
                    href={link.href}
                    className={[
                      "relative block whitespace-nowrap rounded-lg px-3 py-2 font-display text-sm font-medium tracking-wide no-underline transition-colors duration-300 lg:px-4",
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
        </div>

        <div className="z-10 flex shrink-0 items-center gap-4">
          <div className="hidden flex-nowrap items-center gap-4 md:flex">
            <Link
              href="/properties"
              className="luxury-btn-primary shrink-0 whitespace-nowrap !px-5 !py-2.5 text-sm no-underline"
            >
              מצאו נכס
            </Link>
            <HeaderUserMenu />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="shrink-0 rounded-lg p-2.5 text-gold-600 transition-colors duration-300 hover:bg-navy-100 hover:text-gold-700 md:hidden dark:text-[#c9952e] dark:hover:bg-white/10 dark:hover:text-[#dfa84d]"
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
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="list-none">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 font-display text-base text-navy-800 no-underline transition-colors duration-300 hover:bg-navy-50 hover:text-gold-600 dark:text-white/90 dark:hover:bg-white/5 dark:hover:text-[#c9952e]"
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
