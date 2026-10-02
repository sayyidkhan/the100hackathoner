import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getHackathons } from "../lib/hackathons";

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL("https://the100hackathoner.vercel.app");
  const paths = ["/", "/about/", "/hackathons/", "/awards/", "/judging/", "/principles/", "/essays/", "/waitlist/", "/workshops/", "/case-studies/"];
  paths.push(...getHackathons().map(({ number }) => `/hackathons/${number}/`));
  for (const collection of ["essays", "judging", "principles"] as const) {
    const entries = await getCollection(collection);
    paths.push(...entries.filter(({ data }) => !("draft" in data && data.draft)).map(({ slug }) => `/${collection}/${slug}/`));
  }
  const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
  const urls = paths.map((path) => `<url><loc>${escape(new URL(path, origin).href)}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
