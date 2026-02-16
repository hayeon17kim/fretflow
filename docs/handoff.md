FretFlow 프로젝트 핸드오프 문서

**최종 업데이트: 2026-02-16**
**상태: MVP 완성 (마스터리/설정/오디오 구현 완료)**

---

## 1. 프로젝트 개요

FretFlow는 SM-2 스페이스드 리피티션 알고리즘을 기반으로 한 기타 음악 교육 모바일 앱입니다. 사용자가 기타 프렛보드의 음 위치, 인터벌, 스케일 패턴, 귀 훈련을 단계적으로 학습할 수 있도록 설계됨.

### 기술 스택

**Runtime**: Expo 54.0.33 (React Native 0.76.6)
**언어**: TypeScript 5.9 (strict mode)
**UI**: React Native (StyleSheet)
**라우팅**: Expo Router 6.0 (파일 기반)
**상태관리**: Zustand 5.0 (앱 전역 상태), React Query 5.90 (API)
**로컬저장소**: MMKV (react-native-mmkv 3.3)
**백엔드**: Supabase 2.95 (설정됨, 미통합)
**오디오**: expo-av (43개 WAV 파일)
**렌더링**: react-native-svg, react-native-reanimated 3.16
**i18n**: i18next 25.8, react-i18next 16.5, expo-localization 17.0
**린팅**: Biome 2.4 (import 정렬, 스타일 체크)
**타입체크**: TypeScript strict mode

---

## 2. 프로젝트 구조

```
src/
├── app/
│   ├── _layout.tsx           # 루트 레이아웃 (QueryClientProvider, StatusBar)
│   ├── (tabs)/
│   │   ├── _layout.tsx       # 탭 네비게이션 레이아웃
│   │   ├── index.tsx         # 홈 화면
│   │   ├── practice.tsx      # 연습 화면
│   │   ├── mastery.tsx       # 마스터리 탭 ✅ 완성
│   │   └── settings.tsx      # 설정 탭 ✅ 완성
│   ├── quiz/
│   │   ├── _layout.tsx       # 퀴즈 스택 레이아웃
│   │   ├── note.tsx          # Lv.1 음 위치 퀴즈
│   │   ├── interval.tsx      # Lv.2 인터벌 퀴즈
│   │   ├── scale.tsx         # Lv.3 스케일 퀴즈
│   │   └── ear.tsx           # Lv.4 귀 훈련
│
├── components/
│   ├── Fretboard.tsx         # 재사용 프렛보드 (TODO)
│   ├── TabIcon.tsx           # 탭 아이콘 ✅ 완성
│   ├── quiz/
│   │   ├── QuizHeader.tsx    # 퀴즈 헤더
│   │   ├── AnswerGrid.tsx    # 4지선다 그리드
│   │   └── QuizCard.tsx      # 퀴즈 카드 래퍼
│   ├── progress/
│   │   └── CircularProgress.tsx  # 원형 프로그레스
│   └── icons/                # 아이콘 컴포넌트
│
├── config/
│   ├── routes.ts             # 라우트 정의
│   └── levels.ts             # 레벨 설정
│
├── hooks/
│   └── useSpacedRepetition.ts  # SM-2 카드 관리 + 레벨 잠금
│
├── stores/
│   └── useAppStore.ts        # Zustand 전역 상태
│
├── types/
│   ├── music.ts              # 음악 타입 (NoteName, FretPosition 등)
│   └── quiz.ts               # 퀴즈 타입
│
├── utils/
│   ├── constants.ts          # 디자인 토큰 (색상, 간격, 폰트)
│   ├── music.ts              # 음 계산 유틸
│   ├── sm2.ts                # SM-2 알고리즘
│   ├── storage.ts            # MMKV 어댑터
│   └── cardGenerator.ts      # 동적 카드 생성 ✅ 완성
│
├── i18n/
│   ├── index.ts              # i18n 설정
│   └── locales/
│       ├── en.json           # 영어 번역
│       └── ko.json           # 한국어 번역
│
└── api/
    ├── query-client.ts       # React Query 설정
    └── supabase.ts           # Supabase 클라이언트 (미통합)
```

---

## 3. 디자인 레퍼런스

**위치**: `src/utils/constants.ts`

### 색상 팔레트

