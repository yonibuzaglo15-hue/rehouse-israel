"use client";

import { useMemo } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { buildCombinedAmortization } from "@/lib/mortgage/amortization";
import { exportAmortizationCsv, exportAmortizationXlsx } from "@/lib/mortgage/export-schedule";
import type { MixResult } from "@/lib/mortgage/wizard-types";
import { TRACK_COLORS } from "@/lib/mortgage/wizard-types";
import { formatCurrencyILS } from "@/lib/mortgage";

interface MortgageResultsProps {
  mix: MixResult;
}

export default function MortgageResults({ mix }: MortgageResultsProps) {
  const chartData = useMemo(
    () =>
      mix.tracks.map((track) => ({
        name: track.name,
        value: track.amount,
        percent: track.percentOfTotal,
        color: TRACK_COLORS[track.type],
      })),
    [mix.tracks],
  );

  const amortization = useMemo(() => buildCombinedAmortization(mix.tracks), [mix.tracks]);
  const previewRows = amortization.slice(0, 12);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-navy-200/70 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="mb-4 text-center text-sm font-medium text-slate-700 dark:text-white/70">
            הרכב התמהיל המומלץ
          </h3>
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name: string, item: { payload?: { percent?: number; name?: string } }) => [
                    `${formatCurrencyILS(value)} (${(item.payload?.percent ?? 0).toFixed(1)}%)`,
                    item.payload?.name ?? "",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center lg:text-start">
            <div className="text-xs font-medium tracking-widest text-slate-500 uppercase dark:text-white/40">
              החזר חודשי ראשוני משוקלל
            </div>
            <div className="font-display text-4xl font-bold tabular-nums text-gold-600 dark:text-gold-300">
              {formatCurrencyILS(Math.round(mix.totalMonthlyPayment))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-navy-200/70 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-white/[0.04] dark:text-white/50">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">מסלול</th>
                  <th className="px-3 py-2 text-start font-medium">סכום</th>
                  <th className="px-3 py-2 text-start font-medium">החזר</th>
                </tr>
              </thead>
              <tbody>
                {mix.tracks.map((track) => (
                  <tr key={track.id} className="border-t border-navy-200/50 dark:border-white/8">
                    <td className="px-3 py-2">{track.name}</td>
                    <td className="px-3 py-2 tabular-nums">{formatCurrencyILS(track.amount)}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatCurrencyILS(Math.round(track.monthlyPayment))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-slate-800 dark:text-white/80">
            לוח סילוקין צפוי — 12 תשלומים ראשונים
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportAmortizationCsv(amortization)}
              className="luxury-btn-ghost inline-flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <Download className="h-4 w-4" />
              ייצוא CSV
            </button>
            <button
              type="button"
              onClick={() => exportAmortizationXlsx(amortization)}
              className="luxury-btn-primary inline-flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <FileSpreadsheet className="h-4 w-4" />
              ייצוא לוח סילוקין צפוי
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-200/70 dark:border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-white/[0.04] dark:text-white/50">
              <tr>
                <th className="px-3 py-2 text-start font-medium">מס׳ תשלום</th>
                <th className="px-3 py-2 text-start font-medium">החזר כולל</th>
                <th className="px-3 py-2 text-start font-medium">קרן</th>
                <th className="px-3 py-2 text-start font-medium">ריבית</th>
                <th className="px-3 py-2 text-start font-medium">יתרה</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr key={row.paymentNumber} className="border-t border-navy-200/50 dark:border-white/8">
                  <td className="px-3 py-2 tabular-nums">{row.paymentNumber}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatCurrencyILS(Math.round(row.totalPayment))}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatCurrencyILS(Math.round(row.principalPayment))}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatCurrencyILS(Math.round(row.interestPayment))}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatCurrencyILS(Math.round(row.remainingBalance))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
