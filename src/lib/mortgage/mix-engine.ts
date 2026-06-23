import { calculateMonthlyPayment } from "@/lib/mortgage/amortization";
import type {
  MixResult,
  MortgageTrack,
  RiskProfile,
  TrackType,
  WizardProfile,
} from "@/lib/mortgage/wizard-types";
import { TRACK_LABELS } from "@/lib/mortgage/wizard-types";

const DTI_LIMIT = 0.35;
const MIN_FIXED_RATE_SHARE = 0.33;

const TRACK_RATES: Record<TrackType, number> = {
  kalatz: 4.8,
  katz: 5.0,
  prime: 6.0,
  malatz: 5.3,
  variable5y: 5.5,
};

interface SplitAllocation {
  type: TrackType;
  share: number;
}

const RISK_SPLITS: Record<RiskProfile, SplitAllocation[]> = {
  low: [
    { type: "kalatz", share: 0.45 },
    { type: "prime", share: 0.3 },
    { type: "malatz", share: 0.25 },
  ],
  medium: [
    { type: "kalatz", share: 0.35 },
    { type: "prime", share: 0.35 },
    { type: "malatz", share: 0.3 },
  ],
  high: [
    { type: "katz", share: 0.33 },
    { type: "prime", share: 0.27 },
    { type: "malatz", share: 0.4 },
  ],
};

function isFixedTrack(type: TrackType): boolean {
  return type === "kalatz" || type === "katz";
}

function roundAmount(value: number): number {
  return Math.round(value);
}

function createTrack(
  type: TrackType,
  amount: number,
  termYears: number,
  id: string,
  loanAmount: number,
): MortgageTrack | null {
  if (amount <= 0) return null;

  const monthlyPayment = calculateMonthlyPayment(amount, TRACK_RATES[type], termYears);

  return {
    id,
    name: TRACK_LABELS[type],
    type,
    amount,
    annualInterestRate: TRACK_RATES[type],
    termYears,
    isFixedRate: isFixedTrack(type),
    monthlyPayment,
    percentOfTotal: loanAmount > 0 ? (amount / loanAmount) * 100 : 0,
  };
}

function rebalanceFixedMinimum(tracks: MortgageTrack[], loanAmount: number, termYears: number): MortgageTrack[] {
  if (loanAmount <= 0) return tracks;

  const fixedAmount = tracks
    .filter((track) => track.isFixedRate)
    .reduce((sum, track) => sum + track.amount, 0);

  const minFixed = loanAmount * MIN_FIXED_RATE_SHARE;
  if (fixedAmount >= minFixed) return tracks;

  const deficit = minFixed - fixedAmount;
  const variableTracks = tracks.filter((track) => !track.isFixedRate);
  const fixedTracks = tracks.filter((track) => track.isFixedRate);

  if (variableTracks.length === 0) return tracks;

  const largestVariable = [...variableTracks].sort((a, b) => b.amount - a.amount)[0];
  const transfer = Math.min(deficit, largestVariable.amount);

  const updated = tracks
    .map((track) => {
      if (track.id === largestVariable.id) {
        const amount = track.amount - transfer;
        return createTrack(track.type, amount, termYears, track.id, loanAmount);
      }
      return track;
    })
    .filter((track): track is MortgageTrack => track !== null);

  const primaryFixedType: TrackType =
    fixedTracks[0]?.type ?? (tracks.some((t) => t.type === "katz") ? "katz" : "kalatz");

  const existingFixed = updated.find((track) => track.isFixedRate);
  if (existingFixed) {
    return updated
      .map((track) =>
        track.id === existingFixed.id
          ? createTrack(track.type, track.amount + transfer, termYears, track.id, loanAmount)
          : track,
      )
      .filter((track): track is MortgageTrack => track !== null);
  }

  return [
    ...updated,
    createTrack(primaryFixedType, transfer, termYears, "fixed-top-up", loanAmount)!,
  ];
}

