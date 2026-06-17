import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo size="md" linked={false} />
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              סוכנות נדל״ן יוקרתית המתמחה באשדוד, אשקלון, יבנה וגן יבנה.
              ליווי אישי, שקיפות מלאה וחוויית רכישה ברמה בינלאומית.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">ניווט</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/properties" className="transition-colors hover:text-gold-400">נכסים</Link></li>
              <li><Link href="/agents" className="transition-colors hover:text-gold-400">סוכנים</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-gold-400">אודות</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-gold-400">צור קשר</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">יצירת קשר</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>טלפון: 03-1234567</li>
              <li>דוא״ל: info@rehouse.co.il</li>
              <li>אשדוד, ישראל</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Rehouse Israel. כל הזכויות שמורות.
          </p>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/privacy" className="transition-colors hover:text-white/60">מדיניות פרטיות</Link>
            <Link href="/terms" className="transition-colors hover:text-white/60">תנאי שימוש</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
