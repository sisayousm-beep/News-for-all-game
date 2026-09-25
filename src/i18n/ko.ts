/** Korean display labels for enum values in src/core/schema.ts. Add a locale file beside this one to localize. */
import type { Certainty, SourceType } from '../core/schema';

export const newsCategory: Record<string, string> = {
  notice: '공지', update: '업데이트', patch: '패치노트', event: '이벤트', maintenance: '점검', shop: '상점', announcement: '발표',
};

export const eventKind: Record<string, string> = {
  event: '이벤트', update: '업데이트', maintenance: '점검', banner: '픽업', pass: '패스', shop: '상점', season: '시즌',
};

export const eventStatus = { upcoming: '예정', ongoing: '진행 중', ended: '종료' } as const;

export const historyKind: Record<string, string> = {
  release: '출시', rerun: '복각', buff: '상향', nerf: '하향', rework: '리워크', change: '변경', other: '기타',
};

export const sourceType: Record<SourceType, string> = {
  OFFICIAL: '공식', OFFICIAL_API: '공식 API', PRESS: '언론', DATABASE: 'DB', WIKI: '위키', GUIDE: '공략', COMMUNITY: '커뮤니티',
};

export const certainty: Record<Certainty, string> = { confirmed: '확인됨', reported: '보도·전언', speculative: '추측·유출' };