```typescript
COLORS = {
  bg: '#0D0D0F',              // 배경
  surface: '#1A1A1F',          // 카드, 패널
  border: '#2A2A30',           // 테두리
  textPrimary: '#FFFFFF',      // 기본 텍스트
  textSecondary: '#8E8E93',    // 보조 텍스트

  // 레벨별 색상
  level1: '#4ADE80',           // 초록 (음 위치)
  level2: '#A78BFA',           // 퍼플 (인터벌)
  level3: '#60A5FA',           // 블루 (스케일)
  level4: '#FB923C',           // 오렌지 (귀 훈련)

  // 상태 색상
  correct: '#4ADE80',
  wrong: '#F87171',
  selected: '#A78BFA',
}
```

### 간격 (Spacing)

```typescript
SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}
```

### 폰트 크기

```typescript
FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  title: 34,
}
```

### 프렛보드 설정

- 6현, 24프렛
- 표준 튜닝: E-B-G-D-A-E (저음→고음)
- 인레이 마커: 3, 5, 7, 9, 12, 15, 17, 19, 21, 24 프렛
- 더블 마커: 12, 24 프렛

---

## 4. 아키텍처 결정사항

### 라우팅

- **Expo Router (file-based)**: `src/app/` 디렉토리가 자동으로 라우트 생성
- **탭 네비게이션**: `(tabs)` 그룹으로 동시 스택 유지
- **퀴즈 라우트**: `/quiz/note`, `/quiz/interval`, `/quiz/scale`, `/quiz/ear`

### 상태관리

**Zustand (useAppStore)**:
- 활성 레벨
- 오늘의 통계 (카드 복습 수, 정답수, 연속일수)
- 온보딩 상태

**React Query**:
- Supabase 통합 시 사용 예정 (현재 미사용)

**MMKV 로컬 저장소**:
- flashcards ID로 모든 카드 데이터 저장
- 개발/웹 환경에서는 인메모리 폴백

### 스페이스드 리피티션

**SM-2 알고리즘 (`sm2.ts`)**:
- quality 0-5 기반으로 EF(ease factor), interval 계산
- quality < 3이면 리셋 (repetitions=0)
- quality ≥ 3이면 간격 1 → 6 → interval*EF

**카드 훅 (`useSpacedRepetition.ts`)**:
- `getDueCards()`: 오늘 복습할 카드 필터링
- `addCard()`: 새 카드 추가 (기본값: EF=2.5, interval=1, nextReviewDate=today)
- `recordReview()`: 리뷰 결과 기록 (responseTimeMs 기반 quality 매핑)
- `isLevelLocked()`: 레벨 잠금 시스템 (이전 레벨 80% 달성 필요)

**기본값**:
- 초기 EF: 2.5
- 최소 EF: 1.3
- 초기 interval: 1일

### 카드 생성

**동적 카드 생성 (`cardGenerator.ts`, 242 lines)**:

```typescript
generateNoteCard()      // Lv.1: 랜덤 프렛 위치 + 4지선다
generateIntervalCard()  // Lv.2: 루트 위치 + 인터벌 패턴
generateScaleCard()     // Lv.3: 스케일 패턴 + 위치들
generateEarCard()       // Lv.4: 오디오 음 (개방현)
generateCardBatch()     // 배치 생성 (세션 크기만큼)
```

**MOCK_QUESTIONS 완전 제거됨** - 모든 퀴즈 화면이 동적 생성 사용

---

## 5. 완성된 기능

### 화면 (완성)

**홈 (`/(tabs)/index.tsx`)**
- 오늘 복습 수 & 예상 시간
- 연속일수 (스트릭)
- 레벨별 진도율 (원형 프로그레스)
- 레벨별 카드 펼침 + 직접 퀴즈 이동

**연습 (`/(tabs)/practice.tsx`)**
- 레벨별 카드로 펼침 (expand/collapse)
- 예시 문제 표시
- 세션 옵션 버튼 (퀵/포커스/딥)

**마스터리 (`/(tabs)/mastery.tsx`) ✅ 완성 (382 lines)**
- 전체 통계 카드 (전체/마스터/약점 카드 수)
- 레벨별 마스터리 그리드 (원형 프로그레스)
- 약점 카드 섹션 (레벨별 분류)
- i18n 지원 및 접근성 라벨

**설정 (`/(tabs)/settings.tsx`) ✅ 완성 (580 lines)**
- 프로필 섹션 (사용자명, 아바타 편집)
- 학습 목표 설정 (일일 목표: 10/20/30/50 카드)
- 접근성 옵션 (언어 선택: 한/영, 진동 토글)
- 앱 정보 (버전, 라이선스, 개발자)

**퀴즈 - 음 위치 (`/quiz/note.tsx`)**
- 미니 프렛보드 (4프렛 윈도우, 읽기 전용)
- 4지선다 그리드
- 정답/오답 피드백 + 다음 버튼
- 동적 카드 생성 (cardGenerator.ts)

