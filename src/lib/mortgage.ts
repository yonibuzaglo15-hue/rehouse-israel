export interface MortgageInputs {
  propertyValue: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

/** Standard amortization formula — monthly payment in ILS */
export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const { propertyValue, downPayment, annualInterestRate, loanTermYears } = inputs;

  const loanAmount = Math.max(0, propertyValue - downPayment);
  const months = Math.max(1, loanTermYears * 12);
  const monthlyRate = annualInterestRate / 100 / 12;

  if (loanAmount === 0) {
    return { loanAmount: 0, monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }

  if (monthlyRate === 0) {
    const monthlyPayment = loanAmount / months;
    return {
      loanAmount,
      monthlyPayment,
      totalPayment: monthlyPayment * months,
      totalInterest: 0,
    };
  }

  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - loanAmount;

  return { loanAmount, monthlyPayment, totalPayment, totalInterest };
}

export function formatCurrencyILS(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Strip commas/non-digits — pure number for calculator state */
export function parseCurrencyInput(raw: string): number {
  const normalized = raw.replace(/,/g, "").replace(/\D/g, "");
  if (normalized === "") return 0;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

/** Thousands separators for text inputs — e.g. 2000000 → 2,000,000 */
export function formatCurrencyInputDisplay(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return Math.floor(value).toLocaleString("en-US");
}
