import { readSheet } from "read-excel-file/node";
import { DatabaseSync } from "node:sqlite";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const workbookPath = resolve("data/Hackathon CV.xlsx");
const databasePath = resolve("data/hackathons.db");
const catalogPath = resolve("src/data/hackathons.json");

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
  const text = clean(value);
  if (!text) return [];

  return text
    .replace(/\s*\([^)]*\)/g, "")
    .split(/\s*(?:,|&|;|\/)+\s*/)
    .map(clean)
    .filter(Boolean);
}

function parsePeopleDirectory(rows) {
  const headerIndex = rows.findIndex((row) => {
    const labels = row.map(clean);
    return labels.includes("Name") && labels.includes("LinkedIn URL");
  });
  if (headerIndex === -1) return [];

  const headers = new Map(
    rows[headerIndex].map((value, index) => [clean(value), index]),
  );
  const valueAt = (row, label) => {
    const index = headers.get(label);
    return index === undefined ? undefined : row[index];
  };

  return rows.slice(headerIndex + 1).flatMap((row) => {
    const name = clean(valueAt(row, "Name"));
    if (!name) return [];
    return [{
      name,
      linkedinUrl: cleanUrl(valueAt(row, "LinkedIn URL")),
      company: clean(valueAt(row, "Company")),
      role: clean(valueAt(row, "Role")),
      location: clean(valueAt(row, "Location")),
      notes: clean(valueAt(row, "Notes")),
    }];
  });
}

/**
 * Resolves a short team-cell alias only when one directory entry owns that
 * first name. Ambiguous aliases stay untouched so similarly named people are
 * never merged by accident.
 */
function buildMemberNameResolver(peopleDirectory) {
  const canonicalNames = new Map();
  const aliases = new Map();

  for (const person of peopleDirectory) {
    const canonicalName = person.name.trim();
    const canonicalKey = canonicalName.toLowerCase();
    canonicalNames.set(canonicalKey, canonicalName);

    const alias = canonicalName.split(/\s+/)[0]?.toLowerCase();
    if (!alias) continue;
    const matches = aliases.get(alias) ?? new Set();
    matches.add(canonicalName);
    aliases.set(alias, matches);
  }

  return (rawName) => {
    const name = rawName.trim();
    const key = name.toLowerCase();
    const exactMatch = canonicalNames.get(key);
    if (exactMatch) return exactMatch;

    const aliasMatches = aliases.get(key);
    return aliasMatches?.size === 1 ? [...aliasMatches][0] : name;
  };
}

function emptySocialLinks() {
  return { linkedin: [], instagram: [], facebook: [] };
}

function splitUrls(value) {
  if (value === null || value === undefined) return [];
  return String(value).split(/\r?\n/).map(cleanUrl).filter(Boolean);
}

function parseSocialLinks(rows) {
  const headerIndex = rows.findIndex((row) => {
    const labels = row.map(clean);
    return labels.includes("Hackathon #") && labels.includes("LinkedIn");
  });
  if (headerIndex === -1) return new Map();

  const headers = new Map(
    rows[headerIndex].map((value, index) => [clean(value), index]),
  );
  const valueAt = (row, label) => {
    const index = headers.get(label);
    return index === undefined ? undefined : row[index];
  };

  return new Map(rows.slice(headerIndex + 1).flatMap((row) => {
    const match = String(valueAt(row, "Hackathon #") ?? "").match(/\d+/);
    if (!match) return [];
    return [[Number(match[0]), {
      linkedin: splitUrls(valueAt(row, "LinkedIn")),
      instagram: splitUrls(valueAt(row, "Instagram")),
      facebook: splitUrls(valueAt(row, "Facebook")),
    }]];
  }));
}

