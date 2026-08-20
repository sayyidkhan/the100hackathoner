import type { Hackathon } from "./hackathons";
import { classifyAward, getYear, type AwardTier } from "./format";

export const OWNER = "sayyid";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** Normalises exact event windows to minutes without changing their source unit. */
export function toMinutes(duration: number | null, unit: string | null) {
  if (!duration) return 0;

  switch (unit?.trim().toLowerCase()) {
    case "minute":
    case "minutes":
    case "min":
    case "mins":
      return duration;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
      return duration * MINUTES_PER_HOUR;
    case "day":
    case "days":
      return duration * MINUTES_PER_DAY;
    case "week":
    case "weeks":
      return duration * 7 * MINUTES_PER_DAY;
    case "month":
    case "months":
      return duration * 30 * MINUTES_PER_DAY;
    default:
      // Historical rows without a recognised unit were entered as days.
      return duration * MINUTES_PER_DAY;
  }
}

/** Exact elapsed days, used only when a day-based representation is needed. */
export function toDays(duration: number | null, unit: string | null) {
  return toMinutes(duration, unit) / MINUTES_PER_DAY;
}

/** Journey totals credit every logged hackathon with at least one day. */
export function toCountedDays(duration: number | null, unit: string | null) {
  const exactDays = toDays(duration, unit);
  return exactDays > 0 ? Math.max(1, exactDays) : 0;
}

const FIRST_PLACE_PATTERN = /\b(1st|first place|winner|champion|grand prize)\b/i;

export function isOutrightWin(award: string | null) {
  return Boolean(award?.trim() && FIRST_PLACE_PATTERN.test(award));
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) =>
      word.length > 1 && word === word.toLowerCase()
        ? word[0].toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");
}

/** Counts occurrences of a multi-value field, grouped case-insensitively. */
function tally(values: string[]) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const raw of values) {
    const label = raw.trim();
    if (!label) continue;

    const key = label.toLowerCase();
    const existing = counts.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: titleCase(label), count: 1 });
    }
  }

  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

export interface Totals {
  logged: number;
  goal: number;
  remaining: number;
  percent: number;
  awarded: number;
  podium: number;
  wins: number;
  days: number;
  months: number;
  events: number;
  venues: number;
  countries: number;
  collaborators: number;
  soloBuilds: number;
  teamBuilds: number;
  firstYear: number | null;
  latestYear: number | null;
  activeYears: number;
}

export interface DurationStats {
  shortestMinutes: number;
  longestMinutes: number;
  averageMinutes: number;
}

export interface DurationOccurrence {
  minutes: number;
  count: number;
}

