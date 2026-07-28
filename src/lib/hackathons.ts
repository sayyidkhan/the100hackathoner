import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";

export interface Hackathon {
  number: number;
  title: string;
  event: string;
  dateLabel: string | null;
  startDate: string | null;
  duration: number | null;
  durationUnit: string | null;
  solution: string | null;
  client: string | null;
  country: string | null;
  location: string | null;
  award: string | null;
  tags: string[];
  organizers: string[];
  members: string[];
  githubUrl: string | null;
  eventUrl: string | null;
}

interface CatalogRow {
  number: number;
  title: string;
  event: string;
  date_label: string | null;
  start_date: string | null;
  duration: number | null;
  duration_unit: string | null;
  solution: string | null;
  client: string | null;
  country: string | null;
  location: string | null;
  award: string | null;
  tags: string | null;
  organizers: string | null;
  members: string | null;
  github_url: string | null;
  event_url: string | null;
}

const databasePath = resolve(process.cwd(), "data/hackathons.db");

function splitValues(value: string | null) {
  return value ? value.split(",").filter(Boolean) : [];
}

function toHackathon(row: CatalogRow): Hackathon {
  return {
    number: row.number,
    title: row.title,
    event: row.event,
    dateLabel: row.date_label,
    startDate: row.start_date,
    duration: row.duration,
    durationUnit: row.duration_unit,
    solution: row.solution,
    client: row.client,
    country: row.country,
    location: row.location,
    award: row.award,
    tags: splitValues(row.tags),
    organizers: splitValues(row.organizers),
    members: splitValues(row.members),
    githubUrl: row.github_url,
    eventUrl: row.event_url,
  };
}

function withDatabase<T>(query: (db: DatabaseSync) => T): T {
  const db = new DatabaseSync(databasePath, { readOnly: true });
  try {
    return query(db);
  } finally {
    db.close();
  }
}

export function getHackathons(): Hackathon[] {
  return withDatabase((db) =>
    (db.prepare("SELECT * FROM hackathon_catalog ORDER BY number DESC").all() as unknown as CatalogRow[]).map(
      toHackathon,
    ),
  );
}

export function getHackathon(number: number): Hackathon | undefined {
  return withDatabase((db) => {
    const row = db.prepare("SELECT * FROM hackathon_catalog WHERE number = ?").get(number) as CatalogRow | undefined;
    return row ? toHackathon(row) : undefined;
  });
}
