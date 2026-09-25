/**
 * `npm run validate` — checks every file under games/ against src/core/schema.ts
 * plus cross-file consistency rules (src/core/load.ts). Exit code 1 on any error.
 * Run this before every commit; CI and the deploy workflow run it too.
 */
import { loadGames } from '../src/core/load';

const { games, errors } = loadGames();
const count = games.reduce((n, g) => n + Object.values(g.collections).flat().length, 0);

if (errors.length) {
  console.error(`✗ ${errors.length} error(s):\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`✓ ${games.length} game(s), ${count} record(s) valid`);
