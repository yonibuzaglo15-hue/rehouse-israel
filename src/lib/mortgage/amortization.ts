import type { AmortizationRow, MortgageTrack } from "@/lib/mortgage/wizard-types";

/** Spitzer monthly payment for a single track */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termYears: number,
): number {
  if (principal <= 0) return 0;

  const months = Math.max(1, termYears * 12);
  const monthlyRate = annualInterestRate / 100 / 12;

  if (monthlyRate === 0) return principal / months;

  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** Full amortization schedule for one track */
export function buildTrackAmortization(track: MortgageTrack): AmortizationRow[] {
  const months = Math.max(1, track.termYears * 12);
  const monthlyRate = track.annualInterestRate / 100 / 12;
  const payment = track.monthlyPayment;
  const rows: AmortizationRow[] = [];

  let balance = track.amount;

  for (let i = 1; i <= months && balance > 0.01; i += 1) {
    const interestPayment = monthlyRate === 0 ? 0 : balance * monthlyRate;
    const principalPayment = Math.min(balance, payment - interestPayment);
    const totalPayment = principalPayment + interestPayment;
    balance = Math.max(0, balance - principalPayment);

    rows.push({
      paymentNumber: i,
      totalPayment,
      principalPayment,
      interestPayment,
      remainingBalance: balance,
    });
  }

  return rows;
}

/** Merge per-track schedules into a single monthly combined schedule */
export function buildCombinedAmortization(tracks: MortgageTrack[]): AmortizationRow[] {
  const perTrack = tracks.map(buildTrackAmortization);
  const maxMonths = Math.max(0, ...perTrack.map((rows) => rows.length));
  const combined: AmortizationRow[] = [];

  for (let month = 0; month < maxMonths; month += 1) {
    let totalPayment = 0;
    let principalPayment = 0;
    let interestPayment = 0;
    let remainingBalance = 0;

    for (const schedule of perTrack) {
      const row = schedule[month];
      if (!row) continue;
      totalPayment += row.totalPayment;
      principalPayment += row.principalPayment;
      interestPayment += row.interestPayment;
      remainingBalance += row.remainingBalance;
    }

    combined.push({
      paymentNumber: month + 1,
      totalPayment,
      principalPayment,
      interestPayment,
      remainingBalance,
    });
  }

  return combined;
}
