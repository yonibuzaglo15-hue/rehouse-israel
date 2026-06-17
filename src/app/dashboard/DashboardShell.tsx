"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, LogOut } from "lucide-react";
import type { SystemRole } from "@/lib/auth/types";

const ROLE_BADGE_STYLES: Record<SystemRole, string> = {
  dev: "border-violet-400/40 bg-violet-500/15 text-violet-200",
  admin: "border-gold-500/40 bg-gold-500/15 text-gold-200",
  agent: "border-sky-400/35 bg-sky-500/10 text-sky-200",
};

interface DashboardHeaderProps {
  fullName: string;
  email: string;
  role: SystemRole;
  roleLabel: string;
  mustChangeOnFirstLogin: boolean;
}

export default function DashboardHeader({
  fullName,
  email,
  role,
  roleLabel,
  mustChangeOnFirstLogin,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-white/10 bg-navy-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10">
            <Building2 className="h-5 w-5 text-gold-300" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">
              {fullName}
            </p>
            <p className="text-sm text-white/50" dir="ltr">
              {email}
            </p>
          </div>
          <span
            className={`ms-2 rounded-full border px-3 py-1 font-display text-xs font-medium ${ROLE_BADGE_STYLES[role]}`}
          >
            {roleLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="luxury-btn-ghost text-sm disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "מתנתק..." : "התנתקות"}
        </button>
      </div>

      {mustChangeOnFirstLogin && (
        <div className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-100 sm:px-6">
          מומלץ להחליף את הסיסמה הראשונית בכניסה הראשונה — תכונה זו תתווסף בשלב הבא.
        </div>
      )}
    </header>
  );
}
