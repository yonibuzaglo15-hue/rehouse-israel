"use client";

import { Shield, Settings, Users, ScrollText } from "lucide-react";

const DEV_SECTIONS = [
  {
    icon: Settings,
    title: "הגדרות מערכת",
    description: "תצורת אתר, סביבות, ומשתני סביבה (בקרוב).",
  },
  {
    icon: Users,
    title: "ניהול משתמשים",
    description: "הוספה והסרה של חשבונות צוות ושינוי תפקידים (בקרוב).",
  },
  {
    icon: ScrollText,
    title: "לוגים וניטור",
    description: "מעקב אחר סנכרון Google, ייבוא נכסים ושגיאות API (בקרוב).",
  },
  {
    icon: Shield,
    title: "גישת Superuser",
    description: "גישה מלאה לכל הנתיבים, כלי פיתוח ותצורות מתקדמות.",
  },
] as const;

export default function DevToolsPanel() {
  return (
    <section className="glass-panel rounded-2xl p-6">
      <p className="font-display text-xs tracking-[0.18em] text-violet-300 uppercase">
        Dev Console
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-white">כלי מפתח</h2>
      <p className="mt-2 text-sm text-white/50">
        אזור זה מיועד למשתמשי DEV בלבד — ניהול טכני של האתר.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {DEV_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <section.icon className="mb-3 h-5 w-5 text-violet-300" />
            <h3 className="font-display text-sm font-semibold text-white">{section.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-white/45">{section.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