function parseThemeMap(rows) {
  const headerIndex = rows.findIndex((row) => {
    const labels = row.map(clean);
    return labels.includes("Raw Theme") && labels.includes("General Category");
  });
  if (headerIndex === -1) return new Map();

  const headers = new Map(
    rows[headerIndex].map((value, index) => [clean(value), index]),
  );
  const rawThemeIndex = headers.get("Raw Theme");
  const categoryIndex = headers.get("General Category");

  return new Map(rows.slice(headerIndex + 1).flatMap((row) => {
    const rawTheme = clean(row[rawThemeIndex]);
    const category = clean(row[categoryIndex]);
    return rawTheme && category
      ? [[rawTheme.toLowerCase(), category]]
      : [];
  }));
}

async function readOptionalSheet(workbook, sheetName) {
  try {
    return await readSheet(workbook, sheetName);
  } catch {
    return [];
  }
}

function splitCatalogValue(value) {
  return value ? value.split(",").filter(Boolean) : [];
}

function toCatalogEntry(row, socialLinks = emptySocialLinks(), themeCategories = []) {
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
    tags: splitCatalogValue(row.tags),
    categories: splitCatalogValue(row.categories),
    themeCategories,
    organizers: splitCatalogValue(row.organizers),
    members: splitCatalogValue(row.members),
    githubUrl: row.github_url,
    eventUrl: row.event_url,
    socialLinks,
  };
}

function prepareSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    DROP VIEW IF EXISTS hackathon_catalog;
    DROP TABLE IF EXISTS hackathon_links;
    DROP TABLE IF EXISTS hackathon_social_links;
    DROP TABLE IF EXISTS hackathon_awards;
    DROP TABLE IF EXISTS tag_categories;
    DROP TABLE IF EXISTS categories;
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
      name TEXT NOT NULL UNIQUE,
      linkedin_url TEXT,
      company TEXT,
      role TEXT,
      location TEXT,
      notes TEXT
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

    CREATE TABLE categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE tag_categories (
      tag_id INTEGER PRIMARY KEY REFERENCES tags(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
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

    CREATE TABLE hackathon_social_links (
      hackathon_number INTEGER NOT NULL REFERENCES hackathons(number) ON DELETE CASCADE,
      platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'facebook')),
      url TEXT NOT NULL,
      PRIMARY KEY (hackathon_number, platform, url)
    );

    CREATE INDEX idx_hackathons_start_date ON hackathons(start_date);
    CREATE INDEX idx_hackathons_country ON hackathons(country);
    CREATE INDEX idx_tags_name ON tags(name);
    CREATE INDEX idx_categories_name ON categories(name);
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
      GROUP_CONCAT(DISTINCT c.name) AS categories,
      GROUP_CONCAT(DISTINCT o.name) AS organizers,
      GROUP_CONCAT(DISTINCT p.name) AS members,
      MAX(CASE WHEN l.type = 'source_code' THEN l.url END) AS github_url,
      MAX(CASE WHEN l.type = 'event' THEN l.url END) AS event_url
    FROM hackathons h
    LEFT JOIN hackathon_awards a ON a.hackathon_number = h.number
    LEFT JOIN hackathon_tags ht ON ht.hackathon_number = h.number
    LEFT JOIN tags t ON t.id = ht.tag_id
    LEFT JOIN tag_categories tc ON tc.tag_id = t.id
    LEFT JOIN categories c ON c.id = tc.category_id
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

function findOrCreatePerson(db, name) {
  const existing = db
    .prepare("SELECT id FROM people WHERE name = ? COLLATE NOCASE")
    .get(name);
  if (existing) return existing.id;
  return db.prepare("INSERT INTO people (name) VALUES (?)").run(name).lastInsertRowid;
}

await Promise.all([
  mkdir(dirname(databasePath), { recursive: true }),
  mkdir(dirname(catalogPath), { recursive: true }),
]);

