/**
 * Data contracts for every file under games/.
 * This file is the single source of truth: the site build and `npm run validate`
 * both parse data through these schemas. See docs/data-schemas.md.
 */
import { z } from 'zod';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase-kebab-case slug');

/** `2026-09-17` or `2026-09-17T10:00:00+09:00` (offset required for datetimes). */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z))?$/, 'ISO date, or datetime with offset')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'invalid date');

// ── Sources ─────────────────────────────────────────────────────────────────

/** Ordered from most to least authoritative. See docs/source-policy.md. */
export const SOURCE_TYPES = ['OFFICIAL', 'OFFICIAL_API', 'PRESS', 'DATABASE', 'WIKI', 'GUIDE', 'COMMUNITY'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/** Source types strong enough to back a `certainty: confirmed` fact on their own. */
export const FACT_GRADE: readonly SourceType[] = ['OFFICIAL', 'OFFICIAL_API', 'PRESS', 'DATABASE', 'WIKI'];

/** A source registered once in game.yaml and referenced by id from records. */
export const SourceDef = z.object({
  id: slug,
  name: z.string(),
  type: z.enum(SOURCE_TYPES),
  url: z.url(),
  /**
   * Where this source lives: a hostname (`maplestory.nexon.com`, subdomains included)
   * or hostname + path prefix (`inven.co.kr/webzine`). Every cited URL must match one.
   */
  domains: z.array(z.string()).min(1),
  note: z.string().optional(),
});

/** A citation attached to a record: which registered source, which page, and when. */
export const SourceRef = z.object({
  source: slug,
  url: z.url(),
  collectedAt: dateString,
  verifiedAt: dateString.optional(),
  note: z.string().optional(),
});
export type SourceRef = z.infer<typeof SourceRef>;

// ── Record building blocks ──────────────────────────────────────────────────

/** confirmed: backed by a fact-grade source. reported: stated by a source but not confirmed. speculative: leak / prediction. */
export const Certainty = z.enum(['confirmed', 'reported', 'speculative']);
export type Certainty = z.infer<typeof Certainty>;

/** Level 3 intelligence. Always rendered visibly apart from facts, never merged into them. */
export const Analysis = z.object({
  text: z.string(),
  author: z.string(), // e.g. "ai:claude", "ai:gpt", "editor"
  generatedAt: dateString,
  basedOn: z.array(SourceRef).min(1),
});

/** Fields shared by every record in every collection. */
const RecordBase = z.object({
  id: slug,
  title: z.string(),
  aliases: z.array(z.string()).default([]),
  summary: z.string().optional(),
  certainty: Certainty.default('confirmed'),
  sources: z.array(SourceRef).min(1),
  updatedAt: dateString,
  analysis: Analysis.optional(),
});
export type RecordBase = z.infer<typeof RecordBase>;

// ── Record schemas per module type ──────────────────────────────────────────

export const NEWS_CATEGORIES = ['notice', 'update', 'patch', 'event', 'maintenance', 'shop', 'announcement'] as const;

export const NewsRecord = RecordBase.extend({
  category: z.enum(NEWS_CATEGORIES),
  /** null = publish date not confirmable. Never guess; lists then order by collectedAt. */
  publishedAt: dateString.nullable(),
  tags: z.array(z.string()).default([]),
});
export type NewsRecord = z.infer<typeof NewsRecord>;

export const EVENT_KINDS = ['event', 'update', 'maintenance', 'banner', 'pass', 'shop', 'season'] as const;

export const EventRecord = RecordBase.extend({
  kind: z.enum(EVENT_KINDS),
  start: dateString,
  /** null = end not announced / unknown. */
  end: dateString.nullable(),
  /** Human qualifier the date cannot express, e.g. "점검 후". */
  startNote: z.string().optional(),
  endNote: z.string().optional(),
});
export type EventRecord = z.infer<typeof EventRecord>;

export const HISTORY_KINDS = ['release', 'rerun', 'buff', 'nerf', 'rework', 'change', 'other'] as const;

/** A user-facing change log entry — meaningful changes over time, not git history. */
export const HistoryEntry = z.object({
  /** null = exact date unknown (e.g. "3.6 후반부"); `version` still orders it. */
  date: dateString.nullable(),
  version: z.string().optional(),
  kind: z.enum(HISTORY_KINDS),
  summary: z.string(),
  sources: z.array(SourceRef).min(1),
});

/** Generic database entity (characters, jobs, bosses, items…). Shape of `attributes` is declared per game in game.yaml. */
export const EntityRecord = RecordBase.extend({
  /** null = unknown / not yet verified. Never guess a value. */
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).default({}),
  history: z.array(HistoryEntry).default([]),
});
export type EntityRecord = z.infer<typeof EntityRecord>;

export type AnyRecord = NewsRecord | EventRecord | EntityRecord;

// ── Game configuration (games/<id>/game.yaml) ───────────────────────────────

/** Declares one attribute of a database module (e.g. 속성, 무기, 등급). */
export const FieldDef = z.object({
  key: z.string(),
  label: z.string(),
  /** Allowed values → display label. Omit for free text / numbers. */
  values: z.record(z.string(), z.string()).optional(),
  filter: z.boolean().default(false),
});
export type FieldDef = z.infer<typeof FieldDef>;

export const MODULE_TYPES = ['news', 'schedule', 'database'] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

export const ModuleConfig = z.object({
  type: z.enum(MODULE_TYPES),
  /** URL segment and instance id. Defaults to the collection name. */
  id: slug.optional(),
  label: z.string(),
  /** Folder under games/<id>/ holding this module's records. */
  collection: slug,
  /** database modules only. */
  fields: z.array(FieldDef).default([]),
  /** database modules only: singular noun for one record, e.g. "공명자". */
  itemLabel: z.string().optional(),
});
export type ModuleConfig = z.infer<typeof ModuleConfig> & { id: string };

/** `6h`, `1d`, `7d` — or `patch` (on game patches) / `manual`. */
const Frequency = z.string().regex(/^(\d+[hd]|patch|manual)$/);

/** One independently schedulable AI update task. See docs/ai-update-rules.md. */
export const UpdateJob = z.object({
  id: slug,
  collection: slug,
  sources: z.array(slug).min(1),
  frequency: Frequency,
  instructions: z.string(),
});
export type UpdateJob = z.infer<typeof UpdateJob>;

export const GameConfig = z.object({
  id: slug,
  name: z.string(),
  names: z.record(z.string(), z.string()).default({}),
  description: z.string(),
  genre: z.string(),
  region: z.string(),
  locale: z.string().default('ko'),
  theme: z.object({ accent: z.string().regex(/^#[0-9a-fA-F]{6}$/), icon: z.string().optional() }),
  modules: z.array(ModuleConfig).min(1),
  sources: z.array(SourceDef).min(1),
  updates: z.array(UpdateJob).default([]),
});
export type GameConfig = Omit<z.infer<typeof GameConfig>, 'modules'> & { modules: ModuleConfig[] };
export type SourceDef = z.infer<typeof SourceDef>;

export const RECORD_SCHEMAS = { news: NewsRecord, schedule: EventRecord, database: EntityRecord } as const;
