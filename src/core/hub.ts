/**
 * Application layer: the only API pages/components use to read data.
 * Aggregation (global news, schedule, search) is derived from module types,
 * so a new game or module shows up everywhere without touching this file.
 */
import { loadGames, type Game } from './load';
import type { EntityRecord, EventRecord, ModuleConfig, ModuleType, NewsRecord, SourceDef } from './schema';

let cache: Game[] | undefined;

export function games(): Game[] {
  if (!cache) {
    const { games, errors } = loadGames();
    if (errors.length) throw new Error(`Invalid game data — run \`npm run validate\`:\n${errors.join('\n')}`);
    cache = games;
  }
  return cache;
}

export const game = (id: string) => games().find((g) => g.config.id === id)!;

export const modulesOf = (g: Game, type?: ModuleType) => g.config.modules.filter((m) => !type || m.type === type);

export const recordsOf = <T>(g: Game, mod: ModuleConfig) => (g.collections[mod.collection] ?? []) as T[];

export const sourceOf = (g: Game, id: string) => g.config.sources.find((s) => s.id === id) as SourceDef;

// ── URLs ────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path = '/') => `${BASE}${path}`;
export const gameHref = (g: Game, ...parts: string[]) => href(`/games/${[g.config.id, ...parts].join('/')}/`);

// ── Cross-game aggregation ──────────────────────────────────────────────────

export interface Tagged<T> { game: Game; mod: ModuleConfig; record: T }

function collect<T>(type: ModuleType): Tagged<T>[] {
  return games().flatMap((g) => modulesOf(g, type).flatMap((mod) => recordsOf<T>(g, mod).map((record) => ({ game: g, mod, record }))));
}

const desc = (a: string, b: string) => Date.parse(b) - Date.parse(a);

/** Sort key for news: publish date, or when we first collected it if the publish date is unknown. */
export const newsDate = (n: NewsRecord) => n.publishedAt ?? n.sources[0].collectedAt;

export const allNews = () => collect<NewsRecord>('news').sort((a, b) => desc(newsDate(a.record), newsDate(b.record)));

export const allEvents = () => collect<EventRecord>('schedule').sort((a, b) => Date.parse(a.record.start) - Date.parse(b.record.start));

/** Every history entry across database modules, newest first ("최근 변경"). */
export const allChanges = () =>
  collect<EntityRecord>('database')
    .flatMap((t) => t.record.history.flatMap((entry) => (entry.date ? [{ ...t, entry, date: entry.date }] : [])))
    .sort((a, b) => desc(a.date, b.date));

// ── Time ────────────────────────────────────────────────────────────────────

export type EventStatus = 'upcoming' | 'ongoing' | 'ended';

/** The site is Korean-first: date-only strings mean a KST calendar day, and all display is in KST. */
const SITE_TZ = { name: 'Asia/Seoul', offset: '+09:00' };

export const toTime = (s: string, endOfDay = false) =>
  Date.parse(s.length === 10 ? `${s}T${endOfDay ? '23:59:59' : '00:00:00'}${SITE_TZ.offset}` : s);

export function eventStatus(e: EventRecord, now = Date.now()): EventStatus {
  if (now < toTime(e.start)) return 'upcoming';
  if (e.end && now > toTime(e.end, true)) return 'ended';
  return 'ongoing';
}

export function formatDate(s: string, withTime = s.length > 10) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SITE_TZ.name, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(toTime(s));
}

// ── Search ──────────────────────────────────────────────────────────────────

/** Compact row shipped in /search-index.json. Keys are short to keep the file small. */
export interface SearchRow { t: string; a?: string[]; k: string; g: string; u: string; d?: string }

const nonEmpty = <T>(xs: T[]) => (xs.length ? xs : undefined);

export function searchRows(): SearchRow[] {
  return games().flatMap((g) => [
    { t: g.config.name, a: Object.values(g.config.names), k: '게임', g: g.config.id, u: gameHref(g) },
    ...modulesOf(g).flatMap((mod) =>
      recordsOf<NewsRecord & EventRecord & EntityRecord>(g, mod).map((r) => ({
        t: r.title,
        a: nonEmpty([...r.aliases, ...(r.tags ?? [])]),
        k: mod.type === 'database' ? (mod.itemLabel ?? mod.label) : mod.label,
        g: g.config.id,
        u: gameHref(g, mod.id, r.id),
        d: r.publishedAt ?? r.start ?? undefined,
      })),
    ),
  ]);
}
