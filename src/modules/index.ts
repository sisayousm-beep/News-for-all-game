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
import VersionList from './version/List.astro';
import VersionDetail from './version/Detail.astro';
import VersionWidget from './version/Widget.astro';
import CodesList from './codes/List.astro';
import CodesDetail from './codes/Detail.astro';
import CodesWidget from './codes/Widget.astro';
import AnalysisList from './analysis/List.astro';
import AnalysisDetail from './analysis/Detail.astro';
import AnalysisWidget from './analysis/Widget.astro';
import CommunityList from './community/List.astro';
import CommunityDetail from './community/Detail.astro';
import CommunityWidget from './community/Widget.astro';

/** List: /games/<game>/<module>/ · Detail: /games/<game>/<module>/<id>/ · Widget: card on the game overview. */
export const views: Record<ModuleType, { List: any; Detail: any; Widget: any }> = {
  news: { List: NewsList, Detail: NewsDetail, Widget: NewsWidget },
  schedule: { List: ScheduleList, Detail: ScheduleDetail, Widget: ScheduleWidget },
  database: { List: DatabaseList, Detail: DatabaseDetail, Widget: DatabaseWidget },
  version: { List: VersionList, Detail: VersionDetail, Widget: VersionWidget },
  codes: { List: CodesList, Detail: CodesDetail, Widget: CodesWidget },
  analysis: { List: AnalysisList, Detail: AnalysisDetail, Widget: AnalysisWidget },
  community: { List: CommunityList, Detail: CommunityDetail, Widget: CommunityWidget },
};

/** Game home columns, by module type (never by game): reading content wide, status/lookup widgets in the side column. */
export const WIDE_TYPES: ModuleType[] = ['news', 'community', 'analysis'];
