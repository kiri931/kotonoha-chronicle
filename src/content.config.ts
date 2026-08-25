import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { eras } from './data/eras';
import { values } from './data/values';

const eraIds = eras.map((e) => e.id) as [string, ...string[]];
const valueIds = values.map((v) => v.id) as [string, ...string[]];

const quote = z.object({
  text: z.string().min(1),
  reading: z.string().optional(),
  meaning: z.string().min(40).max(200),
  source: z.string().min(1),
  confidence: z.enum(['確実', '諸説あり', '伝承']),
});

const image = z.object({
  src: z.string(),
  credit: z.string(),
  license: z.string(),
  sourceUrl: z.string().url(),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/people' }),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    kana: z.string(),
    nameEn: z.string(),
    eraId: z.enum(eraIds),
    birth: z.number().nullable(),
    death: z.number().nullable(),
    fields: z.array(z.string()).min(1),
    headline: z.string().max(30),
    summaryShort: z.string().min(40).max(120),
    history: z.string().min(300).max(900),
    quotes: z.array(quote).min(1),
    values: z.array(z.enum(valueIds)).min(1).max(3),
    /** 仕様への追加（README に記載）：value ごとの「この人の場合」の1文 */
    valueNotes: z.record(z.string(), z.string()).optional(),
    image: image.nullable(),
    related: z.array(z.string()).default([]),
    refs: z.array(z.object({ title: z.string(), url: z.string().url(), license: z.string() })).min(1),
  }),
});

export const collections = { people };
