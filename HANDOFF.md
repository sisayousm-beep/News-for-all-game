# HANDOFF — 다음 세션 인수인계

> 새 세션의 AI는 **이 파일 → AGENTS.md → README.md** 순서로 읽고 시작한다.
> 작성: 2026-09-26 · 브랜치 `claude/continue-task-l21f96`

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
- 실제 데이터 23건: 메이플 뉴스 4 · 이벤트 11 / 명조 공명자 5 · 뉴스 3
- 2026-09-26 세션: 공식 원문 직접 열람으로 기존 레코드 검증(`verifiedAt`), 오류 정정, 신규 9건 추가
- 마지막 확인: validate ✓, test 14/14 ✓, 타입검사 0 오류, 빌드 36페이지 ✓
- 2026-09-26 디자인 개편(브랜치 `claude/news-for-all-game-redesign-m9ikil`): 다크 임시 UI → **Editorial Light** 디자인 시스템. 기준 문서 [docs/design-system.md](docs/design-system.md).
  기능 유지 + 추가: 신뢰 배지(공식/보도/DB/전언/추측), 홈 Featured·게임 카드, 일정 그룹(오늘/진행 중/이번 주/이후/종료)·D-Day, 뉴스·일정 필터, DB 그리드/목록 전환·관련 뉴스, 검색 로딩/오류 상태.
  스키마 추가(선택 필드): 레코드 `image`, 게임 `publisher`. 게임 색 변경: 메이플 `#d9652f`, 명조 `#3f6e8c`.
- 2026-09-26 공식 이미지 적용: 게임 로고(`theme.icon`)·키비주얼(`theme.cover`), 메이플 이벤트 배너 8, 뉴스 이미지 4, 명조 공명자 일러스트 5.
  파일은 `public/games/<game>/img/`, 원본 주소는 각 레코드 `imageFrom`. 사용자 결정: 개인용 사이트이므로 공식 이미지 사용 OK.
  메이플 키비주얼은 9월 업데이트 프로모션의 하늘 배경 + 아르고 호 이미지를 합성한 것. 쇄명 이미지는 3.7 미리보기 공지(이름 표기 확인)에서 잘라냄.
  자동 업데이트 작업도 이미지를 저장하도록 규칙 추가(docs/ai-update-rules.md), `npm run scope`가 `public/games/<game>/img/<collection>/` 허용.

## 4. 공식 출처 읽는 법 (2026-09-26 확인)

네트워크는 열려 있다. 단 나무위키·fandom·prydwen은 403(차단).

| 출처 | 방법 |
|---|---|
| 메이플 공지/업데이트/이벤트 | `curl`로 HTML 그대로 읽힘. `/News/Notice`, `/News/Update`(패치노트 전문이 텍스트), `/News/Event`(목록에 기간 텍스트), 상세 `/News/Event/<n>`에 정확한 시각 |
| 메이플 이벤트 본문 | 대부분 이미지. `lwi.nexon.com/...png`를 받아 잘라서 읽는다. 패치노트(`/news/update/<n>`)에 같은 내용이 텍스트로 있으니 그쪽 우선 |
| 명조 공식 사이트 | JS 앱. 데이터는 JSON: `https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/kr/ArticleMenu.json`(목록), `.../kr/article/<id>.json`(본문). 영어는 `/en/`. 인용 URL은 `https://wutheringwaves.kurogames.com/ko/main/news/detail/<id>` |
| 명조 공명자 한국어 명칭·속성 | `https://wutheringwaves.kurogames.com/static4.0/assets/kr-*.js` 안의 공명자 목록(name, attribute). attribute1 응결 · 2 기류 · 3 용융 · 4 인멸 · 5 회절 · 6 전도 |
| 명조 픽업 일정 | 한국어 피드에는 최근 픽업 공지가 없음 → 영어 피드의 `Featured Resonator Convene` 글 |

Playwright 브라우저는 프록시 인증서 문제로 실패함 — 위 방법으로 충분.

## 5. 남은 미확인 항목

| 파일 | 상태 |
|---|---|
| `wuthering-waves/resonators/jiyan.yaml` | 무기 `null` — 공식 한국어 문구에서 못 찾음. 출시 픽업 일정도 공식 근거 없음 |
| `gyeongyeon.yaml` | 픽업 시작일 `null` — 공식 3.6 1·2기 픽업 공지 어디에도 경연 배너가 없음(1기 청초·데니아, 2기 히유키·모니에) |
| `suoming.yaml` | 한국어 명칭 '쇄명'은 한국 공식 페이지에 아직 없음(3.7 출시 후 확인). 후반부 시작일 `null` |
| `version-3-7-announcement.yaml` | 복각 4명은 보도 기준. 공식 미리보기는 배너 이름만 있음. 신규 지역명 「몽추천라」 공식 한국어 확인 필요 |
| 언론 출처(`press-kr`, `press-en`) | 직접 열람 안 함 → `collectedAt`만 |

## 6. 다음 세션 할 일 (우선순위 순)

1. 3.7 업데이트(9/30) 이후 한국어 공식 공지로 위 5번 항목 확인.
2. **자동 최신화 예약 작업 설정** — 시작 전 사용자에게 질문할 것: 실행 주기, 비용 허용 범위, 결과 알림 방식, 자동 커밋 대상 브랜치(main 직접 vs PR 검토).
3. 사용자 요청 시: PR 생성 / main 병합 안내.
4. 이후 후보(사용자에게 먼저 물어볼 것): 메이플 직업·보스 DB, 명조 뽑기(픽업) 일정, 세 번째 게임, 넥슨 Open API 연동(API 키 필요).

## 7. 사이트 공개 상태 (2026-09-26 완료)

- 공개 주소: https://sisayousm-beep.github.io/News-for-all-game/
- 저장소 기본 브랜치 = `main`. `main`에 push하면 자동 배포, 매일 05:05 KST 재빌드.
- GitHub Pages 환경(github-pages)의 배포 허용 브랜치에 `main` 추가됨.
- 사용자에게 남은 일: 자동 최신화 방식 질문(6-2번)에 답하기.

## 8. 참고: 주요 명령

```bash
npm install
npm run validate && npm test && npm run check && npm run build   # 커밋 전 전체 점검
npm run job                  # 업데이트 작업 목록
npm run job -- <job-id>      # 작업 컨텍스트
npm run scope -- <job-id>    # 작업 범위 검사
```
