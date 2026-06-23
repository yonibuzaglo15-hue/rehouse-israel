import * as XLSX from "xlsx";
import type { AmortizationRow } from "@/lib/mortgage/wizard-types";

const HEADERS = [
  "מספר תשלום",
  "החזר חודשי כולל",
  'החזר ע"ח הקרן',
  'החזר ע"ח הריבית',
  "יתרת החוב",
] as const;

function rowsToSheetData(rows: AmortizationRow[]): (string | number)[][] {
  return [
    [...HEADERS],
    ...rows.map((row) => [
      row.paymentNumber,
      Math.round(row.totalPayment),
      Math.round(row.principalPayment),
      Math.round(row.interestPayment),
      Math.round(row.remainingBalance),
    ]),
  ];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportAmortizationCsv(rows: AmortizationRow[], filename = "amortization-schedule.csv") {
  const data = rowsToSheetData(rows);
  const csv = data
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export function exportAmortizationXlsx(rows: AmortizationRow[], filename = "amortization-schedule.xlsx") {
  const worksheet = XLSX.utils.aoa_to_sheet(rowsToSheetData(rows));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "לוח סילוקין");
  XLSX.writeFile(workbook, filename);
}
