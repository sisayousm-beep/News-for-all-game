/**
 * Application layer: the only API pages/components use to read data.
 * Aggregation (global news, schedule, search) is derived from module types,
 * so a new game or module shows up everywhere without touching this file.
 */
import { loadGames, type Game } from './load';
import { historyKind } from '../i18n/ko';
import { SOURCE_TYPES, type AnyRecord, type EntityRecord, type EventRecord, type ModuleConfig, type ModuleType, type NewsRecord, type SourceDef } from './schema';

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

/** Most authoritative registered source a record cites (drives the source label shown in lists). */
export const primarySource = (g: Game, r: AnyRecord) =>
  r.sources.map((ref) => sourceOf(g, ref.source)).sort((a, b) => SOURCE_TYPES.indexOf(a.type) - SOURCE_TYPES.indexOf(b.type))[0];

/**
 * One badge summarizing how trustworthy a record is: certainty first, then the best source type.
 * official > press > db > community; reported / speculative override the source grade.
 */
export type Provenance = 'official' | 'press' | 'db' | 'community' | 'reported' | 'speculative';
export function provenance(g: Game, r: AnyRecord): Provenance {
  if (r.certainty !== 'confirmed') return r.certainty;
  const t = primarySource(g, r).type;
  return t.startsWith('OFFICIAL') ? 'official' : t === 'PRESS' ? 'press' : t === 'DATABASE' || t === 'WIKI' ? 'db' : 'community';
}

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

/** KST calendar-day number, so "D-3" counts days, not 72-hour blocks. Mirrored in Base.astro. */
const kstDay = (t: number) => Math.floor((t + 9 * 3600_000) / 86400_000);

/** "D-3" / "D-DAY" before start, "5일 남음" / "오늘 종료" while running. Mirrored in Base.astro. */
export function dday(e: Pick<EventRecord, 'start' | 'end'>, now = Date.now()): string {
  const today = kstDay(now);
  if (now < toTime(e.start)) {
    const n = kstDay(toTime(e.start)) - today;
    return n ? `D-${n}` : 'D-DAY';
  }
  if (!e.end) return '종료일 미정';
  if (now > toTime(e.end, true)) return '종료';
  const n = kstDay(toTime(e.end, true)) - today;
  return n ? `${n}일 남음` : '오늘 종료';
}

/** Schedule page grouping. Mirrored in pages/schedule.astro. */
export type Bucket = 'today' | 'ongoing' | 'week' | 'later' | 'ended';
export function bucket(e: EventRecord, now = Date.now()): Bucket {
  const s = eventStatus(e, now);
  const today = kstDay(now);
  if (s === 'ended') return 'ended';
  if (kstDay(toTime(e.start)) === today || (e.end && kstDay(toTime(e.end, true)) === today)) return 'today';
  if (s === 'ongoing') return 'ongoing';
  return kstDay(toTime(e.start)) - today <= 7 ? 'week' : 'later';
}

const part = (s: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('ko-KR', { timeZone: SITE_TZ.name, ...o }).format(toTime(s));

/** Compact pieces for list rows: "09.30", "수", "10:00" (time only when the value has one). */
export const shortDate = (s: string) => part(s, { month: '2-digit', day: '2-digit' }).replace(/\.\s?/g, '.').replace(/\.$/, '');
export const weekday = (s: string) => part(s, { weekday: 'short' });
/** List metadata date: "9월 22일 (화)"; the year is shown only when it differs from the current one. */
export const listDate = (s: string) =>
  part(s, { year: 'numeric' }) === part(new Date().toISOString(), { year: 'numeric' }) ? monthDay(s) : formatDate(s, false);
export const monthDay = (s: string) => `${part(s, { month: 'long', day: 'numeric' })} (${weekday(s)})`;
export const clock = (s: string) => (s.length > 10 ? part(s, { hour: '2-digit', minute: '2-digit', hour12: false }) : '');

export function formatDate(s: string, withTime = s.length > 10) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: SITE_TZ.name, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(toTime(s));
}

// ── Summaries for cards and cross-links ─────────────────────────────────────

/** Headline pick: newest update/announcement, else newest patch note, else newest anything. */
const headline = (news: Tagged<NewsRecord>[]) =>
  news.find((t) => ['update', 'announcement'].includes(t.record.category)) ?? news.find((t) => t.record.category === 'patch') ?? news[0];

/** Newest "big" news per game (update / announcement / patch first), newest game first. */
export const featured = (limit = 3) =>
  games()
    .map((g) => {
      const mine = allNews().filter((t) => t.game === g);
      return headline(mine);
    })
    .filter((t): t is Tagged<NewsRecord> => !!t)
    .sort((a, b) => desc(newsDate(a.record), newsDate(b.record)))
    .slice(0, limit);

/** Everything a game card shows. `next` also looks at dated future DB history (e.g. a character release). */
export function gameSummary(g: Game, now = Date.now()) {
  const news = allNews().filter((t) => t.game === g);
  const events = allEvents().filter((t) => t.game === g);
  const upcoming = [
    ...events.filter((t) => eventStatus(t.record, now) === 'upcoming').map((t) => ({ date: t.record.start, title: t.record.title })),
    ...allChanges().filter((c) => c.game === g && toTime(c.date) > now).map((c) => ({ date: c.date, title: `${c.record.title} ${historyKind[c.entry.kind]}` })),
  ].sort((a, b) => toTime(a.date) - toTime(b.date));
  return {
    latest: headline(news),
    ongoing: events.filter((t) => eventStatus(t.record, now) === 'ongoing').length,
    next: upcoming[0],
    counts: g.config.modules.map((m) => ({ mod: m, n: recordsOf(g, m).length })),
  };
}

/** News of the same game that mentions a record by title or alias. */
export function relatedNews(g: Game, r: AnyRecord) {
  const names = [r.title, ...r.aliases].filter((n) => n.length > 1);
  return allNews().filter((t) => t.game === g && t.record.id !== r.id &&
    names.some((n) => [t.record.title, t.record.summary ?? '', ...t.record.tags].some((s) => s.includes(n))));
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