**퀴즈 - 인터벌 (`/quiz/interval.tsx`)**
- 탭 가능한 프렛보드 (루트 음 표시, 선택 음 표시)
- 패턴 팁 (오답/정답 후 표시)
- 확인 버튼 (선택 후 활성화)
- 동적 카드 생성 (cardGenerator.ts)

**퀴즈 - 스케일 (`/quiz/scale.tsx`)**
- 다중선택 프렛보드
- 실시간 선택/해제 UI
- 점수 계산 (정답수/오답수/누락수)
- 80% 이상 통과 판정
- 동적 카드 생성 (cardGenerator.ts)

**퀴즈 - 귀 훈련 (`/quiz/ear.tsx`) ✅ 오디오 완성**
- 재생 버튼 (43개 WAV 오디오 파일, `assets/sounds/`)
- 4지선다 + 결과 피드백
- 잠금 해제 힌트 (Lv.1 80% 달성 시)
- 동적 카드 생성 (cardGenerator.ts)

### 컴포넌트 (완성)

- **QuizHeader**: 뒤로, 레벨 배지, 진도바
- **AnswerGrid**: 4지선다 그리드
- **NextButton**: 정답(초록)/오답(회색) 스타일
- **QuizCard**: 상태별 테두리 색상
- **CircularProgress**: 원형 프로그레스 표시
- **TabIcon**: 탭 아이콘 컴포넌트 ✅

### 유틸 & 훅

- **useSpacedRepetition**: SM-2 카드 로직 + 레벨 잠금 시스템
- **sm2.ts**: 알고리즘 계산
- **music.ts**: 음 계산 (MIDI, 위치 찾기 등)
- **constants.ts**: 모든 디자인 토큰
- **cardGenerator.ts**: 동적 카드 생성 (242 lines) ✅

### 라우팅

- 탭 네비게이션 (홈/연습/마스터리/설정)
- 퀴즈 스택 (4개 레벨별)

---

## 6. 남은 작업 상세

### 미완성 컴포넌트

**Fretboard.tsx (재사용 프렛보드)**
- 현재 각 퀴즈 화면에 프렛보드 코드 중복
- 재사용 가능한 통합 컴포넌트 필요

### 미구현 기능

**Supabase 백엔드 통합**
- 클라이언트 설정만 있음 (`api/supabase.ts`)
- 필요 기능:
  - 사용자 인증 (회원가입/로그인)
  - 카드 클라우드 동기화
  - 학습 통계 백업
  - 기기 간 데이터 이전

**Push Notifications**
- 일일 복습 리마인더
- 스트릭 유지 알림
- expo-notifications 통합 필요

**Achievement 시스템**
- 배지 및 마일스톤
- 7일/30일/100일 스트릭 보상
- 레벨별 마스터 배지

**Mix 모드**
- 현재 홈 화면의 "복습 시작" CTA는 항상 note 퀴즈로만 이동
- due 카드가 있는 모든 레벨을 섞어서 출제하는 기능 필요

---

## 7. 핵심 규칙 & 규약

### UI 언어

- **모든 UI 텍스트**: 한글 (사용자 대면)
- **변수명, 함수명, 주석**: 영문 (코드 가독성)

### 디자인 토큰 사용

- **색상/간격/폰트**: 반드시 `COLORS`, `SPACING`, `FONT_SIZE`에서 참조
- **하드코딩된 값 금지**: 일관성 확보

### Biome 린팅

```bash
npm run lint          # 체크 전용
npm run lint:fix      # 자동 수정
npm run format        # 포매팅
```

**규칙**:
- import 정렬 (organize)
- 세미콜론 필수
- trailing commas
- 라인 너비: 100자
- 탭 너비: 2자

### StyleSheet 패턴

```typescript
const s = StyleSheet.create({
  /* 모든 스타일 */
});
```

모든 스타일은 하단에 `s` 네임스페이스로 집계

### 컴포넌트 패턴

```typescript
export default function QuizScreen() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<QuizState>('question');

  // 컴포넌트 로직

  return (
    <View style={s.container}>
      {/* JSX */}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
```

### SM-2 기본값

- 초기 EF: 2.5
- 최소 EF: 1.3
- 초기 interval: 1일

---

## 8. 개발 명령어

### 설치 & 실행

```bash
npm install
npm start             # Expo 개발 서버 시작
npm run android       # Android 에뮬레이터
npm run ios           # iOS 시뮬레이터
npm run web           # 웹 브라우저
```

### 품질 관리

```bash
npm run lint          # Biome 린트 체크
npm run lint:fix      # 자동 수정
npm run format        # 포매팅
npm run typecheck     # TypeScript 타입 체크
```

