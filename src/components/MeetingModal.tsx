"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, CheckCircle } from "lucide-react";
import type { Agent } from "@/lib/types";

interface MeetingModalProps {
  agent: Agent | null;
  onClose: () => void;
}

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export default function MeetingModal({ agent, onClose }: MeetingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (agent) {
      dialog.showModal();
      setSubmitted(false);
    } else {
      dialog.close();
    }
  }, [agent]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (dialog && e.target === dialog) onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] m-0 h-full w-full max-h-none max-w-none border-0 bg-transparent p-4 backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
    >
      <AnimatePresence>
        {agent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="glass-panel w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20">
                  <Calendar className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    קבעו פגישה
                  </h2>
                  <p className="text-sm text-white/50">עם {agent.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="סגור"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-gold-400" />
                <h3 className="font-display text-xl font-semibold text-white">
                  הפגישה נקבעה בהצלחה!
                </h3>
                <p className="mt-2 text-sm text-white/50">
                  {agent.name} יצור/תיצור איתכם קשר לאישור סופי.
                </p>
                <button type="button" onClick={onClose} className="luxury-btn-primary mt-6">
                  סגור
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    שם מלא
                  </label>
                  <input type="text" required className="luxury-input" placeholder="השם שלכם" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    טלפון
                  </label>
                  <input
                    type="tel"
                    required
                    className="luxury-input"
                    placeholder="050-0000000"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    תאריך מועדף
                  </label>
                  <input type="date" required className="luxury-input" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    שעה מועדפת
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <label key={slot} className="cursor-pointer">
                        <input
                          type="radio"
                          name="time"
                          value={slot}
                          required
                          className="peer sr-only"
                        />
                        <span className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white/70 transition-all peer-checked:border-gold-500/60 peer-checked:bg-gold-500/15 peer-checked:text-gold-300">
                          {slot}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="luxury-btn-primary flex-1">
                    אישור פגישה
                  </button>
                  {agent.calendarUrl && (
                    <a
                      href={agent.calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="luxury-btn-ghost shrink-0"
                    >
                      יומן
                    </a>
                  )}
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
