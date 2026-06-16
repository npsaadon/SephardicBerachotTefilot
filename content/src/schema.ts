import { z } from "zod";

export const complexityEnum = z.enum(["simple", "note", "complex", "ask_rav"]);

export const foodSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  aliases: z.array(z.string().min(1)),
  categorySlug: z.string().min(1),
  berachaBefore: z.string().min(1),
  berachaAfter: z.string().min(1).nullable(),
  complexity: complexityEnum,
  notes: z.string(),
  amountAcharona: z.string().nullable(),
  timeAcharona: z.string().nullable(),
  source: z.string(),
  reviewed: z.boolean(),
  minhag: z.string().min(1),
  active: z.boolean(),
});

export const tefilaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  category: z.string().min(1),
  hebrew: z.string().min(1),
  translit: z.string(),
  english: z.string(),
  notes: z.string(),
  whenToSay: z.string(),
  nusach: z.string().min(1),
  source: z.string(),
  reviewed: z.boolean(),
  audioUrl: z.string().nullable(),
  sortOrder: z.number(),
  active: z.boolean(),
});

export const foodsFileSchema = z.array(foodSchema);
export const tefilotFileSchema = z.array(tefilaSchema);
