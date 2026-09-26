# Game Hub

> 내가 관심 있는 모든 게임의 모든 유용한 정보를 하나의 웹사이트에서 확인한다.

Game Hub는 여러 곳에 흩어진 게임 정보(공식 공지, 패치노트, 이벤트, 캐릭터 DB, 커뮤니티 반응)를
**모으고 · 구조화하고 · 연결하고 · 출처를 추적**하는 게임 정보 대시보드 + 데이터베이스입니다.
정보의 원본인 척하지 않습니다. 모든 사실에는 원문 출처가 붙습니다.

현재 등록된 게임: **메이플스토리(KMS)**, **명조:워더링 웨이브**

## 핵심 원칙

1. **Shared Core + Game-specific Modules** — 공통 기능은 재사용, 게임마다 다른 정보 구조는 설정으로.
2. **Repository = 데이터베이스** — 모든 데이터는 `games/` 아래 YAML 파일. 사람과 AI 모두 읽고 고칠 수 있음.
3. **출처 없는 사실은 없다** — 모든 레코드에 `sources` 필수, 검증 스크립트가 강제.
4. **사실 / 정리 / 분석 분리** — AI 분석(Level 3)은 사실과 다른 모양으로 저장·표시.
5. **모르면 모른다고** — 확인 안 된 값은 `null`(미확인), 불확실한 정보는 `certainty: reported`.

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
    resonators/*.yaml
    news/*.yaml
  _template/            ← 새 게임 복사용 템플릿
src/
  core/schema.ts        ← 모든 데이터 형식의 단일 정의 (zod)
  core/load.ts          ← 로딩 + 일관성 검증
  core/hub.ts           ← 페이지가 쓰는 조회/집계 API
  modules/              ← 모듈 타입별 화면 (news, schedule, database)
  components/ layouts/ pages/ styles/ i18n/
scripts/                ← validate, job-context, check-scope
tests/                  ← 검증 규칙 테스트
docs/                   ← 설계 문서
```

## 문서

| 문서 | 내용 |
|---|---|
| [AGENTS.md](AGENTS.md) | **AI 에이전트는 여기부터** — 규칙 요약 |
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
