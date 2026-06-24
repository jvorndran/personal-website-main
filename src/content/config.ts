import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    status: z.enum(['active', 'archived', 'wip']).default('active'),
    github: z.string().url().optional(),
    url: z.string().url().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { projects };
