"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { LOGO_SRC } from "@/components/Logo";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      };

      if (!response.ok || !data.success) {
        setError(data.error ?? "פרטי התחברות שגויים");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("שגיאת רשת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 sm:p-10">
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
              <h1 className="mt-2 font-display text-2xl font-bold text-white">
                כניסה ל<span className="gold-gradient-text">Rehouse</span>
              </h1>
            </div>
          </Link>
          <p className="mt-3 text-sm text-white/55">
            התחברו עם חשבון הארגון שלכם
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-display text-sm text-white/70"
            >
              אימייל ארגוני
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
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
              htmlFor="password"
              className="mb-2 block font-display text-sm text-white/70"
            >
              סיסמה
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
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
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
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

        <p className="mt-8 text-center text-xs text-white/35">
          גישה מורשית לצוות Rehouse Israel בלבד
        </p>
      </div>
    </div>
  );
}
