FretFlow 프로젝트 핸드오프 문서

1. 프로젝트 개요
   FretFlow는 SM-2 스페이스드 리피티션 알고리즘을 기반으로 한 기타 음악 교육 모바일 앱입니다. 사용자가 기타 프렛보드의 음 위치, 인터벌, 스케일 패턴, 귀 훈련을 단계적으로 학습할 수 있도록 설계됨.
   기술 스택

Runtime: Expo 54.0.33 (React Native 0.81.5)
언어: TypeScript 5.9
UI: React Native (StyleSheet)
라우팅: Expo Router 6.0
상태관리: Zustand 5.0 (앱 전역 상태), React Query 5.90 (API)
로컬저장소: MMKV (react-native-mmkv 4.1)
백엔드: Supabase (미통합)
렌더링: react-native-svg, react-native-reanimated
린팅: Biome 2.4 (import 정렬, 스타일 체크)
타입체크: TypeScript strict mode

2. 프로젝트 구조
   src/
   ├── app/
   │ ├── \_layout.tsx # 루트 레이아웃 (QueryClientProvider, StatusBar)
   │ ├── (tabs)/
   │ │ ├── \_layout.tsx # 탭 네비게이션 레이아웃 (홈/연습/마스터리/설정)
   │ │ ├── index.tsx # 홈 화면 (복습 카드 수, 레벨별 진도율, CTA)
   │ │ ├── practice.tsx # 연습 화면 (레벨별 카드 펼침, 세션 옵션)
   │ │ ├── mastery.tsx # 마스터리 탭 (미구현)
   │ │ └── settings.tsx # 설정 탭 (미구현)
   │ ├── quiz/
   │ │ ├── \_layout.tsx # 퀴즈 스택 레이아웃 (슬라이드 애니)
   │ │ ├── note.tsx # Lv.1 음 위치 퀴즈 (미니 프렛보드 + 4지선다)
   │ │ ├── interval.tsx # Lv.2 인터벌 퀴즈 (탭 프렛보드 + 패턴 팁)
   │ │ ├── scale.tsx # Lv.3 스케일 퀴즈 (다중선택 프렛보드)
   │ │ └── ear.tsx # Lv.4 귀 훈련 (기초 모드 - 개방현 5음)
   │
   ├── components/
   │ ├── TabIcon.tsx # 탭 바 아이콘 (미구현)
   │ ├── Fretboard.tsx # 재사용 가능한 프렛보드 (미구현)
   │ └── quiz/
   │ ├── QuizHeader.tsx # 퀴즈 헤더 (뒤로, 레벨 배지, 진도바)
   │ ├── AnswerGrid.tsx # 4지선다 그리드 + 다음 버튼
   │ └── QuizCard.tsx # 퀴즈 카드 기본 래퍼
   │
   ├── hooks/
   │ └── useSpacedRepetition.ts # SM-2 카드 관리 (MMKV 기반)
   │
   ├── stores/
   │ └── useAppStore.ts # Zustand 전역 상태 (activeLevel, todayStats)
   │
   ├── types/
   │ └── music.ts # 음악 타입 정의 (NoteName, FretPosition, FlashCard 등)
   │
   ├── utils/
   │ ├── constants.ts # 디자인 토큰 (색상, 간격, 폰트 크기, 프렛보드 설정)
   │ ├── music.ts # 음 계산 유틸 (getNoteAtPosition, getInterval 등)
   │ ├── sm2.ts # SM-2 알고리즘 구현
   │ └── storage.ts # MMKV 어댑터 (인메모리 폴백)
   │
   ├── api/
   │ ├── query-client.ts # React Query 설정 (미사용 상태)
   │ └── supabase.ts # Supabase 클라이언트 (미통합)
   │
   ├── env.ts # 환경변수 (미구현)
   ├── App.tsx # 레거시 Expo entry (미사용)
   └── index.ts # Expo Router entry point
   추가 파일

package.json: 의존성, npm 스크립트
tsconfig.json: TypeScript 설정 (경로 alias @/_ → ./src/_)
biome.json: 린팅 & 포매팅 규칙
app.json: Expo 앱 설정 (앱 이름, 버전 등)

3. 디자인 레퍼런스
   위치: src/utils/constants.ts (Wireframe V5.2 기준)
   색상 팔레트

배경: #0D0D0F (bg), #1A1A1F (surface)
테두리/텍스트: #2A2A30 (border), #FFFFFF (textPrimary), #8E8E93 (textSecondary)
레벨별 색상:

Lv.1 (음 위치): #4ADE80 (초록)
Lv.2 (인터벌): #A78BFA (퍼플)
Lv.3 (스케일): #60A5FA (블루)
Lv.4 (귀 훈련): #FB923C (오렌지)

상태색: #4ADE80 (correct), #F87171 (wrong), #A78BFA (selected)

간격 (Spacing)

xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32

폰트 크기

xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 28, title: 34

