# 모듈 시스템

**모듈 타입**은 코드(화면 + 레코드 스키마), **모듈 인스턴스**는 `game.yaml`의 설정입니다.
게임은 타입을 골라 이름·폴더·필드를 붙여 자기만의 허브를 구성합니다. 게임 이름으로 분기하는 코드는 없습니다.

| 타입 | 레코드 스키마 | 용도 예시 | 전역 집계 |
|---|---|---|---|
| `news` | `NewsRecord` | 공지, 패치노트, 업데이트 소식 | `/news/`, 대시보드 최신 소식 |
| `schedule` | `EventRecord` | 이벤트, 점검, 픽업, 시즌 | `/schedule/`, 대시보드 일정 |
| `database` | `EntityRecord` | 캐릭터, 직업, 보스, 아이템, 무기 | 대시보드 "최근 데이터 변경" |
| `version` | `VersionRecord` | 게임 버전·시즌 (공식 내용 + 그 버전의 계산·여론) | 게임 홈 "지금 버전" |
| `codes` | `CodeRecord` | 리딤 코드 (사용 가능 / 지난 코드) | 게임 홈 |
| `analysis` | `AnalysisRecord` | **계산·통계** 단계 | 공식 레코드 페이지에 연결 |
| `community` | `CommunityRecord` | **여론·커뮤니티** 단계 | 공식 레코드 페이지에 연결 |

모듈 타입이 정보 단계를 정합니다(`LAYER_OF`): `analysis` = 계산, `community` = 커뮤니티, 나머지 = 공식. → [information-layers.md](information-layers.md)

`database` 한 타입으로 대부분의 게임별 DB를 표현합니다:

```yaml
# 명조
- { type: database, id: resonators, label: 공명자, collection: resonators, fields: [등급, 속성, 무기, 출시 버전],
    sections: [기본 능력치, 스킬, 공명 체인] }   # 상세 페이지의 공식 하위 항목(topics) 묶음
# (예) 메이플스토리 — 아직 미구현
- { type: database, id: jobs, label: 직업, collection: jobs, fields: [계열, 주스탯, 출시일] }
- { type: database, id: bosses, label: 보스, collection: bosses, fields: [난이도, 입장 레벨, 주간/월간] }
```

모든 타입은 세 화면을 제공합니다 (`src/modules/<type>/`):

| 파일 | 위치 |
|---|---|
| `List.astro` | `/games/<game>/<module>/` |
| `Detail.astro` | `/games/<game>/<module>/<id>/` |
| `Widget.astro` | 게임 개요(`/games/<game>/`)의 카드 |

## 새 모듈 타입 추가

`database` + `fields`로 표현이 안 될 때만 추가합니다 (예: 가챠 확률 계산기, 육성 재료 합산처럼 전용 로직/화면이 필요할 때).

1. `src/core/schema.ts`: 레코드 스키마 작성(`RecordBase.extend({...})`), `MODULE_TYPES`와 `RECORD_SCHEMAS`에 추가.
2. 교차 검증이 필요하면 `src/core/load.ts`의 `checkRecord`에 `mod.type === '<type>'` 규칙 추가.
3. `src/modules/<type>/List.astro`, `Detail.astro`, `Widget.astro` 작성 (props: `game`, `mod`, `record`).
4. `src/modules/index.ts`의 `views`에 등록.
5. 전역 집계가 필요하면 `src/core/hub.ts`에 `collect<T>('<type>')` 기반 함수 추가.
6. `src/i18n/ko.ts`에 enum 라벨, `tests/validate.test.ts`에 규칙 테스트, 이 문서와 `data-schemas.md` 갱신.

한 게임만 쓰는 모듈 타입도 이 방식으로 추가합니다. 이름은 범용적으로(`gacha`, `materials`) 지어 다른 게임이 재사용할 수 있게 합니다.
