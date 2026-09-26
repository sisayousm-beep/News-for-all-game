# 새 게임 추가

> 새 게임도 [정보의 3단계](information-layers.md)와 화면 원칙(결론 먼저, 세부는 접기, 원문 통째 금지)을 그대로 따릅니다. 공통 코드·검증기에 들어 있어 따로 할 일은 없고, 데이터를 `topics`·`results`·`summary` 구조에 맞춰 짧게 쓰면 됩니다.

코드 수정 없이 폴더 하나로 추가됩니다. 참고 구현: `games/maplestory`(뉴스+일정), `games/wuthering-waves`(DB+뉴스).

1. **복사**: `cp -r games/_template games/<game-id>` (id는 소문자-kebab, 예 `arknights`)
2. **`game.yaml` 작성** ([game-configuration.md](game-configuration.md))
   - `id`를 폴더 이름과 같게, 이름·장르·서버·대표 색.
   - `modules`: 이 게임에서 사용자가 원하는 정보를 고른다. 캐릭터/직업/보스처럼 목록형 정보는 `database` + `fields`.
   - `sources`: 공식 출처부터 등록. 도메인 정확히.
   - `updates`: 컬렉션마다 작업 하나, 적절한 주기.
3. **레코드 추가**: `games/<game-id>/<collection>/<id>.yaml` — 형식은 [data-schemas.md](data-schemas.md), 예시는 기존 게임 폴더.
4. **검증**: `npm run validate` → `npm run dev`로 `/games/<game-id>/` 확인.
5. **커밋**. 대시보드, 게임 목록, 전체 뉴스/일정, 검색에 자동으로 나타납니다.

기존 모듈 타입으로 표현이 안 되는 정보가 있으면 [modules.md](modules.md)의 "새 모듈 타입 추가".
