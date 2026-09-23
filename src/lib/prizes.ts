import { getHackathons, type Hackathon, type PrizeAmount } from "./hackathons";

export type PrizeCategory = "Cash & vouchers" | "Credits" | "Subscriptions" | "Funding";

export interface PrizeSummaryRow {
  category: PrizeCategory;
  currency: string;
  team: number;
  individual: number;
}

export interface PrizeRecord {
  hackathon: Hackathon;
  category: PrizeCategory;
  amount: PrizeAmount;
}

const categories: Array<[PrizeCategory, keyof NonNullable<Hackathon["prize"]>]> = [
  ["Cash & vouchers", "cash"],
  ["Credits", "credits"],
  ["Subscriptions", "subscriptionValue"],
  ["Funding", "funding"],
];

function isPrizeAmount(value: unknown): value is PrizeAmount {
  return Boolean(
    value &&
    typeof value === "object" &&
    "team" in value &&
    "individual" in value &&
    "currency" in value,
  );
}

export function getPrizeRecords(): PrizeRecord[] {
  return getHackathons()
    .flatMap((hackathon) => {
      if (!hackathon.prize) return [];
      return categories.flatMap(([category, field]) => {
        const amount = hackathon.prize?.[field];
        return isPrizeAmount(amount) ? [{ hackathon, category, amount }] : [];
      });
    })
    .sort((a, b) => b.hackathon.number - a.hackathon.number);
}

export function buildPrizeSummary(records = getPrizeRecords()): PrizeSummaryRow[] {
  const summary = new Map<string, PrizeSummaryRow>();
  for (const record of records) {
    const key = `${record.category}:${record.amount.currency}`;
    const current = summary.get(key) ?? {
      category: record.category,
      currency: record.amount.currency,
      team: 0,
      individual: 0,
    };
    current.team += record.amount.team;
    current.individual += record.amount.individual;
    summary.set(key, current);
  }

  const rank: Record<PrizeCategory, number> = {
    "Cash & vouchers": 0,
    Credits: 1,
    Subscriptions: 2,
    Funding: 3,
  };
  return [...summary.values()].sort(
    (a, b) => rank[a.category] - rank[b.category] || a.currency.localeCompare(b.currency),
  );
}

export function buildPrizeTotals(records = getPrizeRecords()) {
  const totals = new Map<string, { currency: string; team: number; individual: number }>();
  for (const record of records) {
    const current = totals.get(record.amount.currency) ?? {
      currency: record.amount.currency,
      team: 0,
      individual: 0,
    };
    current.team += record.amount.team;
    current.individual += record.amount.individual;
    totals.set(record.amount.currency, current);
  }
  return [...totals.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}

export function formatPrizeAmount(value: number, currency: string) {
  const prefix = currency === "SGD" ? "S$" : currency === "USD" ? "US$" : `${currency} `;
  return `${prefix}${new Intl.NumberFormat("en-SG", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}
