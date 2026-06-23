import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "אודות",
  description: "Rehouse Israel — סוכנות נדל״ן יוקרתית באשדוד, אשקלון, יבנה וגן יבנה.",
};

const VALUES = [
  { title: "יוקרה", desc: "נכסים נבחרים ומפרט פרימיום בלבד" },
  { title: "שקיפות", desc: "ליווי אישי ומידע מלא בכל שלב" },
  { title: "מקצועיות", desc: "15+ שנות ניסיון בשוק הדרומי" },
  { title: "חדשנות", desc: "טכנולוגיה מתקדמת לחוויית רכישה חלקה" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        badge="הסיפור שלנו"
        title={
          <>
            נדל״ן יוקרה עם <span className="gold-gradient-text">חזון</span>
          </>
        }
        subtitle="Rehouse Israel נוסדה מתוך אמונה שכל לקוח ראוי לחוויית רכישה ברמה בינלאומית — באשדוד, אשקלון, יבנה וגן יבנה."
      />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                מי אנחנו?
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-white/60">
                אנחנו צוות של מומחי נדל״ן המתמחים באזור החוף הדרומי. עם מאות עסקאות
                מוצלחות ושביעות רצון של 98% מהלקוחות, אנחנו מציעים ליווי אישי
                משלב החיפוש ועד מסירת המפתחות.
              </p>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-white/60">
                הגישה שלנו משלבת מקצועיות, שקיפות וטכנולוגיה מתקדמת — כדי שתמצאו
                את הבית המושלם בקלות ובביטחון.
              </p>
              <Link href="/agents" className="luxury-btn-primary mt-8 inline-flex">
                הכירו את הצוות
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {VALUES.map((v) => (
                <div key={v.title} className="glass-panel rounded-xl p-5">
                  <h3 className="font-display font-semibold text-gold-400">{v.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-white/50">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
