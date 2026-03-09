# Time Attack Counter

게임 스피드런·타임어택 기록을 위한 Windows 오버레이 앱.
게임 화면 위에 항상 띄워두고, 단축키와 ESC 키만으로 페이즈별 시간을 자동 기록합니다.

---

## 주요 기능

- **글로벌 단축키** — 게임에 포커스가 있어도 시작/종료 단축키 동작
- **ESC 페이즈 감지** — 게임 내 ESC 입력을 감지해 페이즈 시간 자동 분할 기록 (ESC는 게임에 그대로 전달)
- **항상 위 오버레이** — `screen-saver` 레벨로 풀스크린 게임 위에도 표시
- **타임어택 유형 선택** — 풀런 / Any% / Low% / Glitchless
- **결과 자동 저장** — 최근 100개 기록을 로컬에 영속 저장
- **단축키 커스터마이징** — UI에서 시작·종료 키 변경 가능

---

## UI 레이아웃

```
┌─────────────────────────┐  ← 드래그 영역
│  [유형 선택 드롭다운]   │
│  00:12.345  (총 시간)   │
│  Phase 2: 00:04.123     │
├─────────────────────────┤
│  ✓ Phase 1: 00:08.222   │
│  ...                    │
├─────────────────────────┤
│  [시작]  [종료]  [⚙]   │
└─────────────────────────┘
```

---

## 기술 스택

| 역할 | 라이브러리 |
|---|---|
| 앱 프레임워크 | Electron 33 |
| 빌드 툴 | electron-vite 2 |
| UI | React 18 + Tailwind CSS 3 |
| 글로벌 키훅 | uiohook-napi |
| 설정·결과 저장 | electron-store 8 |

---

## 프로젝트 구조

```
src/
├── main/
│   ├── index.js          # 메인 프로세스 진입점 (윈도우 생성, IPC, 단축키 등록)
│   ├── keyboardHook.js   # uiohook-napi 글로벌 키 감지 (ESC → 페이즈 전환)
│   ├── timerManager.js   # 타이머 상태·페이즈 관리, 100ms tick 브로드캐스트
│   ├── store.js          # electron-store 초기화 (단축키·결과 영속)
│   └── attackTypes.js    # 타임어택 유형 목록 (추가는 이 파일만 수정)
├── preload/
│   └── index.js          # contextBridge IPC API 노출
└── renderer/src/
    ├── App.jsx
    └── components/
        ├── TypeSelector.jsx   # 유형 선택 드롭다운
        ├── TimerDisplay.jsx   # 총 시간 + 현재 페이즈 시간
        ├── PhaseList.jsx      # 완료된 페이즈 목록
        └── Settings.jsx       # 단축키 설정 패널
```

---

## 설치 및 실행

### 사전 요구사항

- Node.js 18+
- Windows (글로벌 키훅은 Windows 기준)

### 설치

```bash
npm install
```

> `postinstall`에서 `electron-rebuild`가 자동 실행되어 `uiohook-napi` 네이티브 모듈을 빌드합니다.

### 개발 모드

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `out/` 디렉토리에 생성됩니다.

---

## 단축키

| 키 | 동작 |
|---|---|
| `F7` | 타이머 시작 |
| `F8` | 타이머 종료 + 결과 저장 |
| `ESC` | 페이즈 전환 (게임 실행 중에만 감지) |

단축키는 앱의 ⚙ 설정 패널에서 변경할 수 있습니다.

---

## 타임어택 유형 추가

`src/main/attackTypes.js`에 항목을 추가하면 됩니다.

```js
export const ATTACK_TYPES = [
  { id: 'full-run', label: '풀런' },
  { id: 'any-percent', label: 'Any%' },
  { id: 'low-percent', label: 'Low%' },
  { id: 'glitchless', label: 'Glitchless' },
  { id: 'my-category', label: '내 카테고리' }, // ← 추가
]
```

---

## IPC 채널 목록

| 채널 | 방향 | 설명 |
|---|---|---|
| `timer:start` | renderer → main | 선택 유형으로 타이머 시작 |
| `timer:stop` | renderer → main | 타이머 종료 |
| `timer:tick` | main → renderer | 현재 경과 시간 (100ms 주기) |
| `timer:phase` | main → renderer | 페이즈 전환 이벤트 |
| `timer:stopped` | main → renderer | 종료 완료 + 결과 데이터 |
| `hotkey:start-triggered` | main → renderer | 시작 단축키 눌림 |
| `hotkey:get` | renderer → main | 현재 단축키 조회 |
| `hotkey:set` | renderer → main | 단축키 변경 + 재등록 |
| `results:get` | renderer → main | 저장된 결과 조회 |
| `attackTypes:get` | renderer → main | 유형 목록 조회 |

---

## 주의사항

- `uiohook-napi`는 네이티브 모듈이므로 Electron 버전이 바뀌면 `npx electron-rebuild`를 재실행해야 합니다.
- `package.json`에 `"type": "module"`을 추가하면 preload가 `.mjs`로 빌드되어 로딩에 실패합니다. 추가하지 마세요.
- Windows에서 글로벌 훅은 관리자 권한 없이도 동작합니다.
