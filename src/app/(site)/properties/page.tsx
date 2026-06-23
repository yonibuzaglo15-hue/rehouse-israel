import type { Metadata } from "next";
import { Suspense } from "react";
import { canAdminEditCatalog } from "@/lib/auth/admin-access";
import { getSession } from "@/lib/auth/session";
import { canEditCatalogProperty } from "@/lib/properties/access";
import { catalogToPublicProperty } from "@/lib/properties/catalog-schema";
import { listPublishedCatalogProperties } from "@/lib/properties/server";
import PropertiesPage from "./PropertiesPage";

export const metadata: Metadata = {
  title: "קטלוג נכסים",
  description:
    "דירות למכירה ולהשכרה באשדוד, אשקלון, יבנה וגן יבנה. סינון מתקדם לפי עיר, שכונה, מחיר, חדרים ועוד.",
  openGraph: {
    title: "קטלוג נכסים | Rehouse Israel",
    description: "מצאו את הנכס המושלם עם סינון מתקדם בזמן אמת",
  },
};

export const dynamic = "force-dynamic";

function PropertiesLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-28">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
    </div>
  );
}

async function loadCatalogProperties() {
  try {
    return await listPublishedCatalogProperties();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const details =
      error && typeof error === "object" && "details" in error
        ? (error as { details?: string }).details
        : undefined;
    console.error("CRITICAL SUPABASE ERROR:", message, details);
    return [];
  }
}

export default async function Page() {
  const [properties, session, nextAuthAdmin] = await Promise.all([
    loadCatalogProperties(),
    getSession(),
    canAdminEditCatalog(),
  ]);

  const canEdit =
    nextAuthAdmin || (session ? canEditCatalogProperty(session) : false);

  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesPage
        initialProperties={properties.map(catalogToPublicProperty)}
        canEdit={canEdit}
      />
    </Suspense>
  );
}
