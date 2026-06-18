import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import DashboardHeader from "./DashboardShell";
import DashboardWorkspace from "@/components/dashboard/DashboardWorkspace";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

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
          <p className="font-display text-xs tracking-[0.2em] text-gold-400 uppercase">
            לוח בקרה
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">
            ברוכים הבאים, {session.fullName.split(" ")[0]}
          </h1>
          <p className="mt-2 text-white/50">
            ניהול נכסים, גיוס לקוחות ופעילות סוכנות — במקום אחד.
          </p>
        </div>

        <DashboardWorkspace role={session.role} />
      </main>
    </>
  );
}
