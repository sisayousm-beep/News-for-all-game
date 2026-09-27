/**
 * Reads games/ from disk, parses it through the schemas and runs cross-file
 * consistency checks. Used by the site build (throws on any error) and by
 * `npm run validate` (prints every error).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import {
  GameConfig, RECORD_SCHEMAS, FACT_GRADE, LAYER_OF,
  type AnyRecord, type CodeRecord, type EntityRecord, type EventRecord, type ModuleConfig, type SourceRef, type VersionRecord,
} from './schema';

export const GAMES_DIR = join(process.cwd(), 'games');
const PUBLIC_DIR = join(process.cwd(), 'public');
const missing = (path?: string) => !!path && !existsSync(join(PUBLIC_DIR, path));

/** Built-in pages under /games/<id>/ that module ids must not shadow. */
const RESERVED_MODULE_IDS = ['sources'];

export interface Game {
  config: GameConfig;
  /** collection name → records, sorted by id. */
  collections: Record<string, AnyRecord[]>;
}

export interface LoadResult {
  games: Game[];
  errors: string[];
}

/** Parsed YAML, or an Error for syntax errors so they are reported like any other validation error. */
const readYaml = (file: string): unknown => {
  try { return parse(readFileSync(file, 'utf8')); } catch (e) { return e as Error; }
};
const yamlError = (v: unknown) => (v instanceof Error ? `YAML syntax: ${v.message.split('\n')[0]}` : null);
const fmt = (e: z.ZodError) => e.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
const yamlFiles = (dir: string) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort() : [];

export function loadGames(dir = GAMES_DIR): LoadResult {
  const errors: string[] = [];
  const games: Game[] = [];
  const gameIds = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort();

  for (const gameId of gameIds) {
    const where = `games/${gameId}/game.yaml`;
    const raw = readYaml(join(dir, gameId, 'game.yaml'));
    if (yamlError(raw)) {
      errors.push(`${where}: ${yamlError(raw)}`);
      continue;
    }
    const parsed = GameConfig.safeParse(raw);
    if (!parsed.success) {
      errors.push(`${where}: ${fmt(parsed.error)}`);
      continue;
    }
    const config: GameConfig = {
      ...parsed.data,
      modules: parsed.data.modules.map((m) => ({ ...m, id: m.id ?? m.collection })),
    };
    const err = (msg: string) => errors.push(`${where}: ${msg}`);
    if (config.id !== gameId) err(`id "${config.id}" must match folder name "${gameId}"`);
    dupes(config.modules.map((m) => m.id)).forEach((d) => err(`duplicate module id "${d}"`));
    config.modules.filter((m) => RESERVED_MODULE_IDS.includes(m.id)).forEach((m) => err(`module id "${m.id}" is reserved`));
    dupes(config.modules.map((m) => m.collection)).forEach((d) => err(`duplicate collection "${d}"`));
    dupes(config.sources.map((s) => s.id)).forEach((d) => err(`duplicate source id "${d}"`));
    for (const key of ['icon', 'cover'] as const)
      if (missing(config.theme[key])) err(`theme.${key} file public${config.theme[key]} does not exist`);
    const collections = new Set(config.modules.map((m) => m.collection));
    const sourceIds = new Set(config.sources.map((s) => s.id));
    for (const job of config.updates) {
      if (!collections.has(job.collection)) err(`update job "${job.id}" targets unknown collection "${job.collection}"`);
      job.sources.filter((s) => !sourceIds.has(s)).forEach((s) => err(`update job "${job.id}" uses unregistered source "${s}"`));
    }

    const game: Game = { config, collections: {} };
    for (const mod of config.modules) {
      game.collections[mod.collection] = loadCollection(dir, game, mod, errors);
    }
    checkSubjects(game).forEach((e) => errors.push(e));
    games.push(game);
  }
  return { games, errors };
}

function loadCollection(dir: string, game: Game, mod: ModuleConfig, errors: string[]): AnyRecord[] {
  const folder = join(dir, game.config.id, mod.collection);
  const records: AnyRecord[] = [];
  for (const file of yamlFiles(folder)) {
    const where = `games/${game.config.id}/${mod.collection}/${file}`;
    const raw = readYaml(join(folder, file));
    if (yamlError(raw)) {
      errors.push(`${where}: ${yamlError(raw)}`);
      continue;
    }
    const parsed = RECORD_SCHEMAS[mod.type].safeParse(raw);
    if (!parsed.success) {
      errors.push(`${where}: ${fmt(parsed.error)}`);
      continue;
    }
    const record = parsed.data as AnyRecord;
    const problems = checkRecord(record, basename(file, '.yaml'), game, mod);
    problems.forEach((p) => errors.push(`${where}: ${p}`));
    if (!problems.length) records.push(record);
  }
  return records;
}

