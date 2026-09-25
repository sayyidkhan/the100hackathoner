import rates from "../data/fx-usd-sgd.json";
import type { PrizeRecord } from "./prizes";

export const fxSource = "https://fred.stlouisfed.org/series/EXSIUS";
const byMonth = new Map(rates.map((rate) => [rate.month, rate.sgdPerUsd]));

export function getPrizeMonth(record: PrizeRecord): string | null {
  return record.hackathon.startDate?.slice(0, 7) ?? null;
}

export function getMonthlyRate(month: string | null): number | undefined {
  return month ? byMonth.get(month) : undefined;
}

export function getUsedFxMonths(records: PrizeRecord[]) {
  return [...new Set(records.map(getPrizeMonth).filter((month): month is string => Boolean(month)))]
    .sort()
    .map((month) => ({ month, sgdPerUsd: getMonthlyRate(month) }));
}

export function buildConvertedPrizeTotals(records: PrizeRecord[]) {
  const totals = {
    SGD: { team: 0, individual: 0 },
    USD: { team: 0, individual: 0 },
  };
  const pending: PrizeRecord[] = [];

  for (const record of records) {
    const { amount } = record;
    const rate = getMonthlyRate(getPrizeMonth(record));
    if (amount.currency !== "SGD" && amount.currency !== "USD") {
      pending.push(record);
      continue;
    }
    if (rate === undefined) {
      pending.push(record);
      continue;
    }
    totals.SGD.team += amount.currency === "SGD" ? amount.team : amount.team * rate;
    totals.SGD.individual += amount.currency === "SGD" ? amount.individual : amount.individual * rate;
    totals.USD.team += amount.currency === "USD" ? amount.team : amount.team / rate;
    totals.USD.individual += amount.currency === "USD" ? amount.individual : amount.individual / rate;
  }

  return { totals, pending };
}
