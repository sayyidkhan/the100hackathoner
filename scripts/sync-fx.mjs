import { readFile, writeFile } from "node:fs/promises";

const cacheUrl = new URL("../src/data/fx-usd-sgd.json", import.meta.url);
const hackathonsUrl = new URL("../src/data/hackathons.json", import.meta.url);
const sourceUrl = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=EXSIUS";

const hackathons = JSON.parse(await readFile(hackathonsUrl, "utf8"));
const existing = JSON.parse(await readFile(cacheUrl, "utf8"));
const needed = new Set(
  hackathons
    .filter((hackathon) => hackathon.prize)
    .map((hackathon) => hackathon.startDate?.slice(0, 7))
    .filter(Boolean),
);
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`FX download failed: ${response.status}`);
const published = new Map(
  (await response.text())
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(","))
    .filter(([date, value]) => /^\d{4}-\d{2}-01$/.test(date) && Number(value) > 0)
    .map(([date, value]) => [date.slice(0, 7), Number(value)]),
);

const stored = new Map(existing.map((rate) => [rate.month, rate.sgdPerUsd]));
const added = [];
for (const month of [...needed].sort()) {
  if (stored.has(month) || !published.has(month)) continue;
  stored.set(month, published.get(month));
  added.push(month);
}
const next = [...stored].sort(([a], [b]) => a.localeCompare(b)).map(([month, sgdPerUsd]) => ({ month, sgdPerUsd }));
if (added.length) await writeFile(cacheUrl, `${JSON.stringify(next, null, 2)}\n`);
console.log(added.length ? `Cached published FX months: ${added.join(", ")}` : "FX cache is up to date; no published months to add.");
const missing = [...needed].filter((month) => !stored.has(month)).sort();
if (missing.length) console.log(`Still awaiting monthly publication: ${missing.join(", ")}`);
