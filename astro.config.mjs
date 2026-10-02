import { defineConfig } from "astro/config";

const vercelHostname = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const site = process.env.SITE_URL ?? (vercelHostname ? `https://${vercelHostname}` : "http://localhost:18481");

export default defineConfig({
  site,
  server: {
    port: 18481,
  },
  devToolbar: {
    enabled: false,
  },
});
