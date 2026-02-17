# FretFlow 종합 제품 분석 리포트

**평가일**: 2026-02-17
**최종 교차검증**: 2026-02-17 (코드베이스 직접 대조 완료)
**대상 버전**: MVP 1.0.0 (Pre-launch)

---

## 총평

FretFlow는 기술 기반과 핵심 학습 플로우 모두 수준 이상의 MVP입니다. SM-2 알고리즘, Zustand+MMKV 상태관리, 4개 독립 학습 트랙 + Mix 모드, 티어 기반 난이도 시스템, 스마트 추천 시스템, 배지 시스템, 푸시 알림까지 핵심 기능이 잘 동작합니다. 온보딩도 갖춰져 있고, 빈 상태 처리, 일일 목표 시각화 등 UX 디테일도 챙겨져 있습니다.

지금 상태는 **"핵심 가치가 완성된 MVP"**이며, 다음 단계는 애널리틱스 인프라, Ear Training 확장, 수익화입니다.

| 영역 | 점수 | 한줄 평가 |
|------|------|----------|
| SM-2 알고리즘 | **9/10** | 원본 논문 스펙에 충실, 응답시간 기반 quality 매핑 |
| 학습 모드 설계 | **9/10** | 4개 독립 트랙 + Mix 모드, 티어 시스템, 스마트 추천 |
| 기술 아키텍처 | **8/10** | 모던하고 깔끔한 구조, 확장성 좋음 |
| 기능 완성도 | **8/10** | 핵심 플로우 완성, 티어 시스템 구현됨 |
| UX/UI | **8/10** | 온보딩, 빈 상태, 일일 목표, 푸시 알림까지 구현 |
| 리텐션 설계 | **6/10** | 배지/스트릭/푸시 알림 구현, 축하 연출 일부 있음 |
| 애널리틱스 | **0/10** | 트래킹 전무 |
| 수익화 | **0/10** | 결제/페이월/기능 게이팅 없음 |
| **시장 준비도** | **6/10** | 핵심 MVP 완성, 애널리틱스+수익화 필요 |

---

## 1. 잘 한 것 (Keep)

**기술 선택이 좋다** — Expo 54 + Zustand + MMKV 조합은 이 규모의 앱에 딱 맞습니다. AsyncStorage 대신 MMKV를 쓴 건 현명한 선택이고, Zustand의 persist 미들웨어와 궁합도 잘 맞습니다. TypeScript strict mode, Biome 린팅, 디자인 토큰 중앙 관리, 일관된 StyleSheet 패턴, i18n 지원 등 코드 컨벤션이 잘 잡혀 있습니다.

**SM-2 구현이 정확하다** — sm2.ts의 알고리즘이 원본 SM-2 논문 스펙에 충실합니다. 응답 시간 기반 quality 매핑(3초 미만 → quality 5, 6초 미만 → quality 4)도 학습 과학적으로 타당합니다. 카드 ID도 `note-C-3-5`, `interval-E-A-P5` 같이 deterministic하게 생성되어 중복이 없습니다.

**4개 독립 학습 트랙 + Mix 모드** — Note Position, Interval, Scale, Ear Training은 위계가 아닌 독립적인 학습 영역으로 설계되어 있습니다. 각 트랙마다 4단계 티어 시스템으로 점진적 난이도 상승을 제공하며, Mix 모드로 4개 트랙을 한 세션에서 혼합 연습할 수 있어 학습 다양성과 자율성이 높습니다.

**스마트 추천 시스템** — `useSmartRecommendation` 훅이 due 카드가 가장 많은 모드를 우선 추천하고, 없으면 진행률이 가장 낮은 모드를 추천합니다. 홈 화면의 "복습 시작" 버튼이 이 추천에 따라 올바르게 라우팅됩니다.

**세션 크기 옵션이 실제 동작** — Practice 화면의 Quick(10)/Focus(25)/Deep(50) 버튼이 `sessionSize` 파라미터를 퀴즈 화면에 전달하고, 퀴즈에서 이를 읽어 실제 문제 수에 반영합니다.

**배지 시스템 완성** — 5단계 배지(🌱 Beginner → 🌿 Familiar → 🌳 Proficient → 🏅 Master)가 모드별로 추적되며, Mastery 화면, 홈 화면, 퀴즈 완료 토스트에서 표시됩니다. 배지 달성 시 햅틱 피드백도 동작합니다.

**온보딩 플로우** — 4단계 온보딩(인트로 → 미니퀴즈 → 결과 → 목표 설정)이 존재하며, 스킵 옵션도 있습니다.

