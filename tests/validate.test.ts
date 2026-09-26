/** Validator rules (src/core/load.ts) against small throwaway game folders. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stringify } from 'yaml';
import { loadGames, urlMatches } from '../src/core/load';

const config = {
  id: 'demo', name: '데모', description: 'd', genre: 'g', region: 'r', theme: { accent: '#123456' },
  modules: [
    { type: 'news', label: '뉴스', collection: 'news' },
    { type: 'schedule', label: '일정', collection: 'events' },
    { type: 'database', label: '캐릭터', collection: 'chars', fields: [{ key: 'el', label: '속성', values: { fire: '불' } }], sections: [{ key: 'chain', label: '체인' }] },
    { type: 'codes', label: '코드', collection: 'codes' },
    { type: 'analysis', label: '계산', collection: 'calc' },
    { type: 'community', label: '커뮤니티', collection: 'talk' },
  ],
  sources: [
    { id: 'off', name: 'Official', type: 'OFFICIAL', url: 'https://demo.com', domains: ['demo.com'] },
    { id: 'fans', name: 'Board', type: 'COMMUNITY', url: 'https://board.net/b', domains: ['board.net/b'] },
  ],
  updates: [{ id: 'demo-news', collection: 'news', sources: ['off'], frequency: '6h', instructions: 'x' }],
};
const ref = (source = 'off', url = 'https://www.demo.com/n/1') => ({ source, url, collectedAt: '2026-09-25' });
const news = (over = {}) => ({ id: 'n1', title: 'T', category: 'notice', publishedAt: null, sources: [ref()], updatedAt: '2026-09-25', ...over });

/** Builds games/demo with the given records ({ 'news/n1': {...} }) and returns validator errors. */
function errorsFor(records: Record<string, object>, cfg: object = config) {
  const dir = mkdtempSync(join(tmpdir(), 'hub-'));
  mkdirSync(join(dir, 'demo'));
  writeFileSync(join(dir, 'demo', 'game.yaml'), stringify(cfg));
  for (const [path, rec] of Object.entries(records)) {
    mkdirSync(join(dir, 'demo', path.split('/')[0]), { recursive: true });
    writeFileSync(join(dir, 'demo', `${path}.yaml`), stringify(rec));
  }
  return loadGames(dir).errors.join('\n');
}

test('valid data passes', () => {
  assert.equal(errorsFor({
    'news/n1': news(),
    'events/e1': { id: 'e1', title: 'E', kind: 'event', start: '2026-09-17', end: null, sources: [ref()], updatedAt: '2026-09-25' },
    'chars/c1': { id: 'c1', title: 'C', attributes: { el: null }, sources: [ref()], updatedAt: '2026-09-25' },
  }), '');
});

test('the real repository data is valid', () => assert.deepEqual(loadGames().errors, []));

test('file name must equal id', () => assert.match(errorsFor({ 'news/other': news() }), /must match file name/));
test('unregistered source', () => assert.match(errorsFor({ 'news/n1': news({ sources: [ref('nope')] }) }), /not registered/));
test('url outside source domain', () => assert.match(errorsFor({ 'news/n1': news({ sources: [ref('off', 'https://evil.com/x')] }) }), /not on a domain/));
test('community-only fact cannot be confirmed', () =>
  assert.match(errorsFor({ 'news/n1': news({ sources: [ref('fans', 'https://board.net/b/1')] }) }), /certainty "confirmed"/));
test('community-only fact may be reported', () =>
  assert.equal(errorsFor({ 'news/n1': news({ certainty: 'reported', sources: [ref('fans', 'https://board.net/b/1')] }) }), ''));
test('datetime without offset is rejected', () => assert.match(errorsFor({ 'news/n1': news({ publishedAt: '2026-09-17T10:00' }) }), /publishedAt/));
test('event end before start', () =>
  assert.match(errorsFor({ 'events/e1': { id: 'e1', title: 'E', kind: 'event', start: '2026-09-17', end: '2026-09-01', sources: [ref()], updatedAt: '2026-09-25' } }), /end is before start/));
test('database attribute must be declared, present and in range', () => {
  const c = (attributes: object) => ({ 'chars/c1': { id: 'c1', title: 'C', attributes, sources: [ref()], updatedAt: '2026-09-25' } });
  assert.match(errorsFor(c({})), /missing — write null/);
  assert.match(errorsFor(c({ el: 'ice' })), /not in \[fire\]/);
  assert.match(errorsFor(c({ el: 'fire', hp: 1 })), /not declared/);
});
test('image must be a file under public/games', () => {
  assert.match(errorsFor({ 'news/n1': news({ image: '/games/demo/img/news/missing.webp' }) }), /does not exist/);
  assert.match(errorsFor({ 'news/n1': news({ image: 'https://cdn.example.com/x.png' }) }), /image/);
});
test('reserved module id', () =>
  assert.match(errorsFor({}, { ...config, modules: [{ type: 'news', label: 'x', collection: 'sources' }] }), /reserved/));
