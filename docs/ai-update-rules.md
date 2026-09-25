# AI 자동 최신화 규칙

Claude/GPT 등의 예약 작업이 이 저장소를 갱신하는 방법입니다. 특정 AI 서비스에 종속되지 않습니다 — 셸, git, 웹 검색/열람만 있으면 됩니다.

## 작업 단위

작업은 `game.yaml`의 `updates`에 선언되며 **게임 × 컬렉션** 단위입니다 (`maplestory-news`, `wuthering-waves-resonators`…).
예약 작업 하나 = 업데이트 작업 하나. 이렇게 하면 컨텍스트·비용이 작고, 실패가 한 폴더에 갇히며, 작업별로 주기를 다르게 둘 수 있습니다.

| frequency | 의미 | 예 |
|---|---|---|
| `6h`, `12h` | 자주 | 공지, 속보 |
| `1d` | 매일 | 이벤트 일정 |
| `patch` | 게임 패치 때 | 캐릭터 DB |
| `7d`, `manual` | 드물게 | 가이드, 정적 데이터 |

## 절차

```
1. 컨텍스트     npm run job -- <job-id>             → 출처, 필드, 기존 레코드 id/URL 목록
2. 발견         등록된 출처(job.sources)에서 최신 정보 조사
3. 출처 검증    URL이 등록 출처 domains에 속하는가? 공식 원문이 있는가?
4. 비교         기존 레코드(existing)와 대조 — 이미 있는 URL/제목이면 새로 만들지 않음
5. 변경 생성    새 레코드 추가 / 기존 레코드 수정 / history 항목 추가 (writeTo 폴더에만)
6. 스키마 검증  npm run validate
7. 범위 검증    npm run scope -- <job-id>
8. 커밋         git commit -m "data(<job-id>): 추가 N, 수정 M — <요약>"
9. 배포         main에 push → Actions가 재검증·빌드·배포 (검증 실패 시 배포되지 않음)
```

## 반드시

- 원문에 있는 사실만 쓴다. `summary`는 원문 요약이지 의견이 아니다.
- 확인 못 한 값: `null`. 게시일/종료일 모름: `null`. 기존 `null`을 추측으로 채우지 않는다.
- 불확실하면 `certainty: reported` / `speculative`, 한국어 공식 명칭이 불확실하면 후보를 `aliases`에.
- 새 파일 id: 영문 공식 명칭의 kebab-case (없으면 로마자 표기). 뉴스는 `<yyyy-mm>-<주제>` 등 안정적인 형태.
- 수정할 때 `updatedAt`을 오늘로. 사실이 바뀌면 `history`에 항목 추가(database).
- 원문을 직접 열었으면 `verifiedAt`, 검색 요약만 봤다면 `collectedAt`만.
- 분석/평가를 쓰려면 `analysis` 블록에, `author: ai:<모델명>`, `basedOn`에 근거 출처.

## 금지

- `src/`, `scripts/`, `tests/`, 다른 게임/컬렉션, `game.yaml` 수정 (데이터 작업에서). 설정 변경이 필요하면 커밋하지 말고 보고.
- 검증 오류가 난 상태로 커밋, 검증을 통과하려고 규칙을 우회(예: 출처 유형을 바꿔 `confirmed` 만들기).
- 기존 레코드 삭제. 잘못된 정보는 고치고, 취소된 이벤트는 `summary`/`endNote`로 표시.
- 출처 없는 정보, 기억에 의존한 정보 추가.

## 실패 시

검증이 통과하지 않으면 변경을 버리고(`git checkout -- games/`) 오류를 보고합니다. 부분 커밋하지 않습니다.
