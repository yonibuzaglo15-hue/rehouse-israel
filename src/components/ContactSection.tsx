"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";

const CONTACT_INFO = [
  { icon: Phone, label: "טלפון", value: "03-1234567", href: "tel:031234567" },
  { icon: Mail, label: "דוא״ל", value: "info@rehouse.co.il", href: "mailto:info@rehouse.co.il" },
  { icon: MapPin, label: "כתובת", value: "אשדוד, ישראל" },
  { icon: Clock, label: "שעות פעילות", value: "א׳-ה׳ 09:00-19:00, ו׳ 09:00-13:00" },
];

export default function ContactSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/80 to-navy-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,149,46,0.08),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block text-xs font-medium tracking-widest text-gold-400 uppercase">
            יצירת קשר
          </span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            מוכנים למצוא את <span className="gold-gradient-text">הבית הבא</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/50">
            הצוות שלנו זמין לליווי אישי — משיחת היכרות ועד מסירת המפתחות
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {CONTACT_INFO.map((item) => (
              <div
                key={item.label}
                className="glass-panel flex items-start gap-4 rounded-xl p-5 transition-colors hover:border-gold-500/20"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold-500/15">
                  <item.icon className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <div className="text-xs font-medium tracking-wider text-white/40 uppercase">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block text-lg text-white transition-colors hover:text-gold-400"
                      dir={item.icon === Phone ? "ltr" : undefined}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="mt-1 text-lg text-white">{item.value}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Link href="/contact" className="luxury-btn-primary flex-1 text-center">
                צרו קשר עכשיו
              </Link>
              <a href="tel:031234567" className="luxury-btn-ghost flex-1 text-center">
                התקשרו אלינו
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <InquiryForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
