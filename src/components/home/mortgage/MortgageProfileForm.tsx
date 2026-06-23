"use client";

import type { WizardProfile, RiskProfile } from "@/lib/mortgage/wizard-types";
import { getMaxTermYears } from "@/lib/mortgage/mix-engine";
import {
  CURRENCY_INPUT_CLASS,
  formatCurrencyDisplay,
  parseDigitsOnly,
} from "@/components/home/mortgage/wizard-helpers";

interface MortgageProfileFormProps {
  profile: WizardProfile;
  onChange: (profile: WizardProfile) => void;
}

const RISK_OPTIONS: { value: RiskProfile; label: string; description: string }[] = [
  {
    value: "low",
    label: "סיכון נמוך",
    description: "יציבות והחזר קבוע — 45% קל\"צ, 30% פריים, 25% מל\"צ",
  },
  {
    value: "medium",
    label: "סיכון בינוני",
    description: "מאוזן — 35% קל\"צ, 35% פריים, 30% מל\"צ",
  },
  {
    value: "high",
    label: "סיכון גבוה",
    description: "החזר ראשוני נמוך — 33% ק\"צ, 27% פריים, 40% מל\"צ",
  },
];

export default function MortgageProfileForm({ profile, onChange }: MortgageProfileFormProps) {
  const maxTerm = getMaxTermYears(profile.oldestBorrowerAge);
  const loanAmount = Math.max(0, profile.propertyValue - profile.downPayment);
  const downPaymentPercent =
    profile.propertyValue > 0
      ? Math.round((profile.downPayment / profile.propertyValue) * 100)
      : 0;

  const update = <K extends keyof WizardProfile>(key: K, value: WizardProfile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <CurrencyField
          id="property-value"
          label="שווי הנכס"
          value={profile.propertyValue}
          onChange={(next) => {
            onChange({
              ...profile,
              propertyValue: next,
              downPayment: next > 0 && profile.downPayment > next ? next : profile.downPayment,
            });
          }}
        />
        <CurrencyField
          id="down-payment"
          label="הון עצמי"
          value={profile.downPayment}
          hint={`${downPaymentPercent}% משווי הנכס`}
          onChange={(next) =>
            update(
              "downPayment",
              profile.propertyValue > 0 ? Math.min(next, profile.propertyValue) : next,
            )
          }
        />
      </div>

      <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 px-4 py-3 text-sm text-slate-700 dark:text-white/70">
        סכום משכנתא נדרש:{" "}
        <span className="font-semibold tabular-nums text-gold-700 dark:text-gold-300">
          {loanAmount.toLocaleString("he-IL")} ₪
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          id="borrower-age"
          label="גיל הלווה המבוגר ביותר"
          value={profile.oldestBorrowerAge}
          min={18}
          max={79}
          suffix="שנים"
          hint={`תקופה מקסימלית: ${maxTerm} שנים (עד גיל 80)`}
          onChange={(next) => update("oldestBorrowerAge", next)}
        />
        <CurrencyField
          id="monthly-income"
          label="הכנסה חודשית קבועה נטו"
          value={profile.monthlyNetIncome}
          onChange={(next) => update("monthlyNetIncome", next)}
        />
        <CurrencyField
          id="additional-income"
          label="הכנסות נוספות / משתנות"
          value={profile.additionalIncome}
          hint="קצבאות, שכר דירה, בונוסים"
          onChange={(next) => update("additionalIncome", next)}
        />
      </div>

      <div className="rounded-xl border border-navy-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={profile.hasFutureLumpSum}
            onChange={(e) => update("hasFutureLumpSum", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500"
          />
          <span className="text-sm text-slate-800 dark:text-white/85">
            צפויים כספים חד-פעמיים ב-5 השנים הקרובות?
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-white/45">
              קרן השתלמות, ירושה או סכום שישוחרר בקרוב
            </span>
          </span>
        </label>

        {profile.hasFutureLumpSum ? (
          <div className="mt-4">
            <CurrencyField
              id="future-lump-sum"
              label="סכום צפוי"
              value={profile.futureLumpSumAmount}
              onChange={(next) => update("futureLumpSumAmount", next)}
            />
          </div>
        ) : null}
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-slate-800 dark:text-white/80">
          העדפת סיכון
        </legend>
        <div className="grid gap-3">
          {RISK_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={[
                "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                profile.riskProfile === option.value
                  ? "border-gold-500/50 bg-gold-500/10"
                  : "border-navy-200/70 bg-white dark:border-white/10 dark:bg-white/[0.02]",
              ].join(" ")}
            >
              <input
                type="radio"
                name="risk-profile"
                value={option.value}
                checked={profile.riskProfile === option.value}
                onChange={() => update("riskProfile", option.value)}
                className="mt-1 h-4 w-4 border-navy-300 text-gold-600 focus:ring-gold-500"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900 dark:text-white">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-white/45">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function CurrencyField({
  id,
  label,
  value,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-white/80">
          {label}
        </label>
        {hint ? (
          <span className="text-xs text-gold-600/80 dark:text-gold-400/70">{hint}</span>
        ) : null}
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          dir="ltr"
          value={formatCurrencyDisplay(value)}
          onChange={(e) => onChange(parseDigitsOnly(e.target.value))}
          className={CURRENCY_INPUT_CLASS}
        />
        <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-white/40">
          ₪
        </span>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-white/80">
          {label}
        </label>
        {hint ? (
          <span className="text-xs text-gold-600/80 dark:text-gold-400/70">{hint}</span>
        ) : null}
      </div>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={value || ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = e.target.value === "" ? 0 : Number(e.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          className="luxury-input pe-12"
        />
        {suffix ? (
          <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-white/40">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
