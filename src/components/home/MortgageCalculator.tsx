"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ChevronLeft, ChevronRight } from "lucide-react";
import MortgageProfileForm from "@/components/home/mortgage/MortgageProfileForm";
import MortgageMixSummary from "@/components/home/mortgage/MortgageMixSummary";
import MortgageResults from "@/components/home/mortgage/MortgageResults";
import { WIZARD_STEPS } from "@/components/home/mortgage/wizard-helpers";
import { buildRecommendedMix } from "@/lib/mortgage/mix-engine";
import { DEFAULT_WIZARD_PROFILE } from "@/lib/mortgage/wizard-types";
import type { WizardProfile } from "@/lib/mortgage/wizard-types";

export default function MortgageCalculator() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<WizardProfile>(DEFAULT_WIZARD_PROFILE);

  const mix = useMemo(() => buildRecommendedMix(profile), [profile]);

  const canProceedStep1 =
    profile.propertyValue > 0 &&
    profile.downPayment >= 0 &&
    profile.downPayment <= profile.propertyValue &&
    profile.oldestBorrowerAge >= 18 &&
    profile.monthlyNetIncome > 0;

  return (
    <section className="relative py-20 sm:py-24" aria-label="מחשבון משכנתא">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-navy-950 dark:via-navy-900/40 dark:to-navy-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(201,149,46,0.07),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium tracking-widest text-gold-400 uppercase">
            <Calculator className="h-3.5 w-3.5" />
            מחשבון משכנתא חכם
          </span>
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            תמהיל משכנתא <span className="gold-gradient-text">מותאם אישית</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-white/50">
            אפיון לקוח, הרכב תמהיל אוטומטי לפי כללי בנק ישראל, ולוח סילוקין מלא לייצוא
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel overflow-hidden rounded-2xl"
        >
          <div className="border-b border-navy-200/70 px-6 py-5 dark:border-white/10 sm:px-8">
            <ol className="flex items-center justify-center gap-2 sm:gap-4">
              {WIZARD_STEPS.map((wizardStep) => {
                const isActive = step === wizardStep.id;
                const isDone = step > wizardStep.id;

                return (
                  <li key={wizardStep.id} className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                          isActive || isDone
                            ? "bg-gold-500 text-white"
                            : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-white/40",
                        ].join(" ")}
                      >
                        {wizardStep.id}
                      </span>
                      <span
                        className={[
                          "hidden text-sm font-medium sm:inline",
                          isActive
                            ? "text-gold-700 dark:text-gold-300"
                            : "text-slate-500 dark:text-white/45",
                        ].join(" ")}
                      >
                        {wizardStep.label}
                      </span>
                    </div>
                    {wizardStep.id < WIZARD_STEPS.length ? (
                      <span className="hidden h-px w-8 bg-navy-200 sm:block dark:bg-white/10" />
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="p-6 sm:p-8">
            {step === 1 ? <MortgageProfileForm profile={profile} onChange={setProfile} /> : null}
            {step === 2 ? <MortgageMixSummary mix={mix} /> : null}
            {step === 3 ? <MortgageResults mix={mix} /> : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-navy-200/70 px-6 py-4 dark:border-white/10 sm:px-8">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1}
              className="luxury-btn-ghost inline-flex items-center gap-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
              הקודם
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                disabled={step === 1 && !canProceedStep1}
                className="luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-40"
              >
                {step === 1 ? "חשב תמהיל" : "הצג תוצאות מלאות"}
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="luxury-btn-primary inline-flex items-center gap-2"
              >
                התחל מחדש
              </button>
            )}
          </div>
        </motion.div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-[11px] leading-relaxed text-slate-400 dark:text-white/30">
          * הסימולציה מבוססת על נוסחת שפיצר וריביות לדוגמה. התוצאה אינה מהווה הצעת משכנתא — יש
          להתייעץ עם יועץ משכנתאות מוסמך.
        </p>
      </div>
    </section>
  );
}
