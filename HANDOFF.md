# HANDOFF — 다음 세션 인수인계

> 새 세션의 AI는 **이 파일 → AGENTS.md → README.md** 순서로 읽고 시작한다.
> 작성: 2026-09-26 · 최근 브랜치 `claude/wuthering-waves-info-structure-nvczn3`

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

- 2026-09-26 **정보의 3단계 도입**(브랜치 `claude/wuthering-waves-info-structure-nvczn3`) — 사용자가 정한 프로젝트 핵심 이론.
  공식 / 계산·통계 / 여론·커뮤니티를 모듈 타입으로 분리, `subjects`로 연결, 기준 버전·status로 신선도 관리. 기준 문서 [docs/information-layers.md](docs/information-layers.md).
  신규 모듈 타입 `version` `codes` `analysis` `community`, DB 상세 `sections`/`topics`. 기존 `analysis` 블록(AI 해석)은 폐지(AI가 평가를 만들지 않는다는 원칙).
  명조: 버전 2, 무기 1, 이벤트·픽업 8, 리딤 코드 4, 튜닝 확률 공지, 청초 공식 토픽 18, 계산 2, 커뮤니티 3(디시 명조 갤러리 글 25개 직접 열람). 기염 무기 `null` → 대검(encore DB로 확인).
  사용자 요구: 정보를 전부 옮기지 말고 **집대성해서 짧게** — 툴팁 전문·게임 외 잡담 금지.

- 2026-09-26 **3.x 공명자 전원 + 돌파 그래프 + 평가 변화**: 3.0~3.7 공명자 12명 추가(린네·모니에·에이메스·루크·시그리카·히유키·데니아·루시·레베카·루실라·양양·현령·수수), 공식 초상화 포함.
  계산 `<id>-s1-vs-signature` 12건(청초 포함): 1돌 vs 명전 결론 + 명함~6돌 막대 그래프(`chart`). 수치는 Prydwen Calculations 탭(명함=100% 기준), 뽑기 수는 공식 튜닝 확률(763)로 계산.
  커뮤니티 `<id>-evaluation` 14건: `verdicts`(티어·파티 순위·전무 의존도·파티 의존도·돌파 가치·국내 만족도) + `shift`(출시→현재).
  출시→현재 근거: Prydwen 티어 changelog(날짜별 T 변동), 아카 명조 채널 버전별 「성능 만족도」 설문(3.0 161473805 ~ 3.5 180186371), Reddit 글(출시 직후 vs 최근).
  **3.6 설문이 올라오면** 청초·경연 `verdicts`에 국내 만족도 추가.

- 2026-09-27 무기: 3.x 전용 무기 14종(encore DB 능력치·패시브, 732px 공식 무기 이미지 → 투명 여백 trim). 출시 기간은 KR `ArticleMenu.json`의 「무기 이벤트 튜닝」 글.
  공명자 11명 출시일도 같은 방식(「캐릭터 이벤트 튜닝」 글)으로 채움. 히유키·서린 불꽃(3.3), 경연·수많은 인도(3.6)는 KR 튜닝 글이 없어 `null`.
  엔티티에 연결된 계산·커뮤니티는 탭에서 빠지고 엔티티 페이지에만 표시(`listed()`).

- 2026-09-27 커뮤니티 탭 = 최근 핫이슈(게임 내/외)·꿀팁(월드 투어 한정 패키지, 결제 차단 제보, 3.7 누충·복각 논란, 3.7 신규 지역 기대, 3.7 직전 체크리스트, 결제 할인 팁).
  사용자 결정: 오래된 이슈(3.3 띵조 페스티벌 등)는 넣지 않는다 — 최근 버전 이슈만.
  계산 탭 = 3.6 별의 소리 총량(공식 이벤트 안내 이미지를 직접 읽어 합산 + 반복 콘텐츠 + 보상·코드), 3.7 누충 구간별 최소 결제 금액(채널 냅색 계산). 찾는 법: 아카 `?mode=best`(개념글) + `target=title&keyword=`, Reddit `search/?q=&sort=top&t=week`.
  공식 이벤트 보상은 이미지뿐 → 기사 JSON의 img src를 받아 sharp로 잘라 직접 읽는다(EN 「Update Content」·「Upcoming Events」 글).
  **3.7 업데이트 후 갱신할 것**: 3.7 별의 소리 총량(이벤트 공지 + 몽추천라 탐사 보상), 누충·복각 여론 추이, 3.6 채널 설문 결과.

- 2026-09-27 **전 공명자·무기 + 스토리 평가**: 1.x·2.x 공명자 43명(4성·방랑자 포함)과 5성·4성 무기 77종 추가. 공명자 체인·무기 패시브는 encore 문구를 자동 요약(수치 범위 12~24%로 압축).
  출시일: KR `ArticleMenu.json`의 튜닝 공지(「X 버전 업데이트 이후」면 게시일 +1일 — 공지는 업데이트 전날 11시에 올라온다. 2.0만 당일 00:00). 1.0 출시 배너 공지는 목록에 없음(→ null).
  계산 21명 추가(한정 5성, Prydwen Calculations·Build 파싱), 평가 43명(Prydwen 역경의 탑 티어 기준 — 국내·Reddit 여론은 아직 없음, 보강 필요).
  스토리 평가 21건(1.0~3.6): 별점은 아카 채널 설문 누적 표(5점), 국내=아카 글·설문, 해외=Reddit. 아카는 연속 열람 시 차단 → `DELAY=15000`으로 천천히.
  **다음**: 3.6 설문 결과(~9/27 마감) 나오면 story-v3-6 별점·청초·경연 만족도, 1.x·2.x 캐릭터 평가에 국내·Reddit 여론 보강.

