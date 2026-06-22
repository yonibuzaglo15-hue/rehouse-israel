import type { Metadata } from "next";
import { listCompanyOwners, listPublicAgents, listSeniorConsultants } from "@/lib/agents/server";
import AgentsPage from "./AgentsPage";

export const metadata: Metadata = {
  title: "הסוכנים שלנו",
  description:
    "הכירו את צוות הסוכנים המקצועי של Rehouse Israel — מומחי נדל״ן באשדוד, אשקלון, יבנה וגן יבנה.",
  openGraph: {
    title: "הסוכנים שלנו | Rehouse Israel",
    description: "צוות מקצועי של מומחי נדל״ן לליווי אישי",
  },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const [agents, owners, seniorConsultants] = await Promise.all([
    listPublicAgents(),
    listCompanyOwners(),
    listSeniorConsultants(),
  ]);
  return (
    <AgentsPage
      initialAgents={agents}
      companyOwners={owners}
      seniorConsultants={seniorConsultants}
    />
  );
}
