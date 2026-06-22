import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getDashboardPathForRole } from "@/lib/auth/routes";

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const dashboardPath = getDashboardPathForRole(session.role);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4 text-center">
      <div className="glass-panel max-w-md rounded-2xl p-10">
        <ShieldX className="mx-auto mb-4 h-12 w-12 text-red-400/80" />
        <h1 className="font-display text-2xl font-bold text-white">אין הרשאה</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          אין לך הרשאה לגשת לעמוד זה
          {params.from ? ` (${params.from})` : ""}.
        </p>
        <Link href={dashboardPath} className="luxury-btn-primary mt-8 inline-flex">
          חזרה ללוח הבקרה
        </Link>
      </div>
    </div>
  );
}
