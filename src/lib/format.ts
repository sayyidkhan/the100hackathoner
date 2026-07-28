const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_LOOKUP: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

interface DateParts {
  day: number | null;
  month: number | null;
  year: number | null;
}

function normalizeYear(value: number) {
  return value < 100 ? 2000 + value : value;
}

function parseNumericPart(text: string): DateParts | null {
  const match = text.match(/^(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (day < 1 || day > 31 || month < 0 || month > 11) return null;

  return {
    day,
    month,
    year: match[3] ? normalizeYear(Number(match[3])) : null,
  };
}

function parseTextPart(text: string): DateParts | null {
  const word = text.match(/[A-Za-z]+/);
  let month: number | null = null;

  if (word) {
    const resolved = MONTH_LOOKUP[word[0].toLowerCase()];
    if (resolved === undefined) return null;
    month = resolved;
  }

  let day: number | null = null;
  let year: number | null = null;

  for (const raw of text.match(/\d+/g) ?? []) {
    const value = Number(raw);
    if (raw.length === 4) {
      year = value;
    } else if (day === null && value >= 1 && value <= 31) {
      day = value;
    } else if (year === null && raw.length === 2) {
      year = normalizeYear(value);
    }
  }

  if (day === null && month === null) return null;
  return { day, month, year };
}

function parsePart(text: string) {
  return parseNumericPart(text) ?? parseTextPart(text);
}

function isComplete(parts: DateParts) {
  return parts.day !== null && parts.month !== null && parts.year !== null;
}

/**
 * The source spreadsheet records dates in a dozen different shapes
 * ("18/7/2026", "Nov 22-23, 2025", "31Oct - 2 Nov, 2025", "17/5/26").
 * This renders them all as one house style and falls back to the raw
 * label whenever a shape cannot be parsed with confidence.
 */
export function formatDateLabel(
  label: string | null,
  isoDate: string | null = null,
) {
  const source = label?.trim();

  if (!source) {
    if (!isoDate) return null;
    const [year, month, day] = isoDate.split("-").map(Number);
    if (!year || !month || !day) return null;
    return `${day} ${MONTHS[month - 1]} ${year}`;
  }

  const chunks = source
    .replace(/[\u2012-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .split("-")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length < 1 || chunks.length > 2) return source;

  const parsed = chunks.map(parsePart);
  if (parsed.some((part) => part === null)) return source;

  if (parsed.length === 1) {
    const only = parsed[0]!;
    if (!isComplete(only)) return source;
    return `${only.day} ${MONTHS[only.month!]} ${only.year}`;
  }

  const start = parsed[0]!;
  const end = parsed[1]!;

  end.month ??= start.month;
  end.year ??= start.year;
  start.month ??= end.month;
  start.year ??= end.year;

  if (!isComplete(start) || !isComplete(end)) return source;

  if (start.year !== end.year) {
    return `${start.day} ${MONTHS[start.month!]} ${start.year} – ${end.day} ${MONTHS[end.month!]} ${end.year}`;
  }

  if (start.month !== end.month) {
    return `${start.day} ${MONTHS[start.month!]} – ${end.day} ${MONTHS[end.month!]} ${end.year}`;
  }

  if (start.day === end.day) {
    return `${start.day} ${MONTHS[start.month!]} ${start.year}`;
  }

  return `${start.day}–${end.day} ${MONTHS[start.month!]} ${start.year}`;
}

export function formatDuration(
  duration: number | null,
  unit: string | null,
) {
  if (!duration || !unit) return null;

  const amount = Number.isInteger(duration)
    ? String(duration)
    : String(Number(duration.toFixed(1)));
  const base = unit.trim().toLowerCase().replace(/s$/, "");
  const plural = duration === 1 ? base : `${base}s`;

  return `${amount} ${plural}`;
}

export type AwardTier = "podium" | "recognised" | "shipped";

const PODIUM_PATTERN =
  /\b(1st|2nd|3rd|first|second|third|winner|champion|best|grand)\b/i;

export function classifyAward(award: string | null): AwardTier {
  const value = award?.trim();
  if (!value) return "shipped";
  return PODIUM_PATTERN.test(value) ? "podium" : "recognised";
}

export function formatTeam(members: string[]) {
  if (members.length <= 1) return "Solo";
  return `Team of ${members.length}`;
}

export function getYear(isoDate: string | null, dateLabel: string | null) {
  if (isoDate) {
    const year = Number(isoDate.slice(0, 4));
    if (year) return year;
  }

  const match = dateLabel?.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : null;
}
