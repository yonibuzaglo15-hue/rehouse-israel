import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="מדיניות פרטיות" />
      <section className="pb-24">
        <div className="prose prose-invert mx-auto max-w-3xl px-4 text-white/60 sm:px-6">
          <p>Rehouse Israel מכבדת את פרטיות המשתמשים באתר. מדיניות זו מתארת כיצד אנו אוספים ומשתמשים במידע.</p>
          <h2 className="mt-8 text-white">איסוף מידע</h2>
          <p>אנו אוספים מידע שמסרתם ביוזמתכם בטפסי יצירת קשר, כגון שם, טלפון ודוא״ל.</p>
          <h2 className="mt-8 text-white">שימוש במידע</h2>
          <p>המידע משמש ליצירת קשר, מתן שירות ושיפור חוויית המשתמש.</p>
          <Link href="/" className="mt-8 inline-block text-gold-400 hover:text-gold-300">
            ← חזרה לדף הבית
          </Link>
        </div>
      </section>
    </>
  );
}
