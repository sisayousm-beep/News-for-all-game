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

// ── Information layers ──────────────────────────────────────────────────────

/**
 * Every record belongs to exactly one layer, decided by its module type (LAYER_OF below).
 * official: what the publisher said · analysis: what the numbers work out to under stated conditions ·
 * community: what players currently think. Never mixed in one record. See docs/information-layers.md.
 */
export const LAYERS = ['official', 'analysis', 'community'] as const;
export type Layer = (typeof LAYERS)[number];

/** current: valid now · outdated: a patch changed the premise (kept, shown with a warning) · archived: history only. */
export const Freshness = z.enum(['current', 'outdated', 'archived']);

// ── Record building blocks ──────────────────────────────────────────────────

/** confirmed: backed by a fact-grade source. reported: stated by a source but not confirmed. speculative: leak / prediction. */
export const Certainty = z.enum(['confirmed', 'reported', 'speculative']);
export type Certainty = z.infer<typeof Certainty>;

/** Game version string, e.g. "3.7". */
const Version = z.string().regex(/^\d+(\.\d+)*$/, 'version like "3.7"');

/**
 * Link to another record of the same game: `<collection>/<id>` or `<collection>/<id>#<topic>`
 * (e.g. `resonators/cheongcho#chain-1`). This is how the three layers attach to the same subject.
 */
