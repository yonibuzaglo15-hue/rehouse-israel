"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { LOGO_SRC } from "@/components/Logo";
import { GoogleIcon } from "@/components/icons/SocialIcons";
import { isGoogleAuthEnabled } from "@/lib/auth/nextauth";
import {
  canAccessPath,
  getDashboardPathForRole,
} from "@/lib/auth/routes";
import type { SystemRole } from "@/lib/auth/types";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const showGoogle = isGoogleAuthEnabled();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useOrgLogin, setUseOrgLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function resolveRedirectPath(role: SystemRole): string {
    const roleHome = getDashboardPathForRole(role);
    if (!nextPath) return roleHome;
    if (canAccessPath(role, nextPath)) return nextPath;
    return roleHome;
  }

  async function handleNextAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("שם משתמש או סיסמה שגויים");
        return;
      }

      router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch {
      setError("שגיאת רשת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOrgLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        user?: { role: SystemRole };
      };

      if (!response.ok || !data.success || !data.user?.role) {
        setError(data.error ?? "פרטי התחברות שגויים");
        return;
      }

      router.push(resolveRedirectPath(data.user.role));
      router.refresh();
    } catch {
      setError("שגיאת רשת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", {
        callbackUrl: nextPath && nextPath.startsWith("/") ? nextPath : "/",
      });
    } catch {
      setError("התחברות עם גוגל נכשלה");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-4">
            <Image
              src={LOGO_SRC}
              alt="Rehouse Israel"
              width={72}
              height={72}
              className="rounded-2xl"
            />
            <div>
              <p className="font-display text-xs tracking-[0.22em] text-gold-400 uppercase">
                מערכת ניהול
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
                כניסה ל<span className="gold-gradient-text">Rehouse</span>
              </h1>
            </div>
          </Link>
          <p className="mt-3 text-sm text-slate-600 dark:text-white/55">
            {useOrgLogin
              ? "התחברו עם חשבון הארגון שלכם"
              : "התחברו לניהול נכסים ופעולות סוכן"}
          </p>
        </div>

        {!useOrgLogin ? (
          <>
            {showGoogle && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-navy-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors hover:border-gold-500/40 hover:bg-slate-50 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon className="h-5 w-5" />
                )}
                התחבר עם גוגל
              </button>
            )}

            <form onSubmit={handleNextAuthSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block font-display text-sm text-slate-700 dark:text-white/70"
                >
                  שם משתמש
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="luxury-input ps-10"
                    placeholder="yoni"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block font-display text-sm text-slate-700 dark:text-white/70"
                >
                  סיסמה
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="luxury-input ps-10"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-300/40 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="luxury-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    מתחבר...
                  </>
                ) : (
                  "כניסת משתמש"
                )}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleOrgLoginSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-display text-sm text-slate-700 dark:text-white/70"
              >
                אימייל ארגוני
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="luxury-input ps-10"
                  placeholder="name@rehouse.co.il"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="org-password"
                className="mb-2 block font-display text-sm text-slate-700 dark:text-white/70"
              >
                סיסמה
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                <input
                  id="org-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="luxury-input ps-10"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-300/40 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="luxury-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  מתחבר...
                </>
              ) : (
                "כניסה למערכת"
              )}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setUseOrgLogin((value) => !value);
            setError("");
          }}
          className="mt-6 w-full text-center text-sm text-gold-600 transition-colors hover:text-gold-500 dark:text-gold-400"
        >
          {useOrgLogin ? "חזרה לכניסת משתמש" : "כניסה עם חשבון ארגוני"}
        </button>

        <p className="mt-8 text-center text-xs leading-relaxed text-slate-500 dark:text-white/35">
          גישה מורשית לצוות Rehouse Israel בלבד.
        </p>
      </div>
    </div>
  );
}
