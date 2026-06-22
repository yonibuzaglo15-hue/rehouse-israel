"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import type { SystemRole } from "@/lib/auth/types";

interface AuthUser {
  fullName: string;
  email: string;
  role: SystemRole;
  roleLabel: string;
  dashboardPath: string;
}

export function MobileHeaderAuth({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.authenticated ? data.user : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="luxury-btn-ghost block w-full text-center"
      >
        התחבר
      </Link>
    );
  }

  return (
    <div className="space-y-2">
      <Link
        href={user.dashboardPath}
        onClick={onNavigate}
        className="luxury-btn-primary block w-full text-center"
      >
        לוח הבקרה
      </Link>
      <button
        type="button"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          onNavigate?.();
          router.push("/");
          router.refresh();
        }}
        className="luxury-btn-ghost w-full"
      >
        התנתקות
      </button>
    </div>
  );
}

export default function HeaderUserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setUser(data.authenticated ? data.user : null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div
        className="hidden h-9 w-20 animate-pulse rounded-lg bg-white/5 md:block"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 font-display text-sm text-white/85 transition-colors hover:border-gold-500/40 hover:text-gold-300 md:inline-flex"
      >
        <User className="h-4 w-4" />
        התחבר
      </Link>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div ref={menuRef} className="relative hidden shrink-0 md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 transition-colors hover:border-gold-500/35 hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/20 font-display text-xs font-semibold text-gold-200">
          {initials}
        </span>
        <span className="max-w-[7rem] truncate font-display text-sm text-white/90">
          {user.fullName.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white/45 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-[14rem] overflow-hidden rounded-xl border border-white/10 bg-navy-950/95 py-1 shadow-xl backdrop-blur-xl"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="font-display text-sm font-medium text-white">{user.fullName}</p>
            <p className="mt-0.5 text-xs text-white/45" dir="ltr">
              {user.email}
            </p>
            <p className="mt-1 text-[10px] tracking-wide text-gold-400/80 uppercase">
              {user.roleLabel}
            </p>
          </div>

          <Link
            href={user.dashboardPath}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-gold-300"
          >
            <LayoutDashboard className="h-4 w-4" />
            לוח הבקרה שלי
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-red-300 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "מתנתק..." : "התנתקות"}
          </button>
        </div>
      )}
    </div>
  );
}
