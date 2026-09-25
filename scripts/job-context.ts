/**
 * `npm run job -- <job-id>` — prints the minimal context an AI update task needs:
 * the job definition, its registered sources, the target module's schema rules,
 * and a compact index of existing records (to diff against, not to re-read).
 * `npm run job` with no argument lists all jobs. See docs/ai-update-rules.md.
 */
import { loadGames } from '../src/core/load';

const { games, errors } = loadGames();
if (errors.length) console.warn(`⚠ repository currently has ${errors.length} validation error(s) — run npm run validate\n`);

const jobs = games.flatMap((g) => g.config.updates.map((job) => ({ g, job })));
const wanted = process.argv[2];

if (!wanted) {
  for (const { g, job } of jobs) console.log(`${job.id.padEnd(32)} ${job.frequency.padEnd(7)} games/${g.config.id}/${job.collection}/`);
  process.exit(0);
}

const hit = jobs.find((j) => j.job.id === wanted);
if (!hit) {
  console.error(`unknown job "${wanted}". Known: ${jobs.map((j) => j.job.id).join(', ')}`);
  process.exit(1);
}

const { g, job } = hit;
const mod = g.config.modules.find((m) => m.collection === job.collection)!;
const records = g.collections[job.collection] ?? [];
const lastVerified = records.flatMap((r) => r.sources.map((s) => s.verifiedAt ?? s.collectedAt)).sort().at(-1) ?? 'never';

console.log(JSON.stringify({
  job,
  writeTo: `games/${g.config.id}/${job.collection}/<id>.yaml`,
  moduleType: mod.type,
  fields: mod.type === 'database' ? mod.fields : undefined,
  sources: g.config.sources.filter((s) => job.sources.includes(s.id)),
  allRegisteredSourceIds: g.config.sources.map((s) => s.id),
  lastCollected: lastVerified,
  existing: records.map((r) => ({ id: r.id, title: r.title, updatedAt: r.updatedAt, urls: r.sources.map((s) => s.url) })),
  rules: 'docs/ai-update-rules.md',
  schema: `src/core/schema.ts (${mod.type} record)`,
  example: `games/${g.config.id}/${job.collection}/${records[0]?.id ?? '<none yet>'}.yaml`,
}, null, 2));
