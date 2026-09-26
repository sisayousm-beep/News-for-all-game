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
- **3단계를 지킨다** ([information-layers.md](information-layers.md)): 공식 작업은 공식 사실만, 계산은 `analysis` 작업(조건·방법 필수),
  여론은 `community` 작업. 계산·여론 레코드는 `subjects`로 공식 레코드를 가리킨다(`npm run job -- <id>`의 `linkTargets`).
- **요약한다.** 스킬 툴팁 전문, 공지 전문, 게시글 원문을 옮기지 않는다. 핵심 1~3문장 + 핵심 수치.
- **커뮤니티 요약 절차**: 글 본문과 댓글을 직접 열어 읽는다 → 반복되는 의견만 모은다 → 긍정/부정/갈림/팁으로 나눈다 →
  이유를 쓴다 → 읽은 글을 모두 `sources`에(`verifiedAt`) → 어느 커뮤니티 기준인지 `summary`에 밝힌다. 광고·잡담·게임 외 사건은 제외.
  확인되지 않은 평가를 만들어 넣지 않는다. 같은 주제의 기존 레코드가 있으면 새로 만들지 않고 갱신한다.
- **계산 절차**: 공식 수치만으로 가능한 계산은 직접 하고 `method`에 식을 쓴다. 남의 계산을 옮길 때는 그 계산의 조건을 함께 옮긴다. 조건을 모르면 쓰지 않는다.
- 패치로 전제가 바뀐 계산·여론은 지우지 않고 `status: outdated`.
- **이미지**: 원문에 대표 이미지(이벤트 배너, 업데이트 키비주얼, 캐릭터 공식 일러스트)가 있으면 내려받아
  `public/games/<game>/img/<collection>/<id>.webp`로 저장(가로 최대 1280px, WebP)하고 레코드에
  `image: /games/<game>/img/<collection>/<id>.webp`, `imageFrom: <원본 이미지 URL>`을 쓴다. 공식 출처 이미지만 쓴다.
  - 메이플 이벤트: `/News/Event` 목록의 배너(285×120). 명조 공지: 기사 JSON 본문의 첫 키비주얼. 명조 공명자: 공식 사이트 `kr-*.js`/`index-*.js`의 `role-small/<key>.webp`.

## 금지

- `src/`, `scripts/`, `tests/`, 다른 게임/컬렉션, `game.yaml` 수정 (데이터 작업에서). 설정 변경이 필요하면 커밋하지 말고 보고.
- 검증 오류가 난 상태로 커밋, 검증을 통과하려고 규칙을 우회(예: 출처 유형을 바꿔 `confirmed` 만들기).
- 기존 레코드 삭제. 잘못된 정보는 고치고, 취소된 이벤트는 `summary`/`endNote`로 표시.
- 출처 없는 정보, 기억에 의존한 정보 추가.

## 실패 시

검증이 통과하지 않으면 변경을 버리고(`git checkout -- games/`) 오류를 보고합니다. 부분 커밋하지 않습니다.
