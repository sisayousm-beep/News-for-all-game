import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { loadGames } from '../src/core/load';

const root = process.cwd();
const directory = join(root, 'games/arknights/operators');
const ids = [
  "pepe",
  "narantuya",
  "sand-reckoner",
  "papyrus",
  "nymph",
  "mitm",
  "marcille",
  "laios",
  "chilchuck",
  "senshi",
  "vina-victoria",
  "bobbing",
  "catherine",
  "lappland-the-decadenza",
  "vulpisfoglia",
  "crownslayer",
  "figurino",
  "philae",
  "contrail",
  "thorns-the-lodestar",
  "tecno",
  "rose-salt",
  "yu",
  "blaze-the-igniting-spark",
  "surfer",
  "xingzhu",
  "entelechia",
  "nowell",
  "necrass",
  "wulfenite",
  "brigid",
  "mon3tr",
  "alanna",
  "windscoot",
  "exusiai-the-new-covenant",
  "lemuen",
  "sankta-miksaparato",
  "gracebearer",
  "confess-47",
  "tragodia",
  "tippi",
  "miss-christine"
];
const read = (id: string) => parse(readFileSync(join(directory, id + '.yaml'), 'utf8'));

test('2025 operator roster has 42 new records without replacing the existing December pair', () => {
  assert.equal(new Set(ids).size, 42);
  for (const id of ids) assert.ok(existsSync(join(directory, id + '.yaml')), id);
  const existing = ['leizi-the-thunderbringer', 'record-keeper'];
  for (const id of existing) if (existsSync(join(directory, id + '.yaml'))) assert.ok(!ids.includes(id));
  if (existing.every(id => existsSync(join(directory, id + '.yaml')))) {
    const found = readdirSync(directory).filter(f => f.endsWith('.yaml')).map(f => parse(readFileSync(join(directory, f), 'utf8')))
      .filter(r => r.history?.some((h: { kind: string; date: string }) => h.kind === 'release' && h.date?.startsWith('2025-')));
    assert.equal(found.length, 44);
  }
});

test('every new operator has real local portrait, full art, official release citation and Korean game data', () => {
  const hashes = new Set<string>();
  for (const id of ids) {
    const r = read(id);
    assert.equal(r.id, id);
    assert.ok(['5.0', '5.5'].includes(r.attributes.version));
    assert.ok(r.history.some((h: { kind: string; date: string }) => h.kind === 'release' && h.date?.startsWith('2025-')));
    assert.ok(r.sources.some((s: { source: string; verifiedAt: string }) => s.source === 'arknights-global' && s.verifiedAt));
    assert.ok(r.sources.some((s: { source: string; verifiedAt: string }) => s.source === 'gamedata' && s.verifiedAt));
    assert.ok(r.topics.some((t: { id: string }) => t.id === 'stats-max'));
    for (const image of [r.image, r.keyVisual]) {
      assert.ok(image?.startsWith('/games/arknights/img/'));
      const data = readFileSync(join(root, 'public', image));
      assert.ok(data.length > 1000, image);
      hashes.add(createHash('sha256').update(data).digest('hex'));
    }
    assert.ok(r.imageFrom.includes('/portrait/'));
    assert.ok(r.keyVisualFrom.includes('/skin/'));
  }
  assert.equal(hashes.size, ids.length * 2, 'one placeholder reused across records');
});

test('2025 operator data respects the common schema and image references', () => {
  const errors = loadGames().errors.filter(e => e.includes('games/arknights/'));
  assert.deepEqual(errors, []);
});
