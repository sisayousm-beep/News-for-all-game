/** Static search index, fetched lazily by /search/ only. Shard per game if it grows past ~1 MB. */
import { searchRows } from '../core/hub';

export const GET = () => new Response(JSON.stringify(searchRows()), { headers: { 'Content-Type': 'application/json' } });