## 4. 공식 출처 읽는 법 (2026-09-26 확인)

네트워크는 열려 있다. 단 나무위키·fandom·prydwen은 403(차단).

| 출처 | 방법 |
|---|---|
| 메이플 공지/업데이트/이벤트 | `curl`로 HTML 그대로 읽힘. `/News/Notice`, `/News/Update`(패치노트 전문이 텍스트), `/News/Event`(목록에 기간 텍스트), 상세 `/News/Event/<n>`에 정확한 시각 |
| 메이플 이벤트 본문 | 대부분 이미지. `lwi.nexon.com/...png`를 받아 잘라서 읽는다. 패치노트(`/news/update/<n>`)에 같은 내용이 텍스트로 있으니 그쪽 우선 |
| 명조 공식 사이트 | JS 앱. 데이터는 JSON: `https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/kr/ArticleMenu.json`(목록), `.../kr/article/<id>.json`(본문). 영어는 `/en/`. 인용 URL은 `https://wutheringwaves.kurogames.com/ko/main/news/detail/<id>` |
| 명조 공명자 한국어 명칭·속성 | `https://wutheringwaves.kurogames.com/static4.0/assets/kr-*.js` 안의 공명자 목록(name, attribute). attribute1 응결 · 2 기류 · 3 용융 · 4 인멸 · 5 회절 · 6 전도 |
| 명조 픽업 일정 | 한국어 피드에는 최근 픽업 공지가 없음 → 영어 피드의 `Featured Resonator Convene` 글 |

| 명조 인게임 문구·수치(스킬, 공명 체인, 무기) | `https://api.encore.moe/ko/character/<id>`, `/ko/weapon/<id>`, 목록 `/ko/character` (출처 `encore-db`, DATABASE) |
| 명조 튜닝 확률 | 공식 `ko/article/763.json` 「튜닝 상세정보」 |
| 커뮤니티 (디시 명조 갤) | 검색 `gall.dcinside.com/mgallery/board/lists?id=wutheringwaves&s_type=search_subject_memo&s_keyword=…`(다음 검색은 `search_pos`), 본문 `board/view/?id=wutheringwaves&no=<n>`, 댓글은 `POST /board/comment/`(본문의 `e_s_n_o` 필요). 광고 줄("1/20 이전 다음") 제외 |
| Reddit·아카라이브·Prydwen | curl은 403(봇 차단)이지만 **Playwright 브라우저로 열림**. 프록시 CA의 SPKI 해시를 `--ignore-certificate-errors-spki-list`로 신뢰(프록시 CA만 신뢰, 검증 끄는 것 아님). 아카는 "잠시만 기다리십시오"가 사라질 때까지 대기 후 `.article-body`, `.comment-item .message`. Reddit은 `shreddit-post`/`shreddit-comment`. Prydwen은 `.tabs .single-tab` 클릭(Review·Calculations·Build) |
| YouTube | 검색 결과(ytInitialData)의 제목·조회수만 읽힘. 영상 페이지는 차단 → `collectedAt`만, note에 "영상 제목" 명시 |
| 차단됨 | NGA, fandom. 빌리빌리는 검색 API 1~2회 후 차단 |

Playwright: 로컬 미리보기(`astro preview`) 스크린샷은 `executablePath: /opt/pw-browsers/chromium-1194/chrome-linux/chrome`로 동작함(외부 사이트는 프록시 인증서 문제).

## 5. 남은 미확인 항목

| 파일 | 상태 |
|---|---|
| `wuthering-waves/resonators/jiyan.yaml` | 무기 `null` — 공식 한국어 문구에서 못 찾음. 출시 픽업 일정도 공식 근거 없음 |
| `gyeongyeon.yaml` | 픽업 시작일 `null` — 공식 3.6 1·2기 픽업 공지 어디에도 경연 배너가 없음(1기 청초·데니아, 2기 히유키·모니에) |
| `suoming.yaml` | 한국어 명칭 '쇄명'은 한국 공식 페이지에 아직 없음(3.7 출시 후 확인). 후반부 시작일 `null` |
| `version-3-7-announcement.yaml` | 복각 4명은 보도 기준. 공식 미리보기는 배너 이름만 있음. 신규 지역명 「몽추천라」 공식 한국어 확인 필요 |
| 언론 출처(`press-kr`, `press-en`) | 직접 열람 안 함 → `collectedAt`만 |

## 6. 다음 세션 할 일 (우선순위 순)

0. 3단계 데이터 확장: 2.x 이전 공명자(같은 방식: 공식 토픽 + 1돌 vs 명전 그래프 + 평가/평가 변화), 에코·에코 세트 모듈, 버전별 획득 별의 소리(계산), 스토리·버전 여론.
   모니에·수수 계산은 공개된 돌파 계산이 생기면 추가. 리딤 코드는 공식 출처(한국 공식 X) 확인 필요.

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
