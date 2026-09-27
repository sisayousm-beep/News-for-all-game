import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadGames } from '../src/core/load';
import type { AnalysisRecord, EntityRecord, EventRecord, VersionRecord } from '../src/core/schema';

const loaded = loadGames();
const game = loaded.games.find((g) => g.config.id === 'endfield')!;
const event = (id: string) => game.collections.events.find((r) => r.id === id) as EventRecord;

test('Endfield is a valid data-only game with independently scoped jobs', () => {
  assert.ok(game);
  assert.deepEqual(loaded.errors.filter((e) => e.includes('games/endfield/')), []);
  for (const module of game.config.modules) {
    assert.ok(game.config.updates.some((job) => job.collection === module.collection));
  }
  assert.ok(game.config.modules.some((m) => m.collection === 'industry'));
});

test('Endfield Asia deadlines preserve server offsets and separate delivery from exchange', () => {
  const production = event('chubby-lung-production');
  const exchange = event('chubby-lung-exchange');
  assert.equal(production.end, '2026-09-30T16:00:00+08:00');
  assert.equal(new Date(production.end!).toISOString(), '2026-09-30T08:00:00.000Z');
  assert.equal((Date.parse(exchange.end!) - Date.parse(production.end!)) / 3600000, 156);
  const patch = game.collections.versions.find((r) => r.id === 'v1-5') as VersionRecord;
  assert.equal(patch.end, null);
  assert.notEqual(event('winter-hunt').end, patch.end);
  assert.equal(event('deep-cold-issue').end, null);
});

test('Endfield first-six probability table is reproducible, not a featured guarantee', () => {
  const record = game.collections.analysis.find((r) => r.id === 'headhunt-first-six') as AnalysisRecord;
  let survival = 1;
  for (let pull = 1; pull <= 80; pull++) {
    const probability = pull === 80 ? 1 : pull <= 65 ? 0.008 : 0.008 + 0.05 * (pull - 65);
    survival *= 1 - probability;
    const row = record.table!.rows.find(([n]) => n === pull);
    if (row) assert.equal(row[1], Number(((1 - survival) * 100).toFixed(2)));
  }
  assert.equal(record.chart!.points.at(-1)!.value, 100);
  assert.match(record.answer!, /픽업 확정/);
  assert.ok(record.assumptions.some((a) => a.includes('긴급 모집')));
});

test('Endfield reconstruction free attempts do not advance its 120-count guarantee', () => {
  const record = game.collections.analysis.find((r) => r.id === 'reconstruction-emergency-count') as AnalysisRecord;
  assert.deepEqual(record.table!.rows.find(([n]) => n === 90), [90, 30, 120]);
  assert.ok(record.results.some((r) => r.includes('90회')));
});

test('Endfield guide-derived energy calculations remain explicitly reported', () => {
  for (const id of ['typhoeus', 'purrchena']) {
    const entity = game.collections.operators.find((r) => r.id === id) as EntityRecord;
    const calc = game.collections.analysis.find((r) => r.id === `${id}-p4-energy`) as AnalysisRecord;
    const energy = Number(entity.topics.find((t) => t.id === 'ultimate')!.values['필요 에너지']);
    assert.equal(calc.table!.rows[1][1], energy * 0.85);
    assert.equal(calc.certainty, 'reported');
    assert.deepEqual(calc.subjects, [`operators/${id}#p4`]);
  }
});
