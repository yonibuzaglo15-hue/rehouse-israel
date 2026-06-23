"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { MixResult } from "@/lib/mortgage/wizard-types";
import { formatCurrencyILS } from "@/lib/mortgage";

interface MortgageMixSummaryProps {
  mix: MixResult;
}

export default function MortgageMixSummary({ mix }: MortgageMixSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="סכום משכנתא" value={formatCurrencyILS(mix.loanAmount)} />
        <StatCard
          label="החזר חודשי משוקלל"
          value={formatCurrencyILS(Math.round(mix.totalMonthlyPayment))}
          highlight
        />
        <StatCard label="תקופת הלוואה מקסימלית" value={`${mix.maxTermYears} שנים`} />
      </div>

      <div
        className={[
          "flex items-start gap-3 rounded-xl border px-4 py-3",
          mix.dtiExceeded
            ? "border-amber-400/40 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
            : "border-emerald-400/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100",
        ].join(" ")}
      >
        {mix.dtiExceeded ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <div className="text-sm">
          <p className="font-medium">
            יחס החזר להכנסה: {Math.round(mix.dtiRatio * 100)}%
            {mix.dtiExceeded ? " — חורג מ-35%" : " — בטווח המותר"}
          </p>
          <p className="mt-1 text-xs opacity-80">
            הכנסה חודשית כוללת: {formatCurrencyILS(mix.totalIncome)} | מסלולים קבועים:{" "}
            {mix.fixedRatePercent.toFixed(1)}% (מינימום 33% לפי בנק ישראל)
          </p>
        </div>
      </div>

      {mix.warnings.length > 0 ? (
        <div className="space-y-2">
          {mix.warnings.map((warning) => (
            <div
              key={warning}
              className="rounded-lg border border-amber-300/40 bg-amber-50/80 px-4 py-2 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
            >
              {warning}
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-navy-200/70 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-white/[0.04] dark:text-white/50">
            <tr>
              <th className="px-4 py-3 text-start font-medium">מסלול</th>
              <th className="px-4 py-3 text-start font-medium">סכום</th>
              <th className="px-4 py-3 text-start font-medium">אחוז</th>
              <th className="px-4 py-3 text-start font-medium">ריבית</th>
              <th className="px-4 py-3 text-start font-medium">החזר ראשוני</th>
            </tr>
          </thead>
          <tbody>
            {mix.tracks.map((track) => (
              <tr
                key={track.id}
                className="border-t border-navy-200/50 dark:border-white/8"
              >
                <td className="px-4 py-3 text-slate-900 dark:text-white/90">{track.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrencyILS(track.amount)}</td>
                <td className="px-4 py-3 tabular-nums">{track.percentOfTotal.toFixed(1)}%</td>
                <td className="px-4 py-3 tabular-nums">{track.annualInterestRate}%</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatCurrencyILS(Math.round(track.monthlyPayment))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-white/40">
        התמהיל נבנה אוטומטית לפי פרופיל הסיכון, מגבלות בנק ישראל (לפחות 33% ריבית קבועה), והעדפת
        פירעון מוקדם בכספים עתידיים במסלול משתנה כל 5 שנים.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-navy-200/70 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="text-xs text-slate-500 dark:text-white/45">{label}</div>
      <div
        className={[
          "mt-1 font-display text-xl font-bold tabular-nums",
          highlight ? "text-gold-600 dark:text-gold-300" : "text-slate-900 dark:text-white",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
