# game.yaml

게임 하나의 모든 설정. 형식 정의: `GameConfig` in `src/core/schema.ts`. 예시: `games/_template/game.yaml`.

| 필드 | 필수 | 설명 |
|---|---|---|
| `id` | ✓ | 폴더 이름과 동일. 소문자-kebab. URL에 쓰이므로 변경 금지 |
| `name` | ✓ | 한국어 표시 이름 |
| `names` | | 다른 언어 이름 `{ en: ... }` — 검색에도 쓰임 |
| `description`, `genre`, `region` | ✓ | 게임 소개, 장르, 서버/지역 |
| `publisher` | | 개발·서비스사 (게임 카드·허브 헤더에 표시) |
| `locale` | | 기본 `ko` |
| `theme.accent` | ✓ | 게임 대표 색 `#rrggbb`. 흰 배경 위 글자·선·옅은 배경으로 쓰이므로 중간 명도(너무 밝은 노랑·연두 금지). → [design-system.md](design-system.md) |
| `theme.icon` | | `public/` 아래 아이콘 경로 |
| `modules` | ✓ | 게임 허브의 탭. 순서대로 표시. → [modules.md](modules.md) |
| `sources` | ✓ | 이 게임 데이터가 인용할 수 있는 출처. → [source-policy.md](source-policy.md) |
| `updates` | | AI 업데이트 작업. → [ai-update-rules.md](ai-update-rules.md) |

## modules 항목

| 필드 | 설명 |
|---|---|
| `type` | `news` \| `schedule` \| `database` |
| `id` | URL 조각. 생략 시 `collection`과 같음. `sources`는 예약어 |
| `label` | 탭 이름 (예: "공명자", "이벤트 일정") |
| `collection` | 레코드 폴더 이름 `games/<game>/<collection>/` |
| `itemLabel` | database: 항목 1개의 명칭 (검색 결과 표시용) |
| `fields` | database: 게임 고유 속성 목록 |

### fields 항목 (database)

| 필드 | 설명 |
|---|---|
| `key` | 레코드 `attributes`의 키 (소문자 영문) |
| `label` | 표시 이름 |
| `values` | 허용 값 → 표시 라벨. 있으면 이 값만 허용. 없으면 자유 텍스트/숫자 |
| `filter` | `true`면 목록 화면에 필터 드롭다운 |

## updates 항목

| 필드 | 설명 |
|---|---|
| `id` | `<game>-<collection>` 권장. 예약 작업 이름으로 사용 |
| `collection` | 이 작업이 수정할 수 있는 유일한 폴더 |
| `sources` | 이 작업이 조사할 등록 출처 id |
| `frequency` | `6h`, `1d`, `7d` 같은 주기, 또는 `patch`(패치 때), `manual` |
| `instructions` | 이 작업만의 규칙 (자연어) |
