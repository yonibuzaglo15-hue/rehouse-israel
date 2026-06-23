"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import InquiryForm from "@/components/InquiryForm";

const CONTACT_INFO = [
  { icon: Phone, label: "טלפון", value: "03-1234567", href: "tel:031234567" },
  { icon: Mail, label: "דוא״ל", value: "info@rehouse.co.il", href: "mailto:info@rehouse.co.il" },
  { icon: MapPin, label: "כתובת", value: "אשדוד, ישראל" },
  { icon: Clock, label: "שעות פעילות", value: "א׳-ה׳ 09:00-19:00, ו׳ 09:00-13:00" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        badge="יצירת קשר"
        title={
          <>
            נשמח <span className="gold-gradient-text">לשמוע מכם</span>
          </>
        }
        subtitle="השאירו פרטים ונחזור אליכם תוך 24 שעות — או צרו קשר ישירות"
      />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="glass-panel flex items-start gap-4 rounded-xl p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-500/15">
                    <item.icon className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-white/50">{item.label}</div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block text-slate-900 transition-colors hover:text-gold-600 dark:text-white dark:hover:text-gold-400"
                        dir={item.icon === Phone ? "ltr" : undefined}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="mt-1 text-slate-900 dark:text-white">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