const [rows, peopleRows, socialRows, themeMapRows] = await Promise.all([
  readSheet(workbookPath, "Hackathons"),
  readSheet(workbookPath, "People"),
  readSheet(workbookPath, "Socials"),
  readOptionalSheet(workbookPath, "Theme Map"),
]);
if (rows.length < 2) throw new Error("The workbook does not contain hackathon rows.");
const peopleDirectory = parsePeopleDirectory(peopleRows);
const resolveMemberName = buildMemberNameResolver(peopleDirectory);
const workbookSocialLinks = parseSocialLinks(socialRows);
const themeMap = parseThemeMap(themeMapRows);

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
  const linkTagCategory = db.prepare("INSERT OR IGNORE INTO tag_categories (tag_id, category_id) VALUES (?, ?)");
  const insertAward = db.prepare("INSERT INTO hackathon_awards (hackathon_number, award_text) VALUES (?, ?)");
  const insertLink = db.prepare("INSERT INTO hackathon_links (hackathon_number, type, url) VALUES (?, ?, ?)");
  const insertSocialLink = db.prepare(
    "INSERT INTO hackathon_social_links (hackathon_number, platform, url) VALUES (?, ?, ?)",
  );
  const upsertPerson = db.prepare(`
    INSERT INTO people (name, linkedin_url, company, role, location, notes)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      linkedin_url = excluded.linkedin_url,
      company = excluded.company,
      role = excluded.role,
      location = excluded.location,
      notes = excluded.notes
  `);

  db.exec("BEGIN");
  let imported = 0;

  for (const person of peopleDirectory) {
    upsertPerson.run(
      person.name,
      person.linkedinUrl,
      person.company,
      person.role,
      person.location,
      person.notes,
    );
  }

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
      linkPerson.run(number, findOrCreatePerson(db, resolveMemberName(member)));
    }
    for (const tag of splitList(valueAt(columns.theme))) {
      const tagId = findOrCreate(db, "tags", tag);
      const category = themeMap.get(tag.toLowerCase()) ?? "Unclassified";
      linkTag.run(number, tagId);
      linkTagCategory.run(tagId, findOrCreate(db, "categories", category));
    }
    if (award) insertAward.run(number, award);
    if (sourceCode) insertLink.run(number, "source_code", sourceCode);
    if (eventUrl) insertLink.run(number, "event", eventUrl);
    const socialLinks = workbookSocialLinks.get(number) ?? emptySocialLinks();
    for (const [platform, urls] of Object.entries(socialLinks)) {
      for (const url of urls) insertSocialLink.run(number, platform, url);
    }
    imported += 1;
  }

  db.exec("COMMIT");
  const socialLinksByHackathon = new Map();
  for (const row of db
    .prepare("SELECT hackathon_number, platform, url FROM hackathon_social_links ORDER BY platform, url")
    .all()) {
    const links = socialLinksByHackathon.get(row.hackathon_number) ?? emptySocialLinks();
    links[row.platform].push(row.url);
    socialLinksByHackathon.set(row.hackathon_number, links);
  }
  const themeCategoriesByHackathon = new Map();
  for (const row of db
    .prepare(`
      SELECT ht.hackathon_number, t.name AS theme, c.name AS category
      FROM hackathon_tags ht
      JOIN tags t ON t.id = ht.tag_id
      JOIN tag_categories tc ON tc.tag_id = t.id
      JOIN categories c ON c.id = tc.category_id
      ORDER BY ht.hackathon_number, t.name
    `)
    .all()) {
    const themes = themeCategoriesByHackathon.get(row.hackathon_number) ?? [];
    themes.push({ theme: row.theme, category: row.category });
    themeCategoriesByHackathon.set(row.hackathon_number, themes);
  }
  const catalog = db
    .prepare("SELECT * FROM hackathon_catalog ORDER BY number DESC")
    .all()
    .map((row) => toCatalogEntry(
      row,
      socialLinksByHackathon.get(row.number),
      themeCategoriesByHackathon.get(row.number),
    ));
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Imported ${imported} hackathons and ${peopleDirectory.length} people into ${databasePath} and ${catalogPath}`);
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}