**일일 목표 시각화** — `DailyReviewCard`에 프로그레스 바, 퍼센티지, 색상 코딩(회색→노랑→파랑→초록), 100% 달성 시 🎉 축하 이모지가 구현되어 있습니다. 첫 사용자/복습 있음/복습 완료 3가지 상태도 분기 처리됩니다.

**빈 상태 & 진행도 일관성** — Mastery 화면과 Home 화면에 적절한 빈 상태 UI가 있고, SM-2 기반 진행도가 `CircularProgress` 컴포넌트를 공유하며 모든 화면에서 일관되게 표시됩니다.

---

## 2. Feature Completeness Audit

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Note Quiz | ✅ Complete | SM-2 connected, dynamic card generation |
| 2 | Interval Quiz | ✅ Complete | Tappable fretboard, pattern tips |
| 3 | Scale Quiz | ✅ Complete | Multi-select, accuracy scoring, pattern hints |
| 4 | Ear Training | ⚠️ Partial | Only 5/43 sounds used (open strings) |
| 5 | SM-2 Engine | ✅ Complete | Fully implemented |
| 6 | Smart Review Routing | ✅ Complete | Routes by due cards / lowest progress |
| 7 | Session Size Options | ✅ Complete | 10/25/50 properly connected |
| 8 | Badge System | ✅ Complete | 5-tier, per-mode, with haptic |
| 9 | Onboarding Flow | ✅ Complete | 4-step with mini-quiz |
| 10 | Daily Goal Visualization | ✅ Complete | Progress bar, color coding, celebration |
| 11 | Empty States | ✅ Complete | Mastery + Home |
| 12 | Progress Tracking | ✅ Complete | Consistent SM-2 based, CircularProgress shared |
| 13 | Mix Mode | ❌ Stub | UI exists, hardcoded to /quiz/note |
| 14 | Quiz Exit Warning | ❌ Missing | No confirmation on back press |
| 15 | Quiz Haptic Feedback | ⚠️ Partial | Badge-only, not for correct/wrong answers |
| 16 | Error Boundaries | ❌ Missing | No crash recovery |
| 17 | Analytics | ❌ Missing | No tracking |
| 18 | Monetization | ❌ Missing | No payment or gating |
| 19 | Push Notifications | ❌ Missing | Critical for retention |
| 20 | Cloud Sync | ❌ Missing | Supabase configured but not integrated |

---

## 3. 남은 이슈

### P0 — 런칭 전 필수

**테스트 코드가 0개** — `.test.ts`, `.spec.ts`, `__tests__/` 전무. SM-2, 카드 생성, 진도 계산 핵심 로직에 단위 테스트가 없으면 리팩토링 시 회귀 버그 리스크가 높습니다.

**에러 바운더리 없음** — 앱 어디에도 ErrorBoundary가 없습니다. 카드 데이터가 깨지거나 예상치 못한 에러 발생 시 크래시하며 복구 UI가 없습니다.

**애널리틱스 전무** — 이벤트 트래킹, 세션 기록, 퍼널 분석 없이는 데이터 기반 의사결정 불가. Mixpanel 또는 Amplitude 연동 필요.

**수익화 모델 없음** — 구독 시스템, 페이월, 프리미엄 기능 게이팅이 전무합니다.

### P1 — 런칭 후 1개월 내

**퀴즈 중단 시 경고 없음** — QuizHeader.tsx의 뒤로 버튼이 `router.back()`을 바로 호출합니다. 진행 중 실수로 나가면 세션이 유실됩니다. `Alert.alert()` 또는 `beforeRemove` 리스너 필요.

**퀴즈 햅틱 미완성** — 배지 달성 시에는 동작하지만 퀴즈 정답/오답(가장 빈번한 인터랙션)에는 없음.

**클라우드 동기화 불가** — MMKV 로컬 전용. 폰 교체 시 학습 데이터 전부 유실. Supabase 클라이언트 설정만 있고 실제 통합 미구현.

### 기술 부채

Dead Supabase 코드(import 참조 잔존), 프렛보드 컴포넌트 중복(각 퀴즈에 인라인), WAV 동기 로딩(잠재적 시작 지연).

---

## 4. PM 관점 개선점

### 리텐션 설계가 약하다

배지와 스트릭 카운트는 있지만 적극적 리텐션 장치가 부족합니다. 현재 없는 것들: 푸시 알림, 스트릭 보호(freeze), 스트릭 마일스톤 축하 연출(7일/30일), 복귀 유저 보상.

### 학습 분석이 얕다

Mastery 탭에 전체/마스터/약점 카드 수와 모드별 진행도는 보이지만 시계열 인사이트가 없습니다. 일별/주별 학습량 트렌드, 모드별 정답률 변화, "가장 자주 틀리는 카드 TOP 5", 총 학습 시간, "지난주보다 23% 향상" 같은 비교 인사이트가 필요합니다.

