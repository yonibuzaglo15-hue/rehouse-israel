import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "תנאי שימוש",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="תנאי שימוש" />
      <section className="pb-24">
        <div className="prose prose-invert mx-auto max-w-3xl px-4 text-white/60 sm:px-6">
          <p>שימוש באתר Rehouse Israel כפוף לתנאים המפורטים להלן.</p>
          <h2 className="mt-8 text-white">שימוש באתר</h2>
          <p>האתר מספק מידע על נכסים ושירותי נדל״ן. המידע אינו מהווה הצעה מחייבת.</p>
          <h2 className="mt-8 text-white">קניין רוחני</h2>
          <p>כל התכנים באתר, לרבות טקסטים, תמונות ועיצוב, הם קניינה של Rehouse Israel.</p>
          <Link href="/" className="mt-8 inline-block text-gold-400 hover:text-gold-300">
            ← חזרה לדף הבית
          </Link>
        </div>
      </section>
    </>
  );
}