---

## 9. 주요 파일별 책임

| 파일 | 책임 |
|------|------|
| `app/_layout.tsx` | QueryClient 초기화, 상태바 스타일 |
| `app/(tabs)/_layout.tsx` | 탭 네비게이션 구조 |
| `app/(tabs)/index.tsx` | 홈 화면: 복습 카드, 레벨별 진도 |
| `app/(tabs)/practice.tsx` | 연습 화면: 레벨별 세션 |
| `app/(tabs)/mastery.tsx` | 마스터리 화면: 통계, 약점 분석 ✅ |
| `app/(tabs)/settings.tsx` | 설정 화면: 프로필, 학습 목표, 접근성 ✅ |
| `app/quiz/*.tsx` | 각 레벨 퀴즈 (음/인터벌/스케일/귀) |
| `hooks/useSpacedRepetition.ts` | SM-2 카드 CRUD & 리뷰 로직 |
| `stores/useAppStore.ts` | 전역 상태 (레벨, 통계) |
| `utils/constants.ts` | 모든 디자인 토큰 |
| `utils/music.ts` | 음 계산 (MIDI, 위치, 인터벌) |
| `utils/sm2.ts` | SM-2 알고리즘 |
| `utils/storage.ts` | MMKV 어댑터 |
| `utils/cardGenerator.ts` | 동적 카드 생성 ✅ |
| `types/music.ts` | 타입 정의 |
| `types/quiz.ts` | 퀴즈 타입 |
| `components/quiz/*.tsx` | 퀴즈 재사용 컴포넌트 |
| `i18n/` | 국제화 설정 |

---

## 10. 다음 단계 (신입 개발자용 체크리스트)

### Phase 1: 환경 이해

- [ ] 코드베이스 전체 읽기 (특히 홈/연습/마스터리/설정 화면, 퀴즈 구조)
- [ ] Expo Router 문서 (탭/스택) 읽기
- [ ] SM-2 알고리즘 이해 (`sm2.ts` + `useSpacedRepetition.ts`)
- [ ] `npm run lint` / `npm run typecheck` 실행 확인
- [ ] cardGenerator.ts 동적 카드 생성 로직 이해

### Phase 2: Supabase 백엔드 통합

- [ ] Supabase 테이블 설계 (users, flashcards, reviews)
- [ ] 사용자 인증 구현 (회원가입/로그인)
- [ ] React Query 쿼리 작성 (GET /cards, POST /review)
- [ ] 카드 클라우드 동기화
- [ ] 기기 간 데이터 이전

### Phase 3: 리텐션 기능

- [ ] Push Notifications (expo-notifications 통합)
- [ ] 일일 복습 리마인더
- [ ] 스트릭 유지 알림

### Phase 4: 확장 기능

- [ ] Mix 모드 구현 (복습 시작 시 모든 레벨 섞기)
- [ ] Achievement 시스템 (배지, 마일스톤)
- [ ] 재사용 가능한 Fretboard 컴포넌트 (중복 제거)

---

## 11. 개발 팁

### 프렛보드 좌표 변환

```typescript
// SVG 좌표
const cx = padX + (fret - startFret) * fretW;
const cy = padY + string * stringH;
```

### 카드 생성

- `cardGenerator.ts`의 `generateCardBatch()` 사용
- 세션 크기(10문제)만큼 자동 생성
- 기존 구조 유지

### 스타일 추가 시

- 숫자값 → `SPACING`, `FONT_SIZE` 참조
- 색상 → `COLORS` 참조
- `StyleSheet.create({ ... })` 내부에만 정의

### i18n 추가

- `i18n/locales/en.json`, `ko.json`에 키 추가
- 컴포넌트에서 `useTranslation()` 훅 사용

---

## 12. Troubleshooting

### MMKV not loading
`utils/storage.ts` - 자동으로 인메모리 폴백됨

### Navigation issues
`app/` 파일 구조가 라우트 기대값과 일치하는지 확인. `expo-router` CLI로 디버깅.

### Type errors
`npm run typecheck`로 모든 에러 확인. Biome 린팅은 일부 TS 이슈를 놓칠 수 있음.

### i18n not working
`i18n/index.ts`가 `app/_layout.tsx`에서 초기화되었는지 확인.

---

**최종 업데이트**: 2026-02-16
**상태**: MVP 완성 (마스터리/설정/오디오/동적 카드 생성 완료)
**V5.2 와이어프레임 기준 준수**
**한글 UI + 영문 코드**

더 자세한 개발 가이드는 `DEVELOPMENT.md` 참조.
