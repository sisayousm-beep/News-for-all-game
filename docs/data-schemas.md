# 데이터 스키마

정의: `src/core/schema.ts`. 이 문서는 요약이며, 다르면 코드가 기준입니다.

## 정보 계층

| 계층 | 의미 | 저장 위치 | 화면 |
|---|---|---|---|
| Level 1 — 사실 | 이름, 날짜, 수치, 공지 내용 | 레코드 필드 (`title`, `start`, `attributes`…) + `sources` | 일반 표시 |
| Level 2 — 정리 | 여러 사실을 구조화: 일정표, 변경 이력, 요약 | `summary`, `history`, 모듈 목록·집계 | 일반 표시, 출처 연결 |
| Level 3 — 분석 | 핵심 변화 해석, 메타, 평가, 커뮤니티 반응 | `analysis` 블록 **만** | 보라색 점선 박스 "AI 분석", 근거 출처 별도 |

## 공통 필드 (모든 레코드)

```yaml
id: hsin                  # = 파일 이름, 영구
title: 여우의 별자리       # 표시 이름 (한국어)
aliases: [Hsin, 심호]      # 원어명·별칭 — 검색 대상
summary: …                # 원문에 있는 사실만으로 쓴 요약
image: /games/wuthering-waves/img/hsin.webp  # 선택. public/ 아래 파일(핫링크 금지). 없으면 게임 색 타일로 대체
certainty: confirmed      # confirmed | reported | speculative (기본 confirmed)
sources:                  # 1개 이상 — source-policy.md
  - source: press-kr      # game.yaml에 등록된 출처 id
    url: https://…
    collectedAt: 2026-09-25
    verifiedAt: 2026-09-25   # 원문을 직접 열어 확인했을 때만
    note: …                  # 선택
updatedAt: 2026-09-25     # 이 파일을 마지막으로 의미 있게 수정한 날
analysis:                 # 선택 — Level 3
  author: ai:claude
  generatedAt: 2026-09-25
  text: …
  basedOn: [ { source, url, collectedAt } ]
```

## news (`NewsRecord`)

| 필드 | 설명 |
|---|---|
| `category` | `notice` `update` `patch` `event` `maintenance` `shop` `announcement` |
| `publishedAt` | 원문 게시일. **모르면 `null`** (목록에선 수집일 기준으로 정렬, "게시일 미확인" 표시) |
| `tags` | 검색·표시용 태그 |

## schedule (`EventRecord`)

| 필드 | 설명 |
|---|---|
| `kind` | `event` `update` `maintenance` `banner` `pass` `shop` `season` |
| `start` | 시작. 날짜만(KST 하루 시작) 또는 오프셋 포함 시각 |
| `end` | 종료. **미정이면 `null`**. 날짜만이면 그날 23:59:59 KST까지 |
| `startNote` / `endNote` | 날짜로 표현 못 하는 조건 ("점검 후", "아이템 사용은 …까지") |

## database (`EntityRecord`)

| 필드 | 설명 |
|---|---|
| `attributes` | `game.yaml`의 `fields`에 선언된 키만, **모든 키 필수**. 모르면 `null` → "미확인" 표시 |
| `history` | 의미 있는 변화 기록(아래) |

### history (시간에 따른 변화)

현재 값은 `attributes`에, 변화의 흐름은 `history`에 **추가**합니다. Git 이력과 별개로 사용자에게 보여줄 변경 기록입니다.

```yaml
history:
  - date: 2026-09-30        # 모르면 null (version으로 순서 표시)
    version: "3.7"
    kind: release           # release rerun buff nerf rework change other
    summary: 3.7 버전 전반부 픽업으로 출시.
    sources: [ … ]          # 항목마다 출처 필수
```

수치가 바뀌는 조정(상향/하향)은 `attributes`를 새 값으로 고치고 `history`에 이전→현재를 `summary`로 남깁니다.
시점별 전체 스냅샷이 필요해지면(예: 스킬 계수 표 전체) 그때 `history` 항목에 `attributes` 스냅샷 필드를 추가하는 것을 검토합니다.

## 날짜 형식

- `YYYY-MM-DD` 또는 `YYYY-MM-DDTHH:MM(:SS)+09:00`. 오프셋 없는 시각은 검증 오류.
- YAML에서 따옴표 없이 써도 문자열로 읽힙니다(YAML 1.2).
