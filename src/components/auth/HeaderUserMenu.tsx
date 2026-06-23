"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Plus, User } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import { isNextAuthAdminRole } from "@/lib/auth/nextauth";

export function MobileHeaderAuth({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session, status } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const isAdmin =
    status === "authenticated" && isNextAuthAdminRole(session?.user?.role);

  if (!isAdmin) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="luxury-btn-ghost block w-full text-center"
        >
          כניסת משתמש
        </button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "מנהל";

  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-slate-600 dark:text-white/60">
        שלום, {firstName}
      </p>
      <Link
        href="/admin/property/new"
        onClick={onNavigate}
        className="luxury-btn-primary flex w-full items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        הוסף נכס
      </Link>
      <button
        type="button"
        onClick={async () => {
          await signOut({ callbackUrl: "/" });
          onNavigate?.();
        }}
        className="luxury-btn-ghost w-full"
      >
        התנתק
      </button>
    </div>
  );
}

export default function HeaderUserMenu() {
  const { data: session, status } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const isAdmin =
    status === "authenticated" && isNextAuthAdminRole(session?.user?.role);

  if (!isAdmin) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-navy-200/80 bg-white/90 px-4 py-2 font-display text-sm text-navy-900 shadow-sm transition-colors hover:border-gold-500/40 hover:text-gold-700 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:text-gold-300"
        >
          <User className="h-4 w-4 shrink-0" />
          כניסת משתמש
        </button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "מנהל";

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-3 lg:gap-4">
      <span className="whitespace-nowrap font-display text-sm text-navy-800 dark:text-white/85">
        שלום, {firstName}
      </span>
      <Link
        href="/admin/property/new"
        className="luxury-btn-primary shrink-0 !px-4 !py-2 text-sm"
      >
        <Plus className="h-4 w-4" />
        הוסף נכס
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-navy-200/80 bg-white/80 px-3 py-2 font-display text-sm text-navy-700 transition-colors hover:border-red-300/60 hover:text-red-600 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:text-red-300"
      >
        <LogOut className="h-4 w-4" />
        התנתק
      </button>
    </div>
  );
}
