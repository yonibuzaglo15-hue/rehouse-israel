"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp } from "lucide-react";
import {
  calculateMortgage,
  formatCurrencyILS,
  type MortgageInputs,
} from "@/lib/mortgage";

const DEFAULT_INPUTS: MortgageInputs = {
  propertyValue: 2_000_000,
  downPayment: 500_000,
  annualInterestRate: 5.5,
  loanTermYears: 25,
};

export default function MortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => calculateMortgage(inputs), [inputs]);

  const update = <K extends keyof MortgageInputs>(key: K, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(value)) return;
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const downPaymentPercent =
    inputs.propertyValue > 0
      ? Math.round((inputs.downPayment / inputs.propertyValue) * 100)
      : 0;

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
            מחשבון משכנתא
          </span>
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            העריכו את <span className="gold-gradient-text">ההחזר החודשי</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-white/50">
            כלי מהיר לתכנון משכנתא — הזינו את הפרטים וקבלו הערכה מיידית
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel overflow-hidden rounded-2xl"
        >
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="space-y-5 border-b border-navy-200/70 p-6 dark:border-white/10 sm:p-8 lg:border-b-0 lg:border-e">
              <MortgageField
                label="מחיר הנכס"
                value={inputs.propertyValue}
                onChange={(v) => update("propertyValue", v)}
                min={0}
                step={50000}
                suffix="₪"
              />
              <MortgageField
                label="הון עצמי"
                value={inputs.downPayment}
                onChange={(v) => update("downPayment", v)}
                min={0}
                max={inputs.propertyValue}
                step={10000}
                suffix="₪"
                hint={`${downPaymentPercent}% ממחיר הנכס`}
              />
              <MortgageField
                label="ריבית שנתית"
                value={inputs.annualInterestRate}
                onChange={(v) => update("annualInterestRate", v)}
                min={0}
                max={20}
                step={0.1}
                suffix="%"
              />
              <MortgageField
                label="תקופת הלוואה בשנים"
                value={inputs.loanTermYears}
                onChange={(v) => update("loanTermYears", v)}
                min={1}
                max={40}
                step={1}
                suffix="שנים"
              />
            </div>

            <div className="flex flex-col justify-center bg-gradient-to-br from-gold-500/10 via-transparent to-transparent p-6 sm:p-8">
              <div className="text-center">
                <div className="mb-2 text-xs font-medium tracking-widest text-slate-500 uppercase dark:text-white/40">
                  החזר חודשי משוער
                </div>
                <div className="font-display text-4xl font-bold tabular-nums text-gold-600 dark:text-gold-300 sm:text-5xl">
                  {formatCurrencyILS(Math.round(result.monthlyPayment))}
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-white/40">לחודש</div>
              </div>

              <div className="mt-8 space-y-3">
                <ResultRow label="סכום הלוואה" value={formatCurrencyILS(result.loanAmount)} />
                <ResultRow
                  label="סה״כ תשלומים"
                  value={formatCurrencyILS(Math.round(result.totalPayment))}
                />
                <ResultRow
                  label="סה״כ ריבית"
                  value={formatCurrencyILS(Math.round(result.totalInterest))}
                  icon={<TrendingUp className="h-3.5 w-3.5 text-gold-500/60" />}
                />
              </div>

              <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400 dark:text-white/30">
                * ההערכה מבוססת על נוסחת שפיצר סטנדרטית. התוצאה אינה מהווה הצעת משכנתא ויש להתייעץ עם יועץ משכנתאות.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MortgageField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-800 dark:text-white/80">{label}</label>
        {hint && <span className="text-xs text-gold-600/80 dark:text-gold-400/70">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className="luxury-input pe-12"
        />
        {suffix && (
          <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-white/40">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-navy-200/70 bg-slate-50 px-4 py-2.5 dark:border-white/8 dark:bg-white/[0.03]">
      <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/50">
        {icon}
        {label}
      </span>
      <span className="font-mono text-sm font-medium tabular-nums text-slate-900 dark:text-white/80">{value}</span>
    </div>
  );
}
