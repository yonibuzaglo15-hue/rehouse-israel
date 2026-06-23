export type RiskProfile = "low" | "medium" | "high";

export type TrackType = "kalatz" | "katz" | "prime" | "malatz" | "variable5y";

export interface WizardProfile {
  propertyValue: number;
  downPayment: number;
  oldestBorrowerAge: number;
  monthlyNetIncome: number;
  additionalIncome: number;
  hasFutureLumpSum: boolean;
  futureLumpSumAmount: number;
  riskProfile: RiskProfile;
}

export interface MortgageTrack {
  id: string;
  name: string;
  type: TrackType;
  amount: number;
  annualInterestRate: number;
  termYears: number;
  isFixedRate: boolean;
  monthlyPayment: number;
  percentOfTotal: number;
}

export interface MixResult {
  tracks: MortgageTrack[];
  loanAmount: number;
  maxTermYears: number;
  totalMonthlyPayment: number;
  totalIncome: number;
  dtiRatio: number;
  dtiExceeded: boolean;
  fixedRatePercent: number;
  warnings: string[];
}

export interface AmortizationRow {
  paymentNumber: number;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export const DEFAULT_WIZARD_PROFILE: WizardProfile = {
  propertyValue: 2_000_000,
  downPayment: 500_000,
  oldestBorrowerAge: 35,
  monthlyNetIncome: 25_000,
  additionalIncome: 3_000,
  hasFutureLumpSum: false,
  futureLumpSumAmount: 0,
  riskProfile: "medium",
};

export const TRACK_LABELS: Record<TrackType, string> = {
  kalatz: 'קל"צ (קבועה לא צמודה)',
  katz: 'ק"צ (קבועה צמודה)',
  prime: "פריים",
  malatz: 'מל"צ (משתנה לא צמודה)',
  variable5y: 'מל"צ כל 5 שנים',
};

export const TRACK_COLORS: Record<TrackType, string> = {
  kalatz: "#c9952e",
  katz: "#dfa84d",
  prime: "#0a1929",
  malatz: "#4a7c9b",
  variable5y: "#6b9e78",
};
