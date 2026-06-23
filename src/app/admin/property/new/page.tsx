import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin-access";
import AdminPropertyForm from "@/components/admin/AdminPropertyForm";

export default async function NewPropertyPage() {
  const access = await getAdminAccess();
  if (!access) redirect("/?login=1");

  return <AdminPropertyForm mode="create" />;
}
