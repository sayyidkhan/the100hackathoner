import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://the100hackathoner.vercel.app");

export default defineConfig({
  site,
  server: {
    port: 18481,
  },
  devToolbar: {
    enabled: false,
  },
});
