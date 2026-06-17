"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, LogOut, PlusCircle } from "lucide-react";
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

export function PropertyIntakePlaceholder() {
  return (
    <section className="glass-panel rounded-2xl p-8 sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10">
          <PlusCircle className="h-7 w-7 text-gold-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">
          גיוס והוספת נכס חדש
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
          בשלב הבא נוסיף כאן טופס מלא לגיוס נכס — פרטי נכס, תמונות, מחיר, רובע
          ושיוך לסוכן המגייס.
        </p>
        <div className="mt-8 w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-white/30">
          אזור טופס גיוס נכס — בקרוב
        </div>
      </div>
    </section>
  );
}
