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
  GameConfig, RECORD_SCHEMAS, FACT_GRADE,
  type AnyRecord, type EntityRecord, type EventRecord, type ModuleConfig, type SourceRef,
} from './schema';

export const GAMES_DIR = join(process.cwd(), 'games');

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

const readYaml = (file: string): unknown => parse(readFileSync(file, 'utf8'));
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
    const parsed = GameConfig.safeParse(readYaml(join(dir, gameId, 'game.yaml')));
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
    games.push(game);
  }
  return { games, errors };
}

function loadCollection(dir: string, game: Game, mod: ModuleConfig, errors: string[]): AnyRecord[] {
  const folder = join(dir, game.config.id, mod.collection);
  const records: AnyRecord[] = [];
  for (const file of yamlFiles(folder)) {
    const where = `games/${game.config.id}/${mod.collection}/${file}`;
    const parsed = RECORD_SCHEMAS[mod.type].safeParse(readYaml(join(folder, file)));
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

  const refs: SourceRef[] = [...rec.sources, ...(rec.analysis?.basedOn ?? [])];
  if (mod.type === 'database') (rec as EntityRecord).history.forEach((h) => refs.push(...h.sources));
  for (const ref of refs) {
    const def = sources.get(ref.source);
    if (!def) {
      out.push(`source "${ref.source}" is not registered in game.yaml`);
      continue;
    }
    if (!def.domains.some((d) => urlMatches(ref.url, d)))
      out.push(`url ${ref.url} is not on a domain of source "${def.id}" (${def.domains.join(', ')})`);
  }

  if (rec.certainty === 'confirmed' && !rec.sources.some((r) => FACT_GRADE.includes(sources.get(r.source)?.type as never)))
    out.push(`certainty "confirmed" needs at least one source of type ${FACT_GRADE.join('/')}; use "reported" otherwise`);

  if (mod.type === 'schedule') {
    const ev = rec as EventRecord;
    if (ev.end && Date.parse(ev.end) < Date.parse(ev.start)) out.push(`end is before start`);
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