export function getMaxTermYears(oldestBorrowerAge: number): number {
  return Math.max(1, Math.min(30, 80 - oldestBorrowerAge));
}

export function buildRecommendedMix(profile: WizardProfile): MixResult {
  const warnings: string[] = [];
  const loanAmount = Math.max(0, profile.propertyValue - profile.downPayment);
  const maxTermYears = getMaxTermYears(profile.oldestBorrowerAge);
  const totalIncome = profile.monthlyNetIncome + profile.additionalIncome;

  if (loanAmount === 0) {
    return {
      tracks: [],
      loanAmount: 0,
      maxTermYears,
      totalMonthlyPayment: 0,
      totalIncome,
      dtiRatio: 0,
      dtiExceeded: false,
      fixedRatePercent: 0,
      warnings: ["לא נותר סכום משכנתא לאחר הון עצמי."],
    };
  }

  if (profile.downPayment / profile.propertyValue < 0.25) {
    warnings.push("הון עצמי נמוך מ-25% — ייתכן שיידרשו תנאים מחמירים יותר בבנק.");
  }

  let variable5yAmount = 0;
  if (profile.hasFutureLumpSum && profile.futureLumpSumAmount > 0) {
    variable5yAmount = Math.min(profile.futureLumpSumAmount, loanAmount);
  }

  const remainder = loanAmount - variable5yAmount;
  const splits = RISK_SPLITS[profile.riskProfile];
  const rawTracks: MortgageTrack[] = [];

  if (variable5yAmount > 0) {
    const track = createTrack("variable5y", variable5yAmount, maxTermYears, "variable-5y", loanAmount);
    if (track) rawTracks.push(track);
  }

  let allocated = 0;
  splits.forEach((split, index) => {
    const isLast = index === splits.length - 1;
    const amount = isLast
      ? remainder - allocated
      : roundAmount(remainder * split.share);
    allocated += amount;

    const track = createTrack(split.type, amount, maxTermYears, `${split.type}-${index}`, loanAmount);
    if (track) rawTracks.push(track);
  });

  let tracks = rebalanceFixedMinimum(rawTracks, loanAmount, maxTermYears);

  const trackSum = tracks.reduce((sum, track) => sum + track.amount, 0);
  if (trackSum !== loanAmount && tracks.length > 0) {
    const diff = loanAmount - trackSum;
    const last = tracks[tracks.length - 1];
    tracks = [
      ...tracks.slice(0, -1),
      createTrack(last.type, last.amount + diff, maxTermYears, last.id, loanAmount)!,
    ];
  }

  tracks = tracks.map((track) => ({
    ...track,
    percentOfTotal: loanAmount > 0 ? (track.amount / loanAmount) * 100 : 0,
  }));

  const totalMonthlyPayment = tracks.reduce((sum, track) => sum + track.monthlyPayment, 0);
  const fixedRatePercent =
    loanAmount > 0
      ? (tracks.filter((t) => t.isFixedRate).reduce((s, t) => s + t.amount, 0) / loanAmount) * 100
      : 0;

  if (fixedRatePercent < MIN_FIXED_RATE_SHARE * 100 - 0.01) {
    warnings.push('שיעור המסלולים הקבועים נמוך מ-33% — נדרש עמידה בכלל בנק ישראל.');
  }

  const dtiRatio = totalIncome > 0 ? totalMonthlyPayment / totalIncome : 1;
  const dtiExceeded = dtiRatio > DTI_LIMIT;

  if (dtiExceeded) {
    warnings.push(
      `יחס ההחזר (${Math.round(dtiRatio * 100)}%) חורג מ-35% מההכנסה החודשית הכוללת.`,
    );
  }

  return {
    tracks,
    loanAmount,
    maxTermYears,
    totalMonthlyPayment,
    totalIncome,
    dtiRatio,
    dtiExceeded,
    fixedRatePercent,
    warnings,
  };
}
