# 데이터 스키마

정의: `src/core/schema.ts`. 이 문서는 요약이며, 다르면 코드가 기준입니다.

## 정보 계층 (3단계)

레코드의 단계는 **모듈 타입**이 정합니다(`LAYER_OF` in schema.ts). 상세: [information-layers.md](information-layers.md)

| 단계 | 모듈 타입 | 레코드 |
|---|---|---|
| 공식 | `news` `schedule` `database` `version` `codes` | `NewsRecord` `EventRecord` `EntityRecord` `VersionRecord` `CodeRecord` |
| 계산·통계 | `analysis` | `AnalysisRecord` |
| 여론·커뮤니티 | `community` | `CommunityRecord` |

## 공통 필드 (모든 레코드)

```yaml
id: hsin                  # = 파일 이름, 영구
title: 여우의 별자리       # 표시 이름 (한국어)
aliases: [Hsin, 심호]      # 원어명·별칭 — 검색 대상
summary: …                # 원문에 있는 사실만으로 쓴 요약
image: /games/wuthering-waves/img/resonators/hsin.webp  # 선택. public/ 아래 파일(핫링크 금지, 검증 시 존재 확인). 없으면 게임 키비주얼로 대체
imageFrom: https://…/xin-4e9f5c0c.webp  # 선택. 이미지를 내려받은 공식 원본 URL
certainty: confirmed      # confirmed | reported | speculative (기본 confirmed)
sources:                  # 1개 이상 — source-policy.md
  - source: press-kr      # game.yaml에 등록된 출처 id
    url: https://…
    collectedAt: 2026-09-25
    verifiedAt: 2026-09-25   # 원문을 직접 열어 확인했을 때만
    note: …                  # 선택
updatedAt: 2026-09-25     # 이 파일을 마지막으로 의미 있게 수정한 날
version: "3.6"            # 기준 게임 버전 (계산·커뮤니티는 필수)
status: current           # current | outdated | archived (기본 current)
subjects: [resonators/cheongcho#chain-1]   # 이 레코드가 다루는 공식 레코드(#토픽). 존재 여부 검증
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
| `rewards` | 주요 공식 보상 (짧게) |
| `end` | 종료. **미정이면 `null`**. 날짜만이면 그날 23:59:59 KST까지 |
| `startNote` / `endNote` | 날짜로 표현 못 하는 조건 ("점검 후", "아이템 사용은 …까지") |

## database (`EntityRecord`)

| 필드 | 설명 |
|---|---|
| `attributes` | `game.yaml`의 `fields`에 선언된 키만, **모든 키 필수**. 모르면 `null` → "미확인" 표시 |
| `history` | 의미 있는 변화 기록(아래) |
| `topics` | 공식 하위 항목(스킬, 공명 체인, 무기 패시브…). `{ id, section, name, text, values, sources }`. `section`은 모듈 `sections`에 선언된 키. `text`는 **요약**(툴팁 전문 ✗), `values`는 핵심 수치만. 계산·커뮤니티가 `<컬렉션>/<id>#<topic id>`로 연결 |

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

## version (`VersionRecord`) — 공식

| 필드 | 설명 |
|---|---|
| `version` | `"3.7"` (필수) |
| `start` / `end` | 버전 시작(업데이트 점검 시작) / 끝(다음 버전 점검 시작, 미공개면 `null`) |
| `phases` | 전반부·후반부 등 `{ name, start, end }` |
| `highlights` | 신규 캐릭터·지역·시스템·보상 등 한 줄씩 |

버전 페이지는 레코드의 `version`(있으면 우선) 또는 날짜로 이 버전에 속한 일정·코드·공지·출시/복각 이력을 모읍니다.

## codes (`CodeRecord`) — 공식

`code`, `rewards`(1개 이상), `start`(모르면 `null`), `end`(만료 공지 없으면 `null`). 만료된 코드는 지우지 않으며 "지난 코드"로 자동 이동.

## analysis (`AnalysisRecord`) — 계산·통계

| 필드 | 설명 |
|---|---|
| `kind` | `breakpoint` 돌파 효율 · `weapon` 무기 효율 · `dps` 조합 딜 · `stat` 스탯 효율 · `build` 세팅 계산 · `currency` 획득 재화 · `event` 이벤트 효율 · `cost` 육성 비용 · `farming` 파밍 · `gacha` 가챠 통계 · `banner` 픽업 통계 · `other` |
| `version` | 기준 버전 (필수) |
| `method` | 계산 방법 (필수). 직접 계산했으면 "Game Hub 자체 계산" + 식 |
| `assumptions` | 계산 조건 1개 이상 (필수): 무기·에코·로테이션·적 조건… |
| `results` | 조건부 문장 1개 이상 ("이 조건에서 약 …") |
| `table` | 선택. `{ columns, rows, note }` — 첫 열은 행 이름 |
| `calculationVersion` | 선택. 계산기·시트 버전 |

## community (`CommunityRecord`) — 여론·커뮤니티

| 필드 | 설명 |
|---|---|
| `kind` | `evaluation` `investment`(돌파·무기) `team` `feel`(사용감) `story` `version` `tip` `mistake` `debate` |
| `version` | 기준 버전 (필수) |
| `summary` | 필수. 우세한 의견과 **이유**, 어느 커뮤니티 기준인지 |
| `consensus` | `strong` `moderate` `mixed` `weak` — 점수가 아닌 일치 정도 |
| `positive` / `negative` | 자주 보이는 긍정 / 부정·우려 의견 |
| `divided` | `{ position, reasons[] }` — 갈리는 지점의 양쪽 |
| `tips` | `{ text, when?, who? }` — 어떤 상황·어떤 유저에게 |
| `sources` | 근거 글. COMMUNITY/GUIDE 출처 1개 이상 필수. `certainty`는 쓰지 않음 |

## 날짜 형식

- `YYYY-MM-DD` 또는 `YYYY-MM-DDTHH:MM(:SS)+09:00`. 오프셋 없는 시각은 검증 오류.
- YAML에서 따옴표 없이 써도 문자열로 읽힙니다(YAML 1.2).
