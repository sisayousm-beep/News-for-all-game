/**
 * Module type → views. Game configs pick module *types* in game.yaml; this map
 * tells the router how to render each. To add a module type see docs/modules.md.
 */
import type { ModuleType } from '../core/schema';
import NewsList from './news/List.astro';
import NewsDetail from './news/Detail.astro';
import NewsWidget from './news/Widget.astro';
import ScheduleList from './schedule/List.astro';
import ScheduleDetail from './schedule/Detail.astro';
import ScheduleWidget from './schedule/Widget.astro';
import DatabaseList from './database/List.astro';
import DatabaseDetail from './database/Detail.astro';
import DatabaseWidget from './database/Widget.astro';

/** List: /games/<game>/<module>/ · Detail: /games/<game>/<module>/<id>/ · Widget: card on the game overview. */
export const views: Record<ModuleType, { List: any; Detail: any; Widget: any }> = {
  news: { List: NewsList, Detail: NewsDetail, Widget: NewsWidget },
  schedule: { List: ScheduleList, Detail: ScheduleDetail, Widget: ScheduleWidget },
  database: { List: DatabaseList, Detail: DatabaseDetail, Widget: DatabaseWidget },
};