/** Cross-file rules the schema alone cannot express. */
function checkRecord(rec: AnyRecord, fileId: string, game: Game, mod: ModuleConfig): string[] {
  const out: string[] = [];
  const sources = new Map(game.config.sources.map((s) => [s.id, s]));
  if (rec.id !== fileId) out.push(`id "${rec.id}" must match file name "${fileId}.yaml"`);

  if (missing(rec.image)) out.push(`image file public${rec.image} does not exist`);
  if (mod.type === 'database' && missing((rec as EntityRecord).keyVisual))
    out.push(`key visual file public${(rec as EntityRecord).keyVisual} does not exist`);

  const refs: SourceRef[] = [...rec.sources];
  if (mod.type === 'database') {
    const ent = rec as EntityRecord;
    ent.history.forEach((h) => refs.push(...h.sources));
    ent.topics.forEach((t) => refs.push(...t.sources));
  }
  for (const ref of refs) {
    const def = sources.get(ref.source);
    if (!def) {
      out.push(`source "${ref.source}" is not registered in game.yaml`);
      continue;
    }
    if (!def.domains.some((d) => urlMatches(ref.url, d)))
      out.push(`url ${ref.url} is not on a domain of source "${def.id}" (${def.domains.join(', ')})`);
  }

  // Certainty grades official facts only; analysis/community records are claims about calculations or opinions.
  const layer = LAYER_OF[mod.type];
  if (layer === 'official' && rec.certainty === 'confirmed' && !rec.sources.some((r) => FACT_GRADE.includes(sources.get(r.source)?.type as never)))
    out.push(`certainty "confirmed" needs at least one source of type ${FACT_GRADE.join('/')}; use "reported" otherwise`);
  if (layer === 'community' && !rec.sources.some((r) => ['COMMUNITY', 'GUIDE'].includes(sources.get(r.source)?.type as never)))
    out.push(`community records must cite at least one COMMUNITY/GUIDE source (the threads the summary is based on)`);

  if (mod.type === 'schedule' || mod.type === 'version' || mod.type === 'codes') {
    const { start, end } = rec as EventRecord | VersionRecord | CodeRecord;
    if (start && end && Date.parse(end) < Date.parse(start)) out.push(`end is before start`);
  }

  if (mod.type === 'database') {
    const attrs = (rec as EntityRecord).attributes;
    const fields = new Map(mod.fields.map((f) => [f.key, f]));
    Object.keys(attrs).filter((k) => !fields.has(k)).forEach((k) => out.push(`attribute "${k}" is not declared in module fields`));
    for (const f of mod.fields) {
      if (!(f.key in attrs)) out.push(`attribute "${f.key}" missing — write null if unknown`);
      const v = attrs[f.key];
      if (v != null && f.values && !(String(v) in f.values))
        out.push(`attribute "${f.key}" value "${v}" not in [${Object.keys(f.values).join(', ')}]`);
    }
    const topics = (rec as EntityRecord).topics;
    const sections = new Set(mod.sections.map((x) => x.key));
    topics.filter((t) => !sections.has(t.section)).forEach((t) => out.push(`topic "${t.id}" uses section "${t.section}" not declared in module sections`));
    dupes(topics.map((t) => t.id)).forEach((d) => out.push(`duplicate topic id "${d}"`));
  }
  return out;
}

/** Every `subjects` link must point at an existing record (and topic) of the same game. */
function checkSubjects(game: Game): string[] {
  const out: string[] = [];
  for (const mod of game.config.modules) {
    for (const rec of game.collections[mod.collection] ?? []) {
      for (const ref of rec.subjects) {
        const [path, topic] = ref.split('#');
        const [collection, id] = path.split('/');
        const target = (game.collections[collection] ?? []).find((r) => r.id === id);
        const where = `games/${game.config.id}/${mod.collection}/${rec.id}.yaml`;
        if (!target) out.push(`${where}: subject "${ref}" — no record ${collection}/${id}`);
        else if (topic && !((target as EntityRecord).topics ?? []).some((t) => t.id === topic)) out.push(`${where}: subject "${ref}" — ${collection}/${id} has no topic "${topic}"`);
      }
    }
  }
  return out;
}

/** `d` is a hostname (subdomains match) or hostname/path-prefix. */
export function urlMatches(url: string, d: string): boolean {
  const { hostname, pathname } = new URL(url);
  const [host, ...path] = d.split('/');
  const prefix = path.length ? `/${path.join('/')}` : '';
  const hostOk = hostname === host || hostname.endsWith(`.${host}`);
  return hostOk && (!prefix || pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const dupes = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
