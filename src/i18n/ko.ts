/** Korean display labels for enum values in src/core/schema.ts. Add a locale file beside this one to localize. */
import type { Certainty, SourceType } from '../core/schema';
import type { Bucket, Provenance } from '../core/hub';

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

/** One trust badge per record (see provenance() in core/hub.ts). */
export const provenance: Record<Provenance, { label: string; title: string }> = {
  official: { label: '공식', title: '공식 발표·공지로 확인된 정보' },
  press: { label: '보도', title: '언론 보도로 확인된 정보' },
  db: { label: 'DB', title: '데이터베이스·위키 기준 정보' },
  community: { label: '커뮤니티', title: '커뮤니티 출처 정보 — 공식 원문 확인 필요' },
  reported: { label: '전언', title: '출처가 전한 내용이지만 공식 확인 전' },
  speculative: { label: '추측', title: '유출·예측 — 사실과 다를 수 있음' },
};

export const bucket: Record<Bucket, string> = { today: '오늘', ongoing: '진행 중', week: '이번 주', later: '이후', ended: '최근 종료' };
