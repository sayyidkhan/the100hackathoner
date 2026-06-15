import { defineCollection, z } from "astro:content";

const hackathons = defineCollection({
  type: "content",
  schema: z.object({
    number: z.number(),
    title: z.string(),
    event: z.string(),
    date: z.string(),
    result: z.string(),
    project: z.string(),
    stack: z.array(z.string()),
    lesson: z.string(),
    demoUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

const essays = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
  }),
});

const judging = defineCollection({
  type: "content",
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    event: z.string(),
    date: z.string(),
    role: z.string(),
    domain: z.string(),
    criteria: z.array(z.string()),
    patterns: z.array(z.string()),
    lesson: z.string(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
});

const principles = defineCollection({
  type: "content",
  schema: z.object({
    draft: z.boolean().optional(),
    number: z.number(),
    title: z.string(),
    date: z.string(),
    theme: z.string(),
    statement: z.string(),
    evidence: z.string().optional(),
    relatedHackathons: z.array(z.number()).optional(),
  }),
});

export const collections = { hackathons, essays, judging, principles };
