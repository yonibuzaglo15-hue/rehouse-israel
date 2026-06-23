"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "@/lib/mock-data/testimonials";

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

export default function TestimonialsSection({
  testimonials = TESTIMONIALS,
}: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = testimonials.length;

  const goTo = (index: number) => {
    setActiveIndex((index + total) % total);
  };

  const visibleCards = [
    testimonials[activeIndex],
    testimonials[(activeIndex + 1) % total],
    testimonials[(activeIndex + 2) % total],
  ];

  return (
    <section className="relative py-20 sm:py-24" aria-label="ביקורות לקוחות">
      <div className="absolute inset-0 bg-slate-50 dark:bg-navy-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,149,46,0.05),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block text-xs font-medium tracking-widest text-gold-400 uppercase">
            ביקורות לקוחות
          </span>
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            מה הלקוחות <span className="gold-gradient-text">אומרים עלינו</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-white/50">
            מאות משפחות מצאו את הבית שלהן דרכנו — הנה חלק מהחוויות שלהן
          </p>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden gap-6 md:grid md:grid-cols-3">
          {visibleCards.map((testimonial, i) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={i} />
          ))}
        </div>

        {/* Mobile slider */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TestimonialCard testimonial={testimonials[activeIndex]} index={0} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition-colors hover:border-gold-500/40 hover:text-gold-600 dark:border-white/15 dark:text-white/60 dark:hover:text-gold-300"
            aria-label="ביקורת קודמת"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? "w-6 bg-gold-500" : "w-2 bg-navy-200 dark:bg-white/20"
                }`}
                aria-label={`ביקורת ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 text-navy-600 transition-colors hover:border-gold-500/40 hover:text-gold-600 dark:border-white/15 dark:text-white/60 dark:hover:text-gold-300"
            aria-label="ביקורת הבאה"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass-panel relative flex h-full flex-col rounded-2xl p-6"
    >
      <Quote className="mb-4 h-8 w-8 text-gold-500/40" />
      <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-white/75">{testimonial.quote}</p>

      <div className="mt-5 flex items-center gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
        ))}
      </div>

      <div className="mt-4 border-t border-navy-200/70 pt-4 dark:border-white/10">
        <div className="font-display text-sm font-semibold text-slate-900 dark:text-white">{testimonial.name}</div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-white/45">
          {testimonial.role} · {testimonial.city}
          {testimonial.agentName && (
            <span className="text-gold-400/70"> · {testimonial.agentName}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
