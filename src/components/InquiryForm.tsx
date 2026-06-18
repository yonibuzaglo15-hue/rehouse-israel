"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";

interface InquiryFormProps {
  propertyTitle?: string;
  className?: string;
}

export default function InquiryForm({ propertyTitle, className = "" }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-panel rounded-2xl p-8 text-center ${className}`}
      >
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gold-400" />
        <h3 className="font-display text-xl font-semibold text-white">
          הפנייה נשלחה בהצלחה!
        </h3>
        <p className="mt-2 text-sm text-white/50">
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
        <h3 className="font-display text-lg font-semibold text-white">
          {propertyTitle ? `פנייה לגבי: ${propertyTitle}` : "צרו קשר"}
        </h3>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">שם מלא</label>
          <input type="text" required className="luxury-input" placeholder="השם שלכם" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">טלפון</label>
          <input type="tel" required className="luxury-input" placeholder="050-0000000" dir="ltr" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/60">הודעה</label>
          <textarea
            rows={3}
            className="luxury-input resize-none"
            placeholder="ספרו לנו מה אתם מחפשים..."
          />
        </div>
        <button type="submit" className="luxury-btn-primary w-full">
          <Send className="h-4 w-4" />
          שליחת פנייה
        </button>
      </div>
    </form>
  );
}
