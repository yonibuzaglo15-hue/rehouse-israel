"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";

interface InquiryFormProps {
  propertyTitle?: string;
  propertyId?: string;
  className?: string;
}

export default function InquiryForm({
  propertyTitle,
  propertyId,
  className = "",
}: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          message: String(formData.get("message") ?? ""),
          source: propertyId ? "property-inquiry" : "contact-form",
          propertyId,
          metadata: propertyTitle ? { propertyTitle } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "שליחה נכשלה");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שליחה נכשלה, נסו שוב");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-panel rounded-2xl p-8 text-center ${className}`}
      >
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gold-400" />
        <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
          הפנייה נשלחה בהצלחה!
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/50">
          נחזור אליכם תוך 24 שעות
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-panel rounded-2xl p-6 ${className}`}
    >
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          {propertyTitle ? `פנייה לגבי: ${propertyTitle}` : "צרו קשר"}
        </h3>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">שם מלא</label>
          <input
            type="text"
            name="name"
            required
            className="luxury-input"
            placeholder="השם שלכם"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">טלפון</label>
          <input
            type="tel"
            name="phone"
            required
            className="luxury-input"
            placeholder="050-0000000"
            dir="ltr"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">הודעה</label>
          <textarea
            name="message"
            rows={3}
            className="luxury-input resize-none"
            placeholder="ספרו לנו מה אתם מחפשים..."
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        <button type="submit" disabled={submitting} className="luxury-btn-primary w-full">
          <Send className="h-4 w-4" />
          {submitting ? "שולח..." : "שליחת פנייה"}
        </button>
      </div>
    </form>
  );
}
