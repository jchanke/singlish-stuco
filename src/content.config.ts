// Import the glob loader
import { glob } from "astro/loaders";

// Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";

// Define a `loader` and `schema` for each collection
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    tags: z.array(z.string()),
  }),
});

const lessonSchema = z.object({
  title: z.string(),
  week: z.number().min(0),
  pubDate: z.date(),
  description: z.string(),
  author: z.string(),
  image: z.object({
    url: z.string().url(),
    alt: z.string(),
  }),
  objectives: z.array(z.string()),
  slides: z.string().url(),
  hw: z.string().url(),
  details_released: z.boolean(),
  slides_released: z.boolean(),
});

const lessons = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/lessons" }),
  schema: lessonSchema,
});

// Export a single `collections` object to register your collection(s)
export const collections = { blog, lessons };
