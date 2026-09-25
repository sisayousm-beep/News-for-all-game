# 출처 정책

출처 추적은 선택 기능이 아니라 Game Hub의 핵심입니다.

## 출처 유형 (신뢰도 높은 순)

| 유형 | 예 | `confirmed` 단독 근거 가능 |
|---|---|---|
| `OFFICIAL` | 공식 홈페이지, 공식 공지, 공식 SNS 계정 | ✓ |
| `OFFICIAL_API` | 넥슨 Open API 등 | ✓ |
| `PRESS` | 게임 전문 언론 기사 | ✓ |
| `DATABASE` | 데이터마이닝 기반 게임 DB | ✓ |
| `WIKI` | 나무위키, 팬덤 위키 | ✓ (가능하면 공식으로 교체) |
| `GUIDE` | 공략 사이트·블로그 | ✗ → `reported` |
| `COMMUNITY` | 인벤 게시판, 레딧, 디시, 아카라이브 | ✗ → `reported` |

AI 분석은 출처 유형이 아니라 레코드의 `analysis` 블록으로 표현합니다(사실의 근거가 될 수 없음).

## 규칙 (검증 스크립트가 강제)

1. 레코드의 모든 인용(`sources`, `history[].sources`, `analysis.basedOn`)은 `game.yaml`에 **등록된 출처 id**를 써야 한다.
2. 인용 URL은 그 출처의 `domains`에 속해야 한다. `domains`는 호스트(`maplestory.nexon.com`, 하위 도메인 포함) 또는 호스트+경로(`inven.co.kr/webzine`).
   한 도메인에 언론과 커뮤니티가 섞여 있으면 경로로 구분해 서로 다른 출처로 등록한다(인벤 웹진 vs 게시판).
3. `certainty: confirmed` 레코드는 `sources`에 ✓ 유형이 하나 이상 있어야 한다.

## 운영 원칙 (사람·AI가 지킴)

- 공식 출처를 우선한다. 커뮤니티 전재 글만 찾았으면 `reported`로 두고, 공식 원문을 찾으면 교체 후 `confirmed`로 올린다.
- `collectedAt` = 정보를 가져온 날. `verifiedAt` = **원문 페이지를 직접 열어** 내용이 일치함을 확인한 날. 검색 결과 요약만 봤다면 쓰지 않는다(화면에 "원문 미검증" 표시).
- 공식 발표와 커뮤니티 의견을 같은 신뢰 수준으로 쓰지 않는다. 커뮤니티 반응은 `analysis`(근거로 인용)에 담는다.
- 출처끼리 내용이 다르면 공식을 따르고, 차이를 `note`에 남긴다.
