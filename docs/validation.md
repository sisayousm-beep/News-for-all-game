# 검증

`npm run validate`(= `scripts/validate.ts`)가 `games/` 전체를 검사합니다. `npm run build`도 먼저 실행하며, 배포 워크플로도 실패 시 배포하지 않습니다.

## 단계

1. **스키마** (`src/core/schema.ts`, zod): 필수 필드, 타입, enum, 날짜 형식(시각은 오프셋 필수), URL 형식.
2. **설정 일관성** (`src/core/load.ts`): 게임 id = 폴더명, 모듈 id/컬렉션/출처 id 중복 없음, 예약 id(`sources`) 금지, 업데이트 작업의 컬렉션·출처가 존재.
3. **레코드 일관성** (`checkRecord`):
   - `id` = 파일 이름
   - 모든 인용 출처가 등록되어 있고 URL이 해당 출처 `domains`에 속함
   - YAML 문법 오류도 파일 단위 오류로 보고(검증이 중단되지 않음)
   - 길이 제한(모든 게임): `summary` 200자, `topics[].text` 300자, 계산 `results[]`·여론 `summary`(=결론) 150자 — 원문 통째 복사 방지
   - 공식 단계의 `confirmed`는 사실 등급 출처(OFFICIAL/OFFICIAL_API/PRESS/DATABASE/WIKI) 필요
   - 커뮤니티 단계는 COMMUNITY/GUIDE 출처 1개 이상, 계산 단계는 `version`·`method`·`assumptions`·`results` 필수(스키마)
   - `subjects`가 가리키는 레코드·토픽이 존재
   - DB `topics[].section`이 모듈 `sections`에 선언됨, 토픽 id 중복 없음
   - 일정·버전·코드: `end` ≥ `start`
   - DB: `attributes` 키가 `fields`와 정확히 일치(누락 시 `null`로 명시), `values`가 있으면 허용 값만
4. **범위** (`npm run scope -- <job-id> [base]`): 변경 파일이 작업의 컬렉션 폴더 안에만 있는지.

오류가 있는 레코드는 사이트에 표시되지 않고, 빌드는 실패합니다.

## 테스트

`npm test` — `tests/validate.test.ts`가 위 규칙 각각을 임시 게임 폴더로 검사하고, 실제 저장소 데이터와 `_template`이 유효한지도 확인합니다.
검증 규칙을 추가하면 테스트도 추가합니다.

## 전체 점검 (커밋 전)

```bash
npm run validate && npm test && npm run check && npm run build
```
