import { readSheet } from "read-excel-file/node";
import { DatabaseSync } from "node:sqlite";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const workbookPath = resolve("data/Hackathon CV.xlsx");
const databasePath = resolve("data/hackathons.db");

const columns = {
  number: 1,
  eventName: 2,
  organizers: 3,
  date: 4,
  duration: 5,
  durationUnit: 6,
  award: 7,
  theme: 8,
  solution: 9,
  team: 10,
  productName: 11,
  client: 12,
  country: 13,
  location: 14,
  sourceCode: 15,
  eventLink: 16,
};

const monthIndex = new Map([
  ["jan", 0], ["feb", 1], ["mar", 2], ["apr", 3], ["may", 4], ["jun", 5],
  ["jul", 6], ["aug", 7], ["sep", 8], ["oct", 9], ["nov", 10], ["dec", 11],
]);

function clean(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text && text !== "-" ? text : null;
}

function cleanUrl(value) {
  const text = clean(value);
  return text && /^https?:\/\//i.test(text) ? text : null;
}

function dateToIso(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function parseDateLabel(value) {
  if (value instanceof Date) {
    return { label: formatDate(value), startDate: dateToIso(value) };
  }

  const label = clean(value);
  if (!label) return { label: null, startDate: null };

  const numericDate = label.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (numericDate) {
    const [, day, month, rawYear] = numericDate;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return { label, startDate: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` };
  }

  const yearMatch = label.match(/\b(19|20)\d{2}\b/);
  const monthMatch = label.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\b/i);
  const dayMatch = label.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\b/i);

  if (yearMatch && monthMatch) {
    const month = monthIndex.get(monthMatch[1].slice(0, 3).toLowerCase());
    const day = dayMatch ? dayMatch[1].padStart(2, "0") : "01";
    return { label, startDate: `${yearMatch[0]}-${String(month + 1).padStart(2, "0")}-${day}` };
  }

  return { label, startDate: null };
}

function splitList(value) {
  const text = clean(value);
  return text ? text.split(/\s*(?:,|&|;)\s*/).map(clean).filter(Boolean) : [];
}

function splitMembers(value) {
  return splitList(value).map((member) => member.replace(/\s*\([^)]*\)/g, "").trim()).filter(Boolean);
}

function prepareSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    DROP VIEW IF EXISTS hackathon_catalog;
    DROP TABLE IF EXISTS hackathon_links;
    DROP TABLE IF EXISTS hackathon_awards;
    DROP TABLE IF EXISTS hackathon_tags;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS hackathon_members;
    DROP TABLE IF EXISTS people;
    DROP TABLE IF EXISTS hackathon_organizers;
    DROP TABLE IF EXISTS organizations;
    DROP TABLE IF EXISTS hackathons;

    CREATE TABLE hackathons (
      number INTEGER PRIMARY KEY,
      event_name TEXT NOT NULL,
      product_name TEXT,
      date_label TEXT,
      start_date TEXT,
      duration REAL,
      duration_unit TEXT,
      solution TEXT,
      client TEXT,
      country TEXT,
      location TEXT
    );

    CREATE TABLE organizations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE hackathon_organizers (
      hackathon_number INTEGER NOT NULL REFERENCES hackathons(number) ON DELETE CASCADE,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      PRIMARY KEY (hackathon_number, organization_id)
    );

    CREATE TABLE people (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE hackathon_members (
      hackathon_number INTEGER NOT NULL REFERENCES hackathons(number) ON DELETE CASCADE,
      person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      PRIMARY KEY (hackathon_number, person_id)
    );

    CREATE TABLE tags (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE hackathon_tags (
      hackathon_number INTEGER NOT NULL REFERENCES hackathons(number) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (hackathon_number, tag_id)
    );

    CREATE TABLE hackathon_awards (
      hackathon_number INTEGER PRIMARY KEY REFERENCES hackathons(number) ON DELETE CASCADE,
      award_text TEXT NOT NULL
    );

    CREATE TABLE hackathon_links (
      hackathon_number INTEGER NOT NULL REFERENCES hackathons(number) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('source_code', 'event')),
      url TEXT NOT NULL,
      PRIMARY KEY (hackathon_number, type)
    );

    CREATE INDEX idx_hackathons_start_date ON hackathons(start_date);
    CREATE INDEX idx_hackathons_country ON hackathons(country);
    CREATE INDEX idx_tags_name ON tags(name);
    CREATE INDEX idx_people_name ON people(name);

    CREATE VIEW hackathon_catalog AS
    SELECT
      h.number,
      COALESCE(NULLIF(h.product_name, ''), h.event_name) AS title,
      h.event_name AS event,
      h.date_label,
      h.start_date,
      h.duration,
      h.duration_unit,
      h.solution,
      h.client,
      h.country,
      h.location,
      a.award_text AS award,
      GROUP_CONCAT(DISTINCT t.name) AS tags,
      GROUP_CONCAT(DISTINCT o.name) AS organizers,
      GROUP_CONCAT(DISTINCT p.name) AS members,
      MAX(CASE WHEN l.type = 'source_code' THEN l.url END) AS github_url,
      MAX(CASE WHEN l.type = 'event' THEN l.url END) AS event_url
    FROM hackathons h
    LEFT JOIN hackathon_awards a ON a.hackathon_number = h.number
    LEFT JOIN hackathon_tags ht ON ht.hackathon_number = h.number
    LEFT JOIN tags t ON t.id = ht.tag_id
    LEFT JOIN hackathon_organizers ho ON ho.hackathon_number = h.number
    LEFT JOIN organizations o ON o.id = ho.organization_id
    LEFT JOIN hackathon_members hm ON hm.hackathon_number = h.number
    LEFT JOIN people p ON p.id = hm.person_id
    LEFT JOIN hackathon_links l ON l.hackathon_number = h.number
    GROUP BY h.number;
  `);
}

function findOrCreate(db, table, name) {
  const existing = db.prepare(`SELECT id FROM ${table} WHERE name = ?`).get(name);
  if (existing) return existing.id;
  return db.prepare(`INSERT INTO ${table} (name) VALUES (?)`).run(name).lastInsertRowid;
}

await mkdir(dirname(databasePath), { recursive: true });

const rows = await readSheet(workbookPath);
if (rows.length < 2) throw new Error("The workbook does not contain hackathon rows.");

const db = new DatabaseSync(databasePath);

try {
  prepareSchema(db);

  const insertHackathon = db.prepare(`
    INSERT INTO hackathons (
      number, event_name, product_name, date_label, start_date, duration,
      duration_unit, solution, client, country, location
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const linkOrganization = db.prepare("INSERT OR IGNORE INTO hackathon_organizers (hackathon_number, organization_id) VALUES (?, ?)");
  const linkPerson = db.prepare("INSERT OR IGNORE INTO hackathon_members (hackathon_number, person_id) VALUES (?, ?)");
  const linkTag = db.prepare("INSERT OR IGNORE INTO hackathon_tags (hackathon_number, tag_id) VALUES (?, ?)");
  const insertAward = db.prepare("INSERT INTO hackathon_awards (hackathon_number, award_text) VALUES (?, ?)");
  const insertLink = db.prepare("INSERT INTO hackathon_links (hackathon_number, type, url) VALUES (?, ?, ?)");

  db.exec("BEGIN");
  let imported = 0;

  for (const row of rows.slice(1)) {
    const valueAt = (column) => row[column - 1];
    const number = Number(valueAt(columns.number));
    const eventName = clean(valueAt(columns.eventName));
    if (!Number.isInteger(number) || !eventName) continue;

    const parsedDate = parseDateLabel(valueAt(columns.date));
    const duration = Number(valueAt(columns.duration));
    const award = clean(valueAt(columns.award));
    const sourceCode = cleanUrl(valueAt(columns.sourceCode));
    const eventUrl = cleanUrl(valueAt(columns.eventLink));

    insertHackathon.run(
      number, eventName, clean(valueAt(columns.productName)), parsedDate.label,
      parsedDate.startDate, Number.isFinite(duration) ? duration : null,
      clean(valueAt(columns.durationUnit)), clean(valueAt(columns.solution)),
      clean(valueAt(columns.client)), clean(valueAt(columns.country)), clean(valueAt(columns.location)),
    );

    for (const organizer of splitList(valueAt(columns.organizers))) {
      linkOrganization.run(number, findOrCreate(db, "organizations", organizer));
    }
    for (const member of splitMembers(valueAt(columns.team))) {
      linkPerson.run(number, findOrCreate(db, "people", member));
    }
    for (const tag of splitList(valueAt(columns.theme))) {
      linkTag.run(number, findOrCreate(db, "tags", tag));
    }
    if (award) insertAward.run(number, award);
    if (sourceCode) insertLink.run(number, "source_code", sourceCode);
    if (eventUrl) insertLink.run(number, "event", eventUrl);
    imported += 1;
  }

  db.exec("COMMIT");
  console.log(`Imported ${imported} hackathons into ${databasePath}`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
