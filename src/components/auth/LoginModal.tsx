"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/icons/SocialIcons";
import { isGoogleAuthEnabled } from "@/lib/auth/nextauth";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const showGoogle = isGoogleAuthEnabled();

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      onClose();
      window.location.reload();
    } catch {
      setError("התחברות נכשלה, נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("התחברות עם גוגל נכשלה");
      setGoogleLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
            aria-label="סגור"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25 }}
            className="property-search-panel glass-panel relative z-10 w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-2xl sm:p-8"
            dir="rtl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute start-4 top-4 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="סגור"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                כניסת משתמש
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-white/50">
                התחברו לניהול נכסים ופעולות סוכן
              </p>
            </div>

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

            {showGoogle && (
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-200/70 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-500 dark:bg-navy-950 dark:text-white/40">
                    או עם שם משתמש
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">
                  שם משתמש
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="luxury-input ps-10"
                    placeholder="yoni"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">
                  סיסמה
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="luxury-input ps-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="luxury-btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    מתחבר...
                  </>
                ) : (
                  "התחבר"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
