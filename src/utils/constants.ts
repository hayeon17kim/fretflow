// FretFlow 디자인 토큰 — 와이어프레임 V5.2 기준

export const COLORS = {
  bg: '#0D0D0F',
  surface: '#1A1A1F',
  surfaceHover: '#252529',
  border: '#2A2A30',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  accent: '#A78BFA', // 메인 퍼플

  // 레벨별 컬러
  level1: '#4ADE80', // 초록 — Note Position
  level2: '#A78BFA', // 퍼플 — Intervals
  level3: '#60A5FA', // 블루 — Scale Patterns
  level4: '#FB923C', // 오렌지 — Ear Training

  // 상태
  correct: '#4ADE80',
  wrong: '#F87171',
  selected: '#A78BFA',

  // 프렛보드
  fretLine: '#3A3A40',
  fretDot: '#FFFFFF',
  openString: '#636366',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  title: 34,
} as const;

// 프렛보드 설정
export const FRETBOARD = {
  totalStrings: 6,
  totalFrets: 24,
  standardTuning: ['E', 'B', 'G', 'D', 'A', 'E'] as const, // 1번줄 → 6번줄
  dotFrets: [3, 5, 7, 9, 12, 15, 17, 19, 21, 24] as const,
  doubleDotFrets: [12, 24] as const,
} as const;

// SM-2 기본값
export const SM2_DEFAULTS = {
  initialEaseFactor: 2.5,
  minEaseFactor: 1.3,
  initialInterval: 1,
} as const;