프렛보드 설정

6현, 24프렛, 표준 튜닝 (E-B-G-D-A-E)
인레이 마커: 3, 5, 7, 9, 12, 15, 17, 19, 21, 24 프렛
더블 마커: 12, 24 프렛

4. 아키텍처 결정사항
   라우팅

Expo Router (file-based): src/app/ 디렉토리가 자동으로 라우트 생성
탭 네비게이션: (tabs) 그룹으로 감싸서 동시 스택 유지
퀴즈 선택지별 별도 라우트 (/quiz/note, /quiz/interval 등)

상태관리

Zustand (useAppStore):

활성 레벨, 오늘의 통계 (카드 복습 수, 정답수, 연속일수)
온보딩 상태

React Query: Supabase 통합 시 사용 예정 (현재 미사용)
로컬: MMKV에 flashcards ID로 모든 카드 데이터 저장

스페이스드 리피티션

SM-2 알고리즘 (SM-2.ts):

quality 0-5 기반으로 EF(ease factor), interval 계산
quality < 3이면 리셋 (repetitions=0)
quality ≥ 3이면 간격 1 → 6 → interval\*EF

카드 훅 (useSpacedRepetition.ts):

getDueCards(): 오늘 복습할 카드 필터링
addCard(): 새 카드 추가 (기본값: EF=2.5, interval=1, nextReviewDate=today)
recordReview(): 리뷰 결과 기록 (responseTimeMs 기반 quality 매핑)

저장소 (Storage)

MMKV 로드 실패 시 인메모리 폴백 (개발/웹 환경)
appStorage, cardStorage, authStorage 3개 인스턴스
Supabase auth 어댑터 있음 (미사용)

타입 안정성

music.ts: NoteName (12음), StringNumber (1-6), FretPosition, ScaleName, FlashCard 등
모든 화면은 TypeScript strict mode + Biome linting

5. 완성된 기능
   화면 (완성)

홈 (/(tabs)/index.tsx)

오늘 복습 수 & 예상 시간
연속일수 (스트릭)
레벨별 진도율 (원형 프로그레스)
레벨별 카드 펼침 + 직접 퀴즈 이동

연습 (/(tabs)/practice.tsx)

레벨별 카드로 펼침 (expand/collapse)
예시 문제 표시
세션 옵션 버튼 (퀵/포커스/딥)

퀴즈 - 음 위치 (/quiz/note.tsx)

미니 프렛보드 (4프렛 윈도우, 읽기 전용)
4지선다 그리드
정답/오답 피드백 + 다음 버튼

퀴즈 - 인터벌 (/quiz/interval.tsx)

탭 가능한 프렛보드 (루트 음 표시, 선택 음 표시)
패턴 팁 (오답/정답 후 표시)
확인 버튼 (선택 후 활성화)

퀴즈 - 스케일 (/quiz/scale.tsx)

다중선택 프렛보드
실시간 선택/해제 UI
점수 계산 (정답수/오답수/누락수)
80% 이상 통과 판정

�이즈 - 귀 훈련 (/quiz/ear.tsx)

재생 버튼 (기초 모드: 개방현 5음)
4지선다 + 결과 피드백
잠금 해제 힌트 (Lv.1 80% 달성 시)

컴포넌트 (완성)

QuizHeader: 뒤로, 레벨 배지, 진도바
AnswerGrid: 4지선다 그리드
NextButton: 정답(초록)/오답(회색) 스타일
QuizCard: 상태별 테두리 색상

유틸 & 훅

useSpacedRepetition: SM-2 카드 로직
sm2.ts: 알고리즘 계산
music.ts: 음 계산 (MIDI, 위치 찾기 등)
constants.ts: 모든 디자인 토큰

라우팅

탭 네비게이션 (홈/연습)
퀴즈 스택 (4개 레벨별)

6. 남은 작업 상세
   미완성 화면

마스터리 (/(tabs)/mastery.tsx) - 미구현

마스터된 카드 통계
학습 진도 차트
약점 분석

설정 (/(tabs)/settings.tsx) - 미구현

프로필 (사용자명, 프로필 사진)
학습 목표 설정
접근성 옵션

미완성 컴포넌트

Fretboard.tsx (재사용 프렛보드) - 스켈레톤만 있음
TabIcon.tsx (탭 아이콘) - 스켈레톤만 있음

미구현 기능

음성 재생

expo-av 설치되어 있지만 구현 안 됨
귀 훈련에서 실제 음성 재생 필요

Supabase 통합

클라이언트 설정만 있음 (api/supabase.ts)
사용자 인증 (회원가입/로그인)
카드 동기화
학습 통계 백업

카드 생성

현재 모든 퀴즈가 모의 데이터 (MOCK_QUESTIONS)
실제 카드 생성 로직 필요
사용자 커스텀 카드

레벨별 락 시스템

Lv.2 이상: Lv.1 80% 달성 시 해금
Lv.3, Lv.4: 각각 전 레벨 조건