test('update job must target a module collection', () =>
  assert.match(errorsFor({}, { ...config, updates: [{ ...config.updates[0], collection: 'nope' }] }), /unknown collection/));

test('urlMatches: host, subdomain and path prefix', () => {
  assert.ok(urlMatches('https://m.demo.com/x', 'demo.com'));
  assert.ok(!urlMatches('https://notdemo.com/x', 'demo.com'));
  assert.ok(urlMatches('https://www.inven.co.kr/webzine/news/?news=1', 'inven.co.kr/webzine'));
  assert.ok(!urlMatches('https://www.inven.co.kr/board/maple/1', 'inven.co.kr/webzine'));
  assert.ok(!urlMatches('https://www.inven.co.kr/webzinex', 'inven.co.kr/webzine'));
});

// ── Three information layers ──────────────────────────────────────────────
const char = (over = {}) => ({ id: 'c1', title: 'C', attributes: { el: null }, topics: [{ id: 'chain-1', section: 'chain', name: '1체인' }], sources: [ref()], updatedAt: '2026-09-25', ...over });
const calc = (over = {}) => ({ id: 'a1', title: 'A', kind: 'breakpoint', version: '3.6', method: 'm', assumptions: ['전용 무기'], results: ['이 조건에서 약 10%'], sources: [ref()], updatedAt: '2026-09-25', ...over });
const talk = (over = {}) => ({ id: 'k1', title: 'K', kind: 'investment', version: '3.6', summary: 's', consensus: 'mixed', sources: [ref('fans', 'https://board.net/b/1')], updatedAt: '2026-09-25', ...over });

test('layered records linked to an official topic pass', () =>
  assert.equal(errorsFor({ 'chars/c1': char(), 'calc/a1': calc({ subjects: ['chars/c1#chain-1'] }), 'talk/k1': talk({ subjects: ['chars/c1'] }) }), ''));
test('subjects must point at an existing record and topic', () => {
  assert.match(errorsFor({ 'chars/c1': char(), 'calc/a1': calc({ subjects: ['chars/nope'] }) }), /no record chars\/nope/);
  assert.match(errorsFor({ 'chars/c1': char(), 'calc/a1': calc({ subjects: ['chars/c1#chain-9'] }) }), /no topic "chain-9"/);
});
test('topic section must be declared in module sections', () =>
  assert.match(errorsFor({ 'chars/c1': char({ topics: [{ id: 't', section: 'skills', name: 'x' }] }) }), /section "skills" not declared/));
test('analysis needs conditions and a base version', () => {
  assert.match(errorsFor({ 'calc/a1': calc({ assumptions: [] }) }), /assumptions/);
  assert.match(errorsFor({ 'calc/a1': calc({ version: undefined }) }), /version/);
});
test('community must cite a community/guide source, but needs no fact-grade source', () => {
  assert.match(errorsFor({ 'talk/k1': talk({ sources: [ref()] }) }), /COMMUNITY\/GUIDE/);
  assert.match(errorsFor({ 'talk/k1': talk({ consensus: 'unanimous' }) }), /consensus/);
});
test('code expiry before release is rejected', () =>
  assert.match(errorsFor({ 'codes/x1': { id: 'x1', title: 'X1', code: 'X1', rewards: ['a'], start: '2026-09-19', end: '2026-09-01', sources: [ref()], updatedAt: '2026-09-25' } }), /end is before start/));
test('YAML syntax errors are reported, not thrown', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hub-'));
  mkdirSync(join(dir, 'demo', 'news'), { recursive: true });
  writeFileSync(join(dir, 'demo', 'game.yaml'), stringify(config));
  writeFileSync(join(dir, 'demo', 'news', 'n1.yaml'), 'id: n1\nlist:\n  - "a" = b\n');
  assert.match(loadGames(dir).errors.join('\n'), /YAML syntax/);
});

test('games/_template is a valid starting point', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hub-'));
  mkdirSync(join(dir, 'my-game'));
  writeFileSync(join(dir, 'my-game', 'game.yaml'), readFileSync(join('games', '_template', 'game.yaml')));
  assert.deepEqual(loadGames(dir).errors, []);
});
