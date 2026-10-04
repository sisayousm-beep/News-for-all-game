# Game Hub

[🌐 웹사이트 바로가기](https://sisayousm-beep.github.io/News-for-all-game/)

> 내가 관심 있는 모든 게임의 모든 유용한 정보를 하나의 웹사이트에서 확인한다.

Game Hub는 여러 곳에 흩어진 게임 정보(공식 공지, 패치노트, 이벤트, 캐릭터 DB, 커뮤니티 반응)를
**모으고 · 구조화하고 · 연결하고 · 출처를 추적**하는 게임 정보 대시보드 + 데이터베이스입니다.
정보의 원본인 척하지 않습니다. 모든 사실에는 원문 출처가 붙습니다.

## 등록된 게임

| 게임 | 탭 | 주요 내용 |
|---|---|---|
| **명조:워더링 웨이브** | 버전 · 공명자 · 무기 · 이벤트·픽업 · 리딤 코드 · 뉴스·공지 · 계산·통계 · 커뮤니티 | 3.7까지 공명자 60명·무기 93종 전원, 한정 5성 1돌 vs 명전 계산, 버전별 별의 소리 총량, 캐릭터 평가, 1.0~3.7 스토리 평가 |
| **명일방주 (한국 서버)** | 시즌 · 오퍼레이터 · 이벤트·헤드헌팅 · 뉴스·공지 · 계산·통계 · 커뮤니티 | 오퍼레이터 78명, 특화 효율 계산, 헤드헌팅 시뮬레이션, 오퍼레이터 평가 |
| **명일방주: 엔드필드** | 버전 · 오퍼레이터 · 무기 · 장비 · 공업·생산 · 이벤트·픽업 · 리딤 코드 · 뉴스·공지 · 계산·통계 · 커뮤니티 | 1.5 버전 기준 데이터 |
| **메이플스토리 (KMS)** | 뉴스·패치노트 · 이벤트 일정 | 공지·이벤트 |

## 웹사이트에서 할 수 있는 것

### 전체 게임 한 화면에서
- **홈**: 오늘의 게임 소식. 최신 뉴스, 진행 중 이벤트, 주요 일정, 최근 DB 변경, 게임별 요약을 한 번에 본다.
- **뉴스**: 모든 게임의 공지·패치노트를 최신순으로 모아 본다.
- **일정**: 모든 게임의 이벤트·픽업을 진행 중 / 예정 / 종료로 나눠 본다. 매일 자동 재빌드되어 상태가 바뀐다.
- **검색**: 게임·캐릭터·이벤트·뉴스를 한국어·영어 이름, 버전 번호("3.7"), 키워드("점검")로 찾는다.

### 게임 페이지
- **게임 홈**: 진행 중 이벤트 수, 다음 일정, 캐릭터·무기 수와 탭별 최신 항목.
- **버전·시즌**: 버전 하나에 속한 이벤트, 픽업, 코드, 뉴스, 캐릭터·무기 변경(출시·복각)을 한 페이지에 모은다.
- **캐릭터·무기 DB**
  - 목록: 공식 이미지, 이름 검색, 게임별 필터(명조: 등급·속성·무기), 버전순 정렬(최신순 기본, 오래된 순 전환), 그리드/리스트 보기.
  - 상세: **한눈에 보기**(티어 → 파티 순위 → 전용 무기 의존도 → 1돌/명전 → 조작 난이도)가 맨 위에 있다. 공식 데이터(능력치, 스킬, 돌파 효과 요약) → 계산 → 커뮤니티 순서로 이어진다. 긴 스킬 설명은 접혀 있고, 출시·복각 이력이 쌓인다.
- **이벤트·픽업**: 기간, 진행 상태, 주요 보상.
- **리딤 코드**: 사용 가능 / 예정 / 만료 상태, 탭 한 번에 복사.
- **계산·통계**: 결론 한마디("명전 추천", "약 76뽑")가 맨 위에 있다. 그 아래에 돌파 단계별 딜 그래프와 비교표가 있다. 계산 조건과 방법은 접혀 있다.
- **커뮤니티**
  - 최근 핫이슈: 게임 내 / 게임 외로 나눈다.
  - 꿀팁.
  - 버전별 스토리 평가: 줄거리 흐름, 채널 설문 별점, 국내 / 해외 반응.
  - 캐릭터 평가: 출시 당시 → 현재 평가 변화 포함.
- **출처**: 게임마다 등록된 출처 목록과 신뢰도, 자동 업데이트 작업, 정보 표시 기준을 보여준다.

### 모든 화면에 공통으로
- 모든 항목에 **출처 · 마지막 확인일**이 붙고, 신뢰도 배지(공식, 언론, DB, 전언, 유출)로 확실성을 표시한다.
- 정보 단계 배지: **공식(녹색) · 계산(보라) · 커뮤니티(황토)**.
- 이전 버전 기준인 계산·평가에는 "현재 버전에서 다시 확인되지 않음" 표시가 붙는다.
- 휴대폰 우선 설계: 하단 탭 바, 390px 화면에서 가로 넘침이 없다.

## 정보의 3단계 — 이 프로젝트의 핵심 이론

모든 게임의 모든 정보는 반드시 셋 중 하나로 분류하고, 한 레코드에 섞지 않습니다. → [docs/information-layers.md](docs/information-layers.md)

| 단계 | 무엇 | 예 (명조) |
|---|---|---|
| **1. 공식** | 게임사·공식 채널이 직접 준 정보 | 공명자 스킬·공명 체인 효과, 픽업 기간, 리딤 코드, 튜닝 확률 |
| **2. 계산 / 통계** | 공식 데이터로 계산한 비교적 객관적인 결과 — **계산 조건과 함께만** | 돌파 효율, 무기 효율, 버전별 획득 재화, 기대 뽑기 수, 복각 간격 |
| **3. 여론 / 커뮤니티** | 커뮤니티에서 실제로 형성된 의견의 **요약** — 사실이 아님 | 1돌 vs 전무 여론, 조합 평가, 사용감, 스토리 평가, 꿀팁 |

같은 주제(예: 청초 1돌)를 선택하면 **공식 → 계산 → 커뮤니티** 순서로 이어서 보여줍니다.
정보는 모두 옮겨 적는 게 아니라 **집대성해서 짧게** 정리합니다(스킬 툴팁 전문 ✗, 게임 외 잡담 ✗).

## 핵심 원칙

1. **정보의 3단계** — 공식 / 계산·통계 / 여론·커뮤니티를 저장·검증·화면 모두에서 분리 (위).
2. **Shared Core + Game-specific Modules** — 공통 기능은 재사용, 게임마다 다른 정보 구조는 설정으로.
3. **Repository = 데이터베이스** — 모든 데이터는 `games/` 아래 YAML 파일. 사람과 AI 모두 읽고 고칠 수 있음.
4. **출처 없는 사실은 없다** — 모든 레코드에 `sources` 필수, 검증 스크립트가 강제.
5. **모르면 모른다고** — 확인 안 된 값은 `null`(미확인), 불확실한 정보는 `certainty: reported`.
6. **낡은 정보는 지우지 않고 표시** — 기준 버전·마지막 확인일·`status`(current/outdated/archived).
7. **읽기 쉽게 (모든 게임 공통)** — 결론 한 줄을 맨 위에, 계산 과정·세부 의견·긴 공식 설명은 버튼(접기) 안에.
   원문(툴팁·공지·게시글)을 통째로 옮기지 않고 요약한다. 면책 안내 문구는 붙이지 않는다. 길이 제한은 검증기가 강제.

## 빠른 시작

```bash
npm install
npm run dev        # http://localhost:4321 개발 서버
npm run validate   # games/ 데이터 검증 (커밋 전 필수)
npm test           # 검증 규칙 테스트
npm run build      # 검증 + 정적 사이트 생성 (dist/)
npm run job        # AI 자동 업데이트 작업 목록
```

Node 22.12 이상 필요.

## 폴더 구조

```
games/                  ← 데이터 (게임별 폴더, 사람·AI가 수정하는 곳)
  maplestory/
    game.yaml           ← 게임 설정: 모듈, 출처, 업데이트 작업
    news/*.yaml         ← 레코드 1개 = 파일 1개
    events/*.yaml
  wuthering-waves/
    game.yaml
    versions/ resonators/ weapons/ events/ codes/ news/   ← 1. 공식
    analysis/*.yaml                                      ← 2. 계산·통계
    community/*.yaml                                     ← 3. 여론·커뮤니티
  arknights/            ← versions/(주년 시즌) operators/ events/ news/ analysis/ community/
  endfield/             ← versions/ operators/ weapons/ gear/ industry/ events/ codes/ news/ analysis/ community/
  _template/            ← 새 게임 복사용 템플릿
src/
  core/schema.ts        ← 모든 데이터 형식의 단일 정의 (zod)
  core/load.ts          ← 로딩 + 일관성 검증
  core/hub.ts           ← 페이지가 쓰는 조회/집계 API
  modules/              ← 모듈 타입별 화면 (news, schedule, database, version, codes, analysis, community)
  components/ layouts/ pages/ styles/ i18n/
scripts/                ← validate, job-context, check-scope
tests/                  ← 검증 규칙 테스트
docs/                   ← 설계 문서
```

## 문서

| 문서 | 내용 |
|---|---|
| [AGENTS.md](AGENTS.md) | **AI 에이전트는 여기부터** — 규칙 요약 |
| [CLAUDE.md](CLAUDE.md) | 새 게임을 만들 때의 노하우(명조 작업에서 정리) |
| [HANDOFF.md](HANDOFF.md) | 진행 중 작업 인수인계 |
| [docs/information-layers.md](docs/information-layers.md) | **정보의 3단계** (공식 · 계산/통계 · 여론/커뮤니티) |
| [docs/architecture.md](docs/architecture.md) | 전체 구조와 설계 결정 이유 |
| [docs/game-configuration.md](docs/game-configuration.md) | `game.yaml` 필드 설명 |
| [docs/modules.md](docs/modules.md) | 모듈 시스템, 새 모듈 타입 추가 |
| [docs/data-schemas.md](docs/data-schemas.md) | 레코드 형식, 정보 계층, 이력 |
| [docs/source-policy.md](docs/source-policy.md) | 출처 유형·신뢰도·인용 규칙 |
| [docs/ai-update-rules.md](docs/ai-update-rules.md) | AI 자동 최신화 절차와 금지 사항 |
| [docs/adding-a-game.md](docs/adding-a-game.md) | 새 게임 추가 방법 |
| [docs/validation.md](docs/validation.md) | 검증 단계와 규칙 목록 |
| [docs/design-system.md](docs/design-system.md) | UI 디자인 시스템(토큰·컴포넌트·화면 구조) |

## 배포

`main` 브랜치에 push하면 GitHub Actions가 검증 → 빌드 → GitHub Pages 배포합니다(`.github/workflows/deploy.yml`).
처음 한 번: 저장소 **Settings → Pages → Source: GitHub Actions** 선택.
매일 05:05(KST)에 자동 재빌드되어 "진행 중/예정/종료" 상태가 갱신됩니다.
정적 사이트이므로 Vercel, Cloudflare Pages 등 어디로든 옮길 수 있습니다(`npm run build` → `dist/`).
