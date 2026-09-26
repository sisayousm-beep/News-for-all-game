# HANDOFF — 다음 세션 인수인계

> 새 세션의 AI는 **이 파일 → AGENTS.md → README.md** 순서로 읽고 시작한다.
> 작성: 2026-09-26 · 브랜치 `claude/game-hub-master-prompt-yw1g4z` (커밋 a13f9ea 기준)

## 1. 사용자(고용주)와 일하는 방식 — 반드시 지킬 것

- 사용자는 개발을 잘 모른다. **보고할 때 기술 세부사항은 빼고** 딱 세 가지만 쉽게 말한다:
  1. 뭘 구현했다
  2. 뭘 검증해야 한다 (검증 결과 포함)
  3. 사용자가 뭘 해야 한다
- 모호한 부분은 임의로 정하지 말고 **질문**한다. 대답이 모호하면 다시 질문한다.
- 원래 요구사항(마스터 프롬프트)의 핵심: 여러 게임 정보를 한 사이트에 모으는 플랫폼, 게임마다 다른 정보 구조, 출처 추적 필수, AI가 저장소를 자동으로 최신화, 모바일 중요, 짧고 깔끔한 코드. 상세 철학은 `AGENTS.md`와 `docs/`에 반영되어 있다.

## 2. 사용자가 이미 결정한 것 (다시 묻지 말 것)

| 항목 | 결정 |
|---|---|
| 첫 게임 | 메이플스토리 + 명조:워더링 웨이브 |
| 메이플 서버 | 한국 메이플(KMS) |
| 메이플 우선 정보 | 이벤트 일정, 뉴스/공지·패치노트 |
| 명조 우선 정보 | 공명자(캐릭터) DB, 뉴스/공지 |
| 표시 언어 | 한국어 우선 (다국어 확장 가능 구조) |
| 배포 | 미정 → 기본값 GitHub Pages로 설정해 둠 (어디로든 이전 가능) |
| 네트워크 | 사용자가 새 세션 환경을 **모든 도메인 허용**으로 변경함 |

## 3. 현재 상태 — 구현 완료

- 사이트 기반 전체: 대시보드, 게임 목록, 전체 뉴스, 전체 일정, 통합 검색, 게임별 허브(개요·탭·상세·출처 페이지), 모바일 하단 탭
- 게임별 모듈 시스템(설정 파일로 탭/필드 구성), 새 게임 템플릿 `games/_template/`
- 출처 시스템, 확실성 표시(확인됨/보도·전언/추측), AI 분석 분리 표시, 캐릭터 변경 이력
- 데이터 검증, 테스트 14개, AI 작업 도구(`npm run job`, `npm run scope`)
- 문서: `AGENTS.md`, `README.md`, `docs/` 9종
- CI + GitHub Pages 배포 워크플로(매일 05:05 KST 재빌드)
- 실제 데이터 14건: 메이플 뉴스 2 · 이벤트 5 / 명조 공명자 5 · 뉴스 2
- 마지막 확인: validate ✓, test 14/14 ✓, 타입검사 0 오류, 빌드 27페이지 ✓

## 4. 이전 세션의 한계 (이번 세션에서 해결할 것)

이전 환경은 공식 사이트·나무위키 등 **페이지 직접 열람이 차단**되어 웹 **검색 요약만**으로 데이터를 모았다.
그래서 현재 모든 출처에 `verifiedAt`이 없고 화면에 "원문 미검증"으로 표시된다.

알려진 미확인/임시 항목:

| 파일 | 해야 할 일 |
|---|---|
| 모든 레코드 (`games/**/*.yaml`) | 원문 직접 열람 후 내용 대조 → 일치하면 `verifiedAt` 기록, 다르면 수정 |
| `games/wuthering-waves/resonators/jiyan.yaml` | 속성·무기 `null` → 공식/신뢰 출처로 확인되면 채움 |
| `games/wuthering-waves/resonators/hsin.yaml` | 한국어 공식 명칭 확정 (후보: 여우의 별자리 / 심호 / 여우별) |
| `suoming.yaml`, `gyeongyeon.yaml` | 후반부 픽업 시작일 `null` → 확인되면 채움 |
| `games/wuthering-waves/news/*.yaml` | `publishedAt: null` → 공식 게시일 확인 |
| `games/wuthering-waves/news/version-3-7-announcement.yaml` | 복각 공명자(Chisa, Iuno, Lynae, Lucilla) 한국어 명칭 확인 |
| `games/maplestory/news/client-1-2-419.yaml` | 커뮤니티(인벤) 전재만 출처 → 공식 패치노트 URL로 교체 후 `certainty: confirmed` |
| `games/maplestory/events/personal-boss-mission.yaml` | 종료일·출처 페이지 정확성 확인 |

## 5. 다음 세션 할 일 (우선순위 순)

1. **네트워크 확인**: `curl -sI https://maplestory.nexon.com/News/Notice`, `https://wutheringwaves.kurogames.com/ko/main` 등이 열리는지. 안 열리면 사용자에게 알림.
2. **위 4번 표의 원문 검증·보완** — `AGENTS.md` 규칙대로. 작업별로 `npm run validate`, `npm run scope -- <job-id>`.
3. **데이터 확충**: 각 업데이트 작업(`npm run job`)으로 최근 공지·이벤트·공명자 추가. 추측 금지.
4. **자동 최신화 예약 작업 설정** — 시작 전 사용자에게 질문할 것: 실행 주기, 비용 허용 범위, 결과 알림 방식, 자동 커밋 대상 브랜치(main 직접 vs PR 검토).
5. 사용자 요청 시: PR 생성 / main 병합 안내.
6. 이후 후보(사용자에게 먼저 물어볼 것): 메이플 직업·보스 DB, 명조 뽑기(픽업) 일정, 세 번째 게임, 넥슨 Open API 연동(API 키 필요).

## 6. 사용자가 해야 할 일 (아직 안 한 것)

- 사이트를 공개하려면: 이 브랜치를 `main`에 병합 → 저장소 **Settings → Pages → Source: GitHub Actions** 선택.
- 자동 최신화 방식에 대한 질문(5-4번)에 답하기.

## 7. 참고: 주요 명령

```bash
npm install
npm run validate && npm test && npm run check && npm run build   # 커밋 전 전체 점검
npm run job                  # 업데이트 작업 목록
npm run job -- <job-id>      # 작업 컨텍스트
npm run scope -- <job-id>    # 작업 범위 검사
```