export const SubjectRef = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+(#[a-z0-9-]+)?$/, 'collection/id or collection/id#topic');

/**
 * Brevity limits (all games). Screens are conclusion-first: the short line is shown, details sit behind a toggle.
 * Long official text belongs summarized in `topics`, never pasted. See docs/information-layers.md.
 */
const short = (max: number) => z.string().max(max, `${max}자 이하로 요약 — 결론만 쓰고 세부는 나눠 적기`);
export const LIMITS = { summary: 200, topic: 300, conclusion: 150 } as const;

/** Fields shared by every record in every collection. */
const RecordBase = z.object({
  id: slug,
  title: z.string(),
  aliases: z.array(z.string()).default([]),
  summary: short(LIMITS.summary).optional(),
  /** Thumbnail / portrait under public/ (e.g. /games/<id>/img/x.webp). No hotlinking; lists fall back to a game-colored tile. */
  image: z.string().regex(/^\/games\//, 'path under public/games/, e.g. /games/<game>/img/<collection>/<id>.webp').optional(),
  /** Where the image was downloaded from (official page/CDN), so it can be re-fetched or checked. */
  imageFrom: z.url().optional(),
  certainty: Certainty.default('confirmed'),
  sources: z.array(SourceRef).min(1),
  updatedAt: dateString,
  /** Game version this information is based on ("기준 버전"). Required for analysis / community records. */
  version: Version.optional(),
  status: Freshness.default('current'),
  /** Records this one is about. Validated: every target (and #topic) must exist. */
  subjects: z.array(SubjectRef).default([]),
});
export type RecordBase = z.infer<typeof RecordBase>;

// ── Official layer ──────────────────────────────────────────────────────────

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
  /** Main official rewards, short ("별의 소리 ×800"). */
  rewards: z.array(z.string()).default([]),
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

/**
 * One official sub-item of an entity (a skill, a resonance chain node, a stat line, a weapon passive).
 * `text` is a short digest of the official description — not the full tooltip. Other layers link to it
 * with `subjects: [<collection>/<id>#<topic id>]`.
 */
export const Topic = z.object({
  id: slug,
  /** Key of a `sections` entry of the module (e.g. skills, chain). */
  section: z.string(),
  name: z.string(),
  text: short(LIMITS.topic).optional(),
  /** Key official numbers only (배율, 쿨타임, 에너지…), label → value. */
  values: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  /** Only when this topic cites something beyond the record's own sources. */
  sources: z.array(SourceRef).default([]),
});
export type Topic = z.infer<typeof Topic>;

/** Generic database entity (characters, jobs, bosses, items…). Shape of `attributes` is declared per game in game.yaml. */
export const EntityRecord = RecordBase.extend({
  /** Optional full character art, separate from the cropped list portrait. */
  keyVisual: z.string().regex(/^\/games\//, 'path under public/games/').optional(),
  keyVisualFrom: z.url().optional(),
  /** null = unknown / not yet verified. Never guess a value. */
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).default({}),
  topics: z.array(Topic).default([]),
  history: z.array(HistoryEntry).default([]),
});
export type EntityRecord = z.infer<typeof EntityRecord>;

/** A game version / season / major patch window. Other records attach to it by date or by `subjects`. */
export const VersionRecord = RecordBase.extend({
  version: Version,
  start: dateString,
  /** null = next version not announced. */
  end: dateString.nullable(),
  /** Official phases inside the version (전반부 / 후반부…). */
  phases: z.array(z.object({ name: z.string(), start: dateString.nullable(), end: dateString.nullable() })).default([]),
  /** Short official headline items (신규 지역, 신규 시스템…). */
  highlights: z.array(z.string()).default([]),
});
export type VersionRecord = z.infer<typeof VersionRecord>;

/** Redeem code. Expired codes stay as history (never deleted). */
export const CodeRecord = RecordBase.extend({
  code: z.string().regex(/^[A-Za-z0-9]+$/, 'code: letters and digits only'),
  rewards: z.array(z.string()).min(1),
  /** null = release date unknown. */
  start: dateString.nullable(),
  /** null = no announced expiry. */
  end: dateString.nullable(),
});
export type CodeRecord = z.infer<typeof CodeRecord>;

// ── Analysis layer ──────────────────────────────────────────────────────────

/** Generic across games; labels in i18n. */
export const ANALYSIS_KINDS = ['breakpoint', 'weapon', 'dps', 'stat', 'build', 'currency', 'event', 'cost', 'farming', 'gacha', 'banner', 'other'] as const;

/**
 * A calculated / statistical result derived from official data. Never an absolute truth:
 * it is only valid under its `assumptions`, which are required and always shown next to the numbers.
 */
export const AnalysisRecord = RecordBase.extend({
  kind: z.enum(ANALYSIS_KINDS),
  version: Version,
  /** How the numbers were produced (formula, simulator, sample), one or two sentences. */
  method: z.string(),
  /** Conditions the result depends on (무기, 에코, 로테이션, 적 조건…). */
  assumptions: z.array(z.string()).min(1),
  /** Version of the calculator / sheet / method, when the source has one. */
  calculationVersion: z.string().optional(),
  /** Optional one-phrase answer shown above everything (e.g. "명전 추천"); results[0] then explains it. */
  answer: short(20).optional(),
  /** Findings as conditional sentences ("이 조건에서 약 …"). results[0] is the conclusion shown on top. */
  results: z.array(short(LIMITS.conclusion)).min(1),
  table: z.object({
    columns: z.array(z.string()).min(2),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).min(1),
    note: z.string().optional(),
  }).optional(),
  /**
   * One bar chart shown right under the conclusion (e.g. 명함→6돌 딜). `delta: true` labels bars as
   * change from the first point ("+14.7%"). Values must also appear in `table` (the chart's data view).
   */
  chart: z.object({
    title: short(60),
    unit: z.string().max(4).default('%'),
    delta: z.boolean().default(false),
    points: z.array(z.object({ label: short(12), value: z.number() })).min(2).max(12),
  }).optional(),
});
export type AnalysisRecord = z.infer<typeof AnalysisRecord>;

// ── Community layer ─────────────────────────────────────────────────────────

export const COMMUNITY_KINDS = ['evaluation', 'investment', 'team', 'feel', 'story', 'version', 'tip', 'mistake', 'debate', 'issue'] as const;
/** Hot issues are either about the game itself or about things around it (festivals, incidents, payments…). */
export const ISSUE_SCOPES = ['ingame', 'offgame'] as const;

/** How much the observed opinions agree — a descriptive label, never a score. */
export const CONSENSUS = ['strong', 'moderate', 'mixed', 'weak'] as const;

/**
 * A digest of opinions actually observed in player communities — not facts and not the editor's view.
 * Every point must be traceable to the cited threads; the AI summarizes, it never invents an evaluation.
 */
export const CommunityRecord = RecordBase.extend({
  kind: z.enum(COMMUNITY_KINDS),
  version: Version,
  /** The conclusion shown on top: the prevailing view in one or two short sentences. */
  summary: short(LIMITS.conclusion),
  consensus: z.enum(CONSENSUS),
  /** Hot issues / tips: 게임 내 or 게임 외, when it happened, and what people are reacting to (one line of context). */
  scope: z.enum(ISSUE_SCOPES).optional(),
  happenedAt: dateString.optional(),
  background: short(150).optional(),
  /** Story evaluations: the arc in a few sentences, a 0–5 rating with its basis (and per-part scores), 국내/해외 reactions kept apart. */
  flow: short(300).optional(),
  rating: z.object({
    value: z.number().min(0).max(5),
    basis: short(80),
    parts: z.array(z.object({ label: short(40), value: z.number().min(0).max(5) })).default([]),
  }).optional(),
  regions: z.array(z.object({
    region: z.enum(['domestic', 'overseas']),
    summary: short(200),
    positive: z.array(z.string()).default([]),
    negative: z.array(z.string()).default([]),
  })).default([]),
  /**
   * Headline verdicts players look for, shown first (and in the entity page's "한눈에 보기"):
   * e.g. 티어 / 파티 순위 / 전용 무기 의존도 / 추천 돌파. Labels are free per game; each must be backed by the cited sources.
   */
  verdicts: z.array(z.object({ label: short(20), value: short(60) })).default([]),
  /** Evaluation at release vs now, when they differ (meta shifts, new supports, powercreep). */
  shift: z.object({ release: short(60), now: short(60), reason: short(150) }).optional(),
  positive: z.array(z.string()).default([]),
  negative: z.array(z.string()).default([]),
  /** Opposing camps, each with its reasons. */
  divided: z.array(z.object({ position: z.string(), reasons: z.array(z.string()).min(1) })).default([]),
  tips: z.array(z.object({ text: z.string(), when: z.string().optional(), who: z.string().optional() })).default([]),
});
export type CommunityRecord = z.infer<typeof CommunityRecord>;

export type AnyRecord = NewsRecord | EventRecord | EntityRecord | VersionRecord | CodeRecord | AnalysisRecord | CommunityRecord;

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

export const MODULE_TYPES = ['news', 'schedule', 'database', 'version', 'codes', 'analysis', 'community'] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

/** Which information layer each module type belongs to. */
export const LAYER_OF: Record<ModuleType, Layer> = {
  news: 'official', schedule: 'official', database: 'official', version: 'official', codes: 'official',
  analysis: 'analysis', community: 'community',
};

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
  /** database modules only: official sub-item groups shown on the detail page, in order (스킬, 공명 체인…). */
  sections: z.array(z.object({ key: z.string(), label: z.string() })).default([]),
  /**
   * database modules only: rows of the detail page's "한눈에 보기", in order. Each entry is a community
   * verdict label, or `analysis:<kind>=<label>` for the first linked calculation of that kind (its answer).
   * Missing rows are skipped. Unset: first calculation + all verdicts of the top community record.
   */
  glance: z.array(z.string()).default([]),
  /** database modules only: `contain` shows the whole image (weapons, items); `cover` crops to the frame (character art). */
  imageFit: z.enum(['cover', 'contain']).default('cover'),
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
  /** Developer / publisher shown on game cards, e.g. "Nexon". */
  publisher: z.string().optional(),
  region: z.string(),
  locale: z.string().default('ko'),
  theme: z.object({
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    /** Square logo/icon under public/. */
    icon: z.string().optional(),
    /** Wide key visual (16:9) under public/: game cards, hub header, and the fallback thumbnail. */
    cover: z.string().optional(),
  }),
  modules: z.array(ModuleConfig).min(1),
  sources: z.array(SourceDef).min(1),
  updates: z.array(UpdateJob).default([]),
});
export type GameConfig = Omit<z.infer<typeof GameConfig>, 'modules'> & { modules: ModuleConfig[] };
export type SourceDef = z.infer<typeof SourceDef>;

export const RECORD_SCHEMAS = {
  news: NewsRecord, schedule: EventRecord, database: EntityRecord, version: VersionRecord, codes: CodeRecord,
  analysis: AnalysisRecord, community: CommunityRecord,
} as const;
