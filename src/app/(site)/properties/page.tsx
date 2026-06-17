import type { Metadata } from "next";
import { Suspense } from "react";
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

function PropertiesLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-28">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesPage />
    </Suspense>
  );
}
