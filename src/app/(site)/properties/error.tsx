"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Properties page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-navy-950 px-4 pt-28 text-center">
      <h1 className="font-display text-2xl font-semibold text-white">שגיאה בטעינת הקטלוג</h1>
      <p className="mt-3 max-w-md text-sm text-white/50">
        לא הצלחנו לטעון את רשימת הנכסים. נסו שוב — האתר ישתמש בנתונים המקומיים הרשמיים.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="luxury-btn-primary px-6 py-2.5 text-sm"
        >
          נסו שוב
        </button>
        <Link href="/properties" className="luxury-btn-ghost px-6 py-2.5 text-sm">
          חזרה לקטלוג
        </Link>
      </div>
    </div>
  );
}