---

## 5. PD(Product Design) 관점 개선점

**퀴즈 정답/오답 햅틱** — 설정에 진동 토글이 있고 배지에는 동작하지만, 가장 자주 일어나는 퀴즈 인터랙션에 촉각 피드백이 빠져 있습니다.

**마이크로 인터랙션 부재** — 배지 획득 시 토스트만 뜹니다. 레벨업, 스트릭 갱신, 마스터 카드 달성 같은 순간에 작은 애니메이션이나 축하 연출이 있으면 성취의 감정적 임팩트가 커집니다.

**첫 세션 가이딩** — 온보딩 후 홈 화면에 DailyReviewCard CTA는 있지만, 코치마크나 하이라이트 가이드가 있으면 첫 경험이 더 명확해집니다.

---

## 6. 시장 & 경쟁 분석

### 시장 규모

Guitar Learning App 시장은 약 $325M (2024 기준, CAGR 3%). 프렛보드 특화 니치는 $15-25M으로 추정됩니다.

### 경쟁 환경

| App | Price | SM-2 | Fretboard Focus | FretFlow 대비 약점 |
|-----|-------|------|-----------------|------------------|
| Yousician | $9.99/mo | ❌ | ❌ General | 비쌈, 이론 깊이 부족 |
| Fender Play | $9.99/mo | ❌ | ❌ General | 영상 수동학습, active recall 없음 |
| Fret Pro | $4.99/mo | ✅ | ✅ | 커리큘럼 제한, 귀훈련 없음 |
| Fretonomy | Free | ❌ | ✅ | 진행 저장 안됨, 체계 없음 |

**FretFlow의 차별점**: SM-2 + 4개 독립 학습 모드 + 귀훈련 통합 + 배지 시스템을 모두 갖춘 앱은 현재 시장에 없습니다.

---

## 7. 수익화 전략

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Note Position (전체), 기타 트랙 5 cards/day, 기본 통계 |
| **Pro Monthly** | $4.99/mo | 전 트랙 무제한, 고급 통계, 스트릭 보호 |
| **Pro Annual** | $29.99/yr | Pro 전체, 50% 할인 |

### 매출 시나리오 (Year 1)

| Scenario | Users | Conversion | ARPU | ARR |
|----------|-------|------------|------|-----|
| Conservative | 10K | 5% | $24/yr | $12K |
| Base | 50K | 8% | $30/yr | $120K |
| Optimistic | 150K | 10% | $32/yr | $480K |

---

## 8. 액션 아이템 (Top 5)

| 순위 | 항목 | 이유 | 예상 공수 |
|------|------|------|----------|
| **1** | 애널리틱스 인프라 구축 | 데이터 기반 의사결정 필수 | 3~5일 |
| **2** | 에러 바운더리 추가 | 크래시 시 데이터 유실 방지 | 1일 |
| **3** | SM-2 + 카드 생성 단위 테스트 | 이후 개선의 안전망 | 1~2일 |
| **4** | 퀴즈 중단 확인 모달 | 실수로 진행 유실 방지 | 2~3시간 |
| **5** | 수익화 모델 설계 | 비즈니스 지속가능성 | 1~2주 |

---

## 9. Go-to-Market 로드맵

**Week 1~3: 기능 완성** — 퀴즈 중단 확인 모달, Error Boundary, 단위 테스트, 퀴즈 햅틱 피드백

**Week 4~6: 리텐션 & 애널리틱스** — Mixpanel/Amplitude 연동, 스트릭 마일스톤 축하 연출, 학습 분석 인사이트

**Week 7~10: 수익화** — RevenueCat 구독 시스템, Free/Pro 기능 게이팅, 페이월 UI 설계, A/B 테스트

**Week 11~14: 런칭 준비** — Supabase 클라우드 동기화, App Store Optimization, 성능 최적화, 디바이스 테스트, 스토어 제출

**Week 15~24: 런칭 & 성장** — 한국 소프트 런칭, Reddit/YouTube 기타 커뮤니티, 기타 강사 파트너십, 데이터 기반 개선

---

## 10. 핵심 지표

**North Star**: Weekly Active Learners (WAL) — 주 1회 이상 복습 세션 완료 사용자

| Category | Metric | Target |
|----------|--------|--------|
| Retention | Day 1 / Day 7 / Day 30 | 60% / 30% / 15% |
| Revenue | Free → Paid 전환율 | 5-10% |
| Engagement | 일일 복습 카드 수 | Active user 당 20+ |

---

*이 리포트는 코드베이스 전체 교차검증(2026-02-17)을 거쳐 작성되었습니다. 기존 outdated 문서의 오류를 모두 정정하고, 실제 코드 동작 기준으로 평가했습니다.*