/** Groups hackathons by their exact normalised event window. */
export function buildDurationOccurrences(items: Hackathon[]): DurationOccurrence[] {
  const counts = new Map<number, number>();

  for (const item of items) {
    const minutes = toMinutes(item.duration, item.durationUnit);
    if (minutes <= 0) continue;
    counts.set(minutes, (counts.get(minutes) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([minutes, count]) => ({ minutes, count }))
    .sort((a, b) => a.minutes - b.minutes);
}

/**
 * Summarises exact build windows in minutes. Credited journey days are kept
 * separate so a 45-minute sprint can remain visible without disappearing.
 */
export function buildDurationStats(items: Hackathon[]): DurationStats | null {
  const durations = items
    .map((item) => toMinutes(item.duration, item.durationUnit))
    .filter((duration) => duration > 0);

  if (!durations.length) return null;

  const shortestMinutes = Math.min(...durations);
  const longestMinutes = Math.max(...durations);
  const averageMinutes = Math.round(
    durations.reduce((sum, duration) => sum + duration, 0) / durations.length,
  );

  return { shortestMinutes, longestMinutes, averageMinutes };
}

export function buildTotals(items: Hackathon[], goal = 100): Totals {
  const years = items
    .map((item) => getYear(item.startDate, item.dateLabel))
    .filter((year): year is number => Boolean(year));

  const days = items.reduce(
    (sum, item) => sum + toCountedDays(item.duration, item.durationUnit),
    0,
  );

  const collaborators = new Set(
    items.flatMap((item) =>
      item.members
        .map((member) => member.trim().toLowerCase())
        .filter((member) => member && member !== OWNER),
    ),
  );

  const soloBuilds = items.filter((item) => item.members.length <= 1).length;
  const logged = items.length;

  return {
    logged,
    goal,
    remaining: Math.max(goal - logged, 0),
    percent: Math.round((logged / goal) * 100),
    awarded: items.filter((item) => Boolean(item.award?.trim())).length,
    podium: items.filter((item) => classifyAward(item.award) === "podium")
      .length,
    wins: items.filter((item) => isOutrightWin(item.award)).length,
    days: Math.round(days),
    months: Math.round((days / 30) * 10) / 10,
    events: new Set(items.map((item) => item.event.trim().toLowerCase())).size,
    venues: new Set(
      items
        .map((item) => item.location?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value)),
    ).size,
    countries: new Set(
      items
        .map((item) => item.country?.trim())
        .filter((value): value is string => Boolean(value)),
    ).size,
    collaborators: collaborators.size,
    soloBuilds,
    teamBuilds: logged - soloBuilds,
    firstYear: years.length ? Math.min(...years) : null,
    latestYear: years.length ? Math.max(...years) : null,
    activeYears: new Set(years).size,
  };
}

export interface YearStat {
  year: number;
  total: number;
  awarded: number;
  days: number;
  cumulative: number;
  dormant: boolean;
}

/**
 * One entry per calendar year between the first and last build, so dormant
 * years stay visible in the chart instead of being collapsed away.
 */
export function buildYearStats(items: Hackathon[]): YearStat[] {
  const byYear = new Map<number, { total: number; awarded: number; days: number }>();

  for (const item of items) {
    const year = getYear(item.startDate, item.dateLabel);
    if (!year) continue;

    const bucket = byYear.get(year) ?? { total: 0, awarded: 0, days: 0 };
    bucket.total += 1;
    if (item.award?.trim()) bucket.awarded += 1;
    bucket.days += toCountedDays(item.duration, item.durationUnit);
    byYear.set(year, bucket);
  }

  const years = [...byYear.keys()];
  if (!years.length) return [];

  const stats: YearStat[] = [];
  let cumulative = 0;

  for (let year = Math.min(...years); year <= Math.max(...years); year += 1) {
    const bucket = byYear.get(year);
    cumulative += bucket?.total ?? 0;

    stats.push({
      year,
      total: bucket?.total ?? 0,
      awarded: bucket?.awarded ?? 0,
      days: Math.round(bucket?.days ?? 0),
      cumulative,
      dormant: !bucket,
    });
  }

  return stats;
}

export const MONTH_INITIALS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface MonthStat {
  index: number;
  initial: string;
  name: string;
  count: number;
}

export function buildMonthStats(items: Hackathon[]): MonthStat[] {
  const counts = new Array(12).fill(0);

  for (const item of items) {
    if (!item.startDate) continue;
    const month = Number(item.startDate.slice(5, 7));
    if (month >= 1 && month <= 12) counts[month - 1] += 1;
  }

  return counts.map((count, index) => ({
    index,
    initial: MONTH_INITIALS[index],
    name: MONTH_NAMES[index],
    count,
  }));
}

export interface Ranked {
  label: string;
  count: number;
}

/** Every unique theme in the source log, ranked by recurrence. */
export function buildTagStats(items: Hackathon[], limit = Infinity): Ranked[] {
  return tally(items.flatMap((item) => item.tags)).slice(0, limit);
}

export function buildVenueStats(items: Hackathon[], limit = 8): Ranked[] {
  return tally(
    items
      .map((item) => item.location)
      .filter((value): value is string => Boolean(value)),
  ).slice(0, limit);
}

export function buildCountryStats(items: Hackathon[]): Ranked[] {
  return tally(
    items
      .map((item) => item.country)
      .filter((value): value is string => Boolean(value)),
  );
}

export function buildPeopleStats(items: Hackathon[], limit = 8): Ranked[] {
  return tally(
    items
      .flatMap((item) => item.members)
      .filter((member) => member.trim().toLowerCase() !== OWNER),
  ).slice(0, limit);
}

/** Counts teammates only on events where the source log records an award. */
export function buildHomeRunPeopleStats(
  items: Hackathon[],
  limit = 8,
): Ranked[] {
  return buildPeopleStats(
    items.filter((item) => Boolean(item.award?.trim())),
    limit,
  );
}

/** Counts awarded hackathons that included at least one teammate. */
export function buildHomeRunTeamCount(items: Hackathon[]) {
  return items.filter(
    (item) =>
      Boolean(item.award?.trim()) &&
      item.members.some((member) => member.trim().toLowerCase() !== OWNER),
  ).length;
}

export interface ParticipationModeStat {
  label: "Remote" | "On-site";
  count: number;
  days: number;
  awarded: number;
  teamBuilds: number;
}

export interface ParticipationModeStats {
  remote: ParticipationModeStat;
  onSite: ParticipationModeStat;
}

/** Returns true when the source log explicitly records a remote format. */
export function isRemoteParticipation(location: string | null) {
  return /\b(remote|virtual|online)\b/i.test(location ?? "");
}

/**
 * Remote events are explicitly marked in the source log. Everything else is
 * treated as an in-person event, which keeps the classification easy to audit.
 */
export function buildParticipationModeStats(
  items: Hackathon[],
): ParticipationModeStats {
  const createStat = (
    label: ParticipationModeStat["label"],
  ): ParticipationModeStat => ({
    label,
    count: 0,
    days: 0,
    awarded: 0,
    teamBuilds: 0,
  });

  const remote = createStat("Remote");
  const onSite = createStat("On-site");

  for (const item of items) {
    const stat = isRemoteParticipation(item.location) ? remote : onSite;

    stat.count += 1;
    stat.days += toCountedDays(item.duration, item.durationUnit);
    if (item.award?.trim()) stat.awarded += 1;
    if (item.members.length > 1) stat.teamBuilds += 1;
  }

  remote.days = Math.round(remote.days);
  onSite.days = Math.round(onSite.days);

  return { remote, onSite };
}

export interface AwardEntry {
  number: number;
  title: string;
  event: string;
  award: string;
  year: number | null;
  tier: AwardTier;
  win: boolean;
}

export function buildAwards(items: Hackathon[]): AwardEntry[] {
  return items
    .filter((item) => Boolean(item.award?.trim()))
    .map((item) => ({
      number: item.number,
      title: item.title,
      event: item.event,
      award: item.award!.trim(),
      year: getYear(item.startDate, item.dateLabel),
      tier: classifyAward(item.award),
      win: isOutrightWin(item.award),
    }))
    .sort((a, b) => b.number - a.number);
}

export interface GridCell {
  slot: number;
  item: Hackathon | null;
  tier: AwardTier | "empty";
  year: number | null;
}

/** 100 slots, one per planned hackathon, keyed by its number. */
export function buildGrid(items: Hackathon[], goal = 100): GridCell[] {
  const byNumber = new Map(items.map((item) => [item.number, item]));

  return Array.from({ length: goal }, (_, index) => {
    const slot = index + 1;
    const item = byNumber.get(slot) ?? null;

    return {
      slot,
      item,
      tier: item ? classifyAward(item.award) : "empty",
      year: item ? getYear(item.startDate, item.dateLabel) : null,
    };
  });
}
