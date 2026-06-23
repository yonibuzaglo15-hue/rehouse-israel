import Link from "next/link";
import Logo from "@/components/Logo";
import FooterSocialLinks from "@/components/FooterSocialLinks";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="border-t border-navy-200/60 bg-slate-50 transition-colors duration-300 dark:border-white/10 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="footer-brand-block">
              <Logo variant="footer" linked={false} />
              <p className="mt-3 font-display text-sm font-medium text-gold-700 dark:text-gold-300/90">
                {BRAND.nameHe}
              </p>
              <p className="mt-1 text-xs tracking-wide text-navy-600 dark:text-white/40" dir="ltr">
                {BRAND.tagline}
              </p>
              <FooterSocialLinks className="mt-5" />
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-navy-700 dark:text-white/50">
              סוכנות נדל״ן יוקרתית המתמחה באשדוד, אשקלון, יבנה וגן יבנה.
              ליווי אישי, שקיפות מלאה וחוויית רכישה ברמה בינלאומית.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-navy-900 dark:text-white">ניווט</h4>
            <ul className="space-y-2 text-sm text-navy-700 dark:text-white/50">
              <li><Link href="/" className="transition-colors hover:text-gold-600 dark:hover:text-gold-400">ראשי</Link></li>
              <li><Link href="/properties" className="transition-colors hover:text-gold-600 dark:hover:text-gold-400">נכסים</Link></li>
              <li><Link href="/agents" className="transition-colors hover:text-gold-600 dark:hover:text-gold-400">סוכנים</Link></li>
              <li><Link href="/projects" className="transition-colors hover:text-gold-600 dark:hover:text-gold-400">פרוייקטים חדשים</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-gold-600 dark:hover:text-gold-400">צור קשר</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-navy-900 dark:text-white">יצירת קשר</h4>
            <ul className="space-y-2 text-sm text-navy-700 dark:text-white/50">
              <li>טלפון: 03-1234567</li>
              <li>דוא״ל: info@rehouse.co.il</li>
              <li>אשדוד, ישראל</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-navy-200/60 pt-8 dark:border-white/10 sm:flex-row">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <Logo variant="header" linked={false} className="opacity-80 sm:hidden" />
            <p className="text-xs text-navy-600 dark:text-white/30">
              © {new Date().getFullYear()} {BRAND.nameEn} · {BRAND.nameHe}. כל הזכויות שמורות.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <FooterSocialLinks className="sm:hidden" />
            <div className="flex gap-6 text-xs text-navy-600 dark:text-white/30">
              <Link href="/privacy" className="transition-colors hover:text-navy-900 dark:hover:text-white/60">מדיניות פרטיות</Link>
              <Link href="/terms" className="transition-colors hover:text-navy-900 dark:hover:text-white/60">תנאי שימוש</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
