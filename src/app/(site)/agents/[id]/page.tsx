import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgentProfileById } from "@/lib/agents/server";
import { catalogToPublicProperty } from "@/lib/properties/catalog-schema";
import { listPublishedCatalogProperties } from "@/lib/properties/server";
import AgentProfilePage from "./AgentProfilePage";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentProfileById(id);
  if (!agent) return { title: "סוכן לא נמצא" };
  return {
    title: `${agent.name} | Rehouse Israel`,
    description: agent.description ?? agent.specialization,
    openGraph: { images: [{ url: agent.image }] },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const agent = await getAgentProfileById(id);
  if (!agent) notFound();

  const allProperties = await listPublishedCatalogProperties();
  const properties = allProperties
    .filter((p) => p.agentId === agent.userId || p.agentId === agent.id)
    .map(catalogToPublicProperty);

  return <AgentProfilePage agent={agent} properties={properties} />;
}
