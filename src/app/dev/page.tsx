import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { canAccessPath } from "@/lib/auth/routes";
import DashboardHeader from "@/app/dashboard/DashboardShell";
import DashboardWorkspace from "@/components/dashboard/DashboardWorkspace";
import DevToolsPanel from "@/components/dashboard/DevToolsPanel";

export default async function DevDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canAccessPath(session.role, "/dev")) redirect("/access-denied");

  return (
    <>
      <DashboardHeader
        fullName={session.fullName}
        email={session.email}
        role={session.role}
        roleLabel={ROLE_LABELS[session.role]}
        mustChangeOnFirstLogin={session.mustChangeOnFirstLogin}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="font-display text-xs tracking-[0.2em] text-violet-300 uppercase">
            Dev Console
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">
            שלום, {session.fullName.split(" ")[0]}
          </h1>
          <p className="mt-2 text-white/50">
            גישת Superuser — ניהול מלא של האתר, CMS, סוכנים וכלי מערכת.
          </p>
        </div>

        <div className="mb-10">
          <DevToolsPanel />
        </div>

        <DashboardWorkspace role={session.role} />
      </main>
    </>
  );
}
