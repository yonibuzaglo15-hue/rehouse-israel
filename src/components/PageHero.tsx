"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  badge?: string;
  title: React.ReactNode;
  subtitle?: string;
}

export default function PageHero({ badge, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-950" />
      <div className="pointer-events-none absolute -top-1/4 start-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gold-500/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {badge && (
            <span className="mb-4 inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-medium tracking-widest text-gold-400 uppercase">
              {badge}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
