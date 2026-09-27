# AGENTS.md — AI 에이전트 작업 규칙

이 저장소는 AI 예약 작업이 반복적으로 읽고 수정합니다. 새 세션이라면 이 파일을 먼저 끝까지 읽으세요.
진행 중인 개발 인수인계는 [HANDOFF.md](HANDOFF.md)에 있습니다.

## 프로젝트 한 줄 요약

관심 있는 모든 게임의 유용한 정보를 한 사이트에서. 정보를 **수집·구조화·연결·최신화**하되, 모든 사실은 원문 출처로 추적 가능해야 한다.
단순 뉴스 사이트나 위키로 축소하지 않는다. 게임마다 정보 구조가 다르다(Shared Core + Game-specific Modules).

**모든 정보는 3단계 중 하나다: 공식 / 계산·통계 / 여론·커뮤니티.** 한 레코드에 섞지 않는다 → [docs/information-layers.md](docs/information-layers.md) 필독.

## 어디를 고치나

| 하고 싶은 일 | 수정 위치 |
|---|---|
| 뉴스·이벤트·캐릭터 데이터 추가/수정 | `games/<game>/<collection>/<id>.yaml` 만 |
| 계산·통계 / 커뮤니티 여론 추가 | `games/<game>/analysis/`, `games/<game>/community/` (+ `subjects`로 공식 레코드에 연결) |
| 게임의 탭/필드/출처/작업 변경 | `games/<game>/game.yaml` |
| 새 게임 추가 | `games/_template/` 복사 → [docs/adding-a-game.md](docs/adding-a-game.md) |
| 데이터 형식 변경 | `src/core/schema.ts` (+ `docs/data-schemas.md`) |
| 새 모듈 타입(화면 종류) | [docs/modules.md](docs/modules.md) |
| 화면 디자인·스타일 | `src/styles/global.css` + [docs/design-system.md](docs/design-system.md) |

데이터 업데이트 작업은 **코드(`src/`)를 수정하지 않는다.**

## 화면·문장 원칙 (모든 게임 공통)

- **두괄식.** 결론 한 줄이 맨 위. 계산은 `results[0]`, 여론은 `summary`가 그 결론(150자 이하).
- **세부는 접는다.** 계산 과정·조건·세부 의견·근거, 스킬·체인·패시브 같은 긴 공식 설명은 버튼 안에 — 화면(공통 컴포넌트)이 자동으로 접는다. 데이터는 그 구조(`topics`, `results`, `positive`…)에 맞춰 나눠 쓴다.
- **통째로 옮기지 않는다.** 툴팁·공지·게시글 원문 금지. `summary` 200자, `topics[].text` 300자 이하(검증기가 강제).
- **의견에 출처를 일일이 달지 않는다.** 출처는 레코드 `sources` 한 곳에. 투자 결론은 `answer`에 한마디("명전 추천"), 설명은 `results[0]`.
- **안내 문구 금지.** "사실이 아니라 여론입니다" 같은 면책 문장 대신 배지·출처 이름으로 충분.
- 이 원칙은 게임별 설정이 아니라 공통 코드와 검증기에 들어 있다. 새 게임도 자동으로 따른다.

## 절대 규칙

1. **출처 없는 사실 금지.** 모든 레코드에 `sources` 1개 이상. URL은 `game.yaml`에 등록된 출처의 `domains`에 속해야 한다.
2. **추측 금지.** 확인 못 한 값은 `null`, 게시일 모르면 `publishedAt: null`, 종료일 모르면 `end: null`.
3. **확실성 표시.** 공식/언론/DB/위키 출처가 없으면 `certainty: reported`(전언) 또는 `speculative`(유출·예측).
4. **3단계 분리.** 공식 레코드에는 공식 정보만. 계산 결과는 `analysis` 모듈(계산 조건 `assumptions`·방법 `method` 필수, "이 조건에서 약 …"),
   커뮤니티 의견은 `community` 모듈("…라는 의견이 많다"). **AI가 평가를 지어내지 않는다** — 실제 글에서 반복되는 의견만 요약.
   요약은 짧게: 스킬 툴팁 전문·게임 외 잡담을 옮기지 않는다. **두괄식**: 계산은 `results[0]`, 여론은 `summary`에 결론 한 줄 — 세부는 화면에서 접힌다.
5. **덮어쓰기보다 이력.** 캐릭터 조정·복각 등 의미 있는 변화는 `history`에 항목을 **추가**한다.
6. **범위 제한.** 업데이트 작업 하나는 자기 컬렉션 폴더만 수정한다: `npm run scope -- <job-id>`.
7. **id는 영구.** 파일명 = `id` = URL. 한 번 만든 id는 바꾸지 않는다.
8. **`verifiedAt`은 원문을 직접 열어 확인했을 때만** 쓴다. 검색 결과 요약만 봤다면 `collectedAt`만.
9. **기준 버전.** 계산·커뮤니티 레코드는 `version` 필수. 패치로 전제가 바뀌면 삭제 말고 `status: outdated`.

## 업데이트 작업 절차 (요약)

```bash
npm run job                     # 작업 목록
npm run job -- <job-id>         # 이 작업에 필요한 컨텍스트(JSON): 출처, 필드, 기존 레코드 목록
# … 출처 조사 → 기존 레코드와 비교 → 변경분만 YAML 작성 …
npm run validate                # 스키마 + 일관성 검증
npm run scope -- <job-id>       # 다른 폴더를 건드리지 않았는지
git commit -m "data(<job-id>): <무엇을 추가/수정>"
```

상세: [docs/ai-update-rules.md](docs/ai-update-rules.md)

## 개발 명령

`npm run dev` · `npm run validate` · `npm test` · `npm run check`(타입) · `npm run build`

## 코드 원칙

- 짧고 명료한 코드. 존재하지 않는 문제를 위한 추상화 금지(두세 번째 게임을 쉽게 추가할 수 있는 정도면 충분).
- 게임별 분기를 코드에 하드코딩하지 않는다 — `game.yaml` 설정으로 해결.
- 데이터 → `core/schema` → `core/hub` → 페이지/컴포넌트. 컴포넌트에 데이터를 박지 않는다.
- 커밋 전: `npm run validate && npm test && npm run check && npm run build`.
