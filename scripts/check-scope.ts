/**
 * `npm run scope -- <job-id> [base-ref]` — fails if the working tree / branch changes
 * files outside the job's own folder (games/<game>/<collection>/). AI update tasks
 * run this before committing so a bad run cannot touch other games, code or config.
 */
import { execSync } from 'node:child_process';
import { loadGames } from '../src/core/load';

const [jobId, base = 'HEAD'] = process.argv.slice(2);
const hit = loadGames().games.flatMap((g) => g.config.updates.map((job) => ({ g, job }))).find((j) => j.job.id === jobId);
if (!hit) {
  console.error(`usage: npm run scope -- <job-id> [base-ref]  (unknown job "${jobId ?? ''}")`);
  process.exit(1);
}

const allowed = `games/${hit.g.config.id}/${hit.job.collection}/`;
const git = (cmd: string) => execSync(`git ${cmd}`, { encoding: 'utf8' }).split('\n').filter(Boolean);
const changed = [...new Set([...git(`diff --name-only ${base}`), ...git('ls-files --others --exclude-standard')])];
const outside = changed.filter((f) => !f.startsWith(allowed));

if (outside.length) {
  console.error(`✗ job ${jobId} may only change ${allowed}, but also changed:\n${outside.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ ${changed.length} changed file(s), all inside ${allowed}`);
