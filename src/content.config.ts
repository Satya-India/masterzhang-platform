import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Programmatic local landing pages — one file per service city.
 * Each entry carries both EN and ZH copy so /locations/[slug] and
 * /zh/locations/[slug] render from a single source of truth.
 */
const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/locations' }),
  schema: z.object({
    /** City name, English */
    name: z.string(),
    /** City name, Simplified Chinese */
    nameZh: z.string(),
    /** Regional context, e.g. "York Region" */
    region: z.string().default('York Region'),
    /** Forward Sortation Areas covered (first 3 chars of postal code) */
    fsaCodes: z.array(z.string().length(3)),
    /** Coordinates used in JSON-LD per page */
    geo: z.object({ lat: z.number(), lng: z.number() }),
    /** Median response / drive time from our Markham dispatch hub */
    driveTimeMin: z.number(),
    intro: z.string(),
    introZh: z.string(),
    /** Neighbourhood-level hooks for long-tail SEO */
    highlights: z.array(z.string()),
    highlightsZh: z.array(z.string()),
    /** Which vertical leads in this city */
    featuredService: z.enum(['moving', 'cleaning', 'junk', 'yard', 'snow']),
    /** Number of jobs completed here (social proof stat) */
    jobsCompleted: z.number(),
  }),
});

export const collections = { locations };
