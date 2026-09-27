/** Korean display labels for enum values in src/core/schema.ts. Add a locale file beside this one to localize. */
import type { ANALYSIS_KINDS, COMMUNITY_KINDS, CONSENSUS, Certainty, Layer, SourceType } from '../core/schema';
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

/** The three information layers (docs/information-layers.md). Order = reading order on every page. */
export const layer: Record<Layer, { label: string; title: string; note: string }> = {
  official: { label: '공식', title: '공식 정보', note: '게임사가 공식 채널로 공개한 정보' },
  analysis: { label: '계산', title: '계산 · 통계', note: '공식 수치로 계산한 결과 — 적힌 조건에서만 유효합니다' },
  community: { label: '커뮤니티', title: '커뮤니티 여론', note: '실제 커뮤니티 의견의 요약 — 사실이 아니라 현재 여론입니다' },
};

export const analysisKind: Record<(typeof ANALYSIS_KINDS)[number], string> = {
  breakpoint: '돌파 효율', weapon: '무기 효율', dps: '조합 딜', stat: '스탯 효율', build: '세팅 계산', currency: '획득 재화',
  event: '이벤트 효율', cost: '육성 비용', farming: '파밍 효율', gacha: '가챠 통계', banner: '픽업 통계', other: '기타 계산',
};

export const communityKind: Record<(typeof COMMUNITY_KINDS)[number], string> = {
  evaluation: '평가', investment: '돌파·무기 여론', team: '조합 여론', feel: '사용감', story: '스토리 평가', version: '버전 평가',
  tip: '꿀팁', mistake: '자주 하는 실수', debate: '논쟁', issue: '핫이슈',
};

/** Descriptive, not a score. */
export const consensus: Record<(typeof CONSENSUS)[number], { label: string; title: string }> = {
  strong: { label: '의견 대체로 일치', title: '확인한 글 대부분이 같은 방향' },
  moderate: { label: '다수 의견 있음', title: '우세한 의견이 있지만 반대 의견도 보임' },
  mixed: { label: '의견 갈림', title: '뚜렷한 다수 없이 나뉨' },
  weak: { label: '의견 적음', title: '확인한 글이 적어 여론이라 보기 어려움' },
};

export const codeStatus = { active: '사용 가능', upcoming: '예정', expired: '만료' } as const;

export const issueScope = { ingame: '게임 내', offgame: '게임 외' } as const;