통계 & 분석

시간대별 학습 패턴
약점 노트 분석
진도 차트

알림

일일 복습 리마인더
스트릭 유지 알림

마이그레이션 필요

모든 MOCK_QUESTIONS 제거
실제 카드 DB 구조 확립
API 경로 (GET /cards, POST /review 등)

7. 핵심 규칙 & 규약
   UI 언어

모든 UI 텍스트는 한글 (사용자 대면)
변수명, 함수명, 주석은 한글/영문 섞임 (코드 가독성)

디자인 토큰 사용

색상/간격/폰트는 반드시 COLORS, SPACING, FONT_SIZE에서 참조
하드코딩된 값 금지

Biome 린팅

npm run lint (체크 전용)
npm run lint:fix (자동 수정)
npm run format (포매팅)
import 정렬 (organize), 세미콜론 필수, trailing commas

모의 데이터 패턴
모든 퀴즈 화면은 다음 구조 사용:
typescriptconst MOCK_QUESTIONS = [
{ /* 문제 객체 */ },
// ...
];

export default function QuizScreen() {
const [currentIdx, setCurrentIdx] = useState(0);
const [state, setState] = useState<QuizState>('question');

const q = MOCK_QUESTIONS[currentIdx];
// ...
}
StyleSheet 패턴
typescriptconst s = StyleSheet.create({ /_ 모든 스타일 _/ });
모든 스타일은 하단에 s 네임스페이스로 집계
SM-2 기본값

초기 EF: 2.5
최소 EF: 1.3
초기 interval: 1일

환경 설정

.env.example 있음 (미사용)
src/env.ts 스켈레톤 있음

8. 개발 명령어
   설치 & 실행
   bashnpm install
   npm start # Expo 개발 서버 시작
   npm run android # Android 에뮬레이터
   npm run ios # iOS 시뮬레이터
   npm run web # 웹 브라우저
   품질 관리
   bashnpm run lint # Biome 린트 체크
   npm run lint:fix # 자동 수정
   npm run format # 포매팅
   npm run typecheck # TypeScript 타입 체크
   린트 규칙 주요 항목

noExplicitAny: warn (any 타입 자제)
noArrayIndexKey: off (React 리스트 키로 인덱스 허용)
noNonNullAssertion: warn (non-null assertion 자제)
라인 너비: 100자
탭 너비: 2자

9. 주요 파일별 책임
   파일책임src/app/\_layout.tsxQueryClient 초기화, 상태바 스타일src/app/(tabs)/\_layout.tsx탭 네비게이션 구조src/app/(tabs)/index.tsx홈 화면: 복습 카드, 레벨별 진도src/app/(tabs)/practice.tsx연습 화면: 레벨별 세션src/app/quiz/_.tsx각 레벨 퀴즈 (음/인터벌/스케일/귀)src/hooks/useSpacedRepetition.tsSM-2 카드 CRUD & 리뷰 로직src/stores/useAppStore.ts전역 상태 (레벨, 통계)src/utils/constants.ts모든 디자인 토큰src/utils/music.ts음 계산 (MIDI, 위치, 인터벌)src/utils/sm2.tsSM-2 알고리즘src/utils/storage.tsMMKV 어댑터src/types/music.ts타입 정의src/components/quiz/_.tsx퀴즈 재사용 컴포넌트

10. 다음 단계 (신입 개발자용 체크리스트)
    Phase 1: 환경 이해

코드베이스 전체 읽기 (특히 홈/연습 화면, 퀴즈 구조)
Expo Router 문서 (탭/스택) 읽기
SM-2 알고리즘 이해 (sm2.ts + useSpacedRepetition.ts)
npm run lint / npm run typecheck 실행 확인

Phase 2: 카드 데이터 구조화

Supabase 테이블 설계 (users, flashcards, reviews)
MOCK_QUESTIONS 제거 및 실제 카드 API 호출로 대체
React Query 쿼리 작성 (GET /cards, POST /review)

Phase 3: 음성 재생 구현

expo-av 통합
각 음(E, A, D, G, B)의 오디오 파일 추가
QuizEarScreen 음성 재생 로직 구현

Phase 4: 레벨 잠금 시스템

Lv.2+의 조건 검사 로직
진도 달성 시 해금 알림

11. 개발 팁
    프렛보드 좌표 변환
    typescript// SVG 좌표
    const cx = padX + (fret - startFret) _ fretW;
    const cy = padY + string _ stringH;
    모의 데이터 추가

MOCK_QUESTIONS 배열에 객체 추가
기존 구조 유지 (question, answer, options 등)
상태 변경 없음

스타일 추가 시

숫자값 → SPACING, FONT_SIZE 참조
색상 → COLORS 참조
StyleSheet.create({ ... }) 내부에만 정의

최종 업데이트: 2026-02-16
V5.2 기준 와이어프레임 준수
한글 UI + 영문 코드
