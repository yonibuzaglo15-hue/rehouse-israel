import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDashboardPathForRole } from "@/lib/auth/routes";

/** Legacy route — redirects to role-specific dashboard */
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  redirect(getDashboardPathForRole(session.role));
}
