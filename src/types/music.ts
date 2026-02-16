// 기타 프렛보드 기본 타입

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6; // 1번줄(높은 E) ~ 6번줄(낮은 E)

export interface FretPosition {
  string: StringNumber;
  fret: number; // 0 = 개방현, 1~24
}

export type IntervalName =
  | 'P1'
  | 'm2'
  | 'M2'
  | 'm3'
  | 'M3'
  | 'P4'
  | 'TT'
  | 'P5'
  | 'm6'
  | 'M6'
  | 'm7'
  | 'M7'
  | 'P8';

export type ScaleName =
  | 'major'
  | 'natural-minor'
  | 'pentatonic-major'
  | 'pentatonic-minor'
  | 'blues';

export interface ScalePattern {
  name: ScaleName;
  intervals: number[]; // 반음 단위 간격
  displayName: string;
  displayNameKo: string;
}

// SM-2 스페이스드 리피티션 카드
export interface FlashCard {
  id: string;
  type: 'note' | 'interval' | 'scale' | 'ear';
  question: unknown; // 레벨별로 다른 타입 — 추후 유니온으로 구체화
  easeFactor: number; // SM-2 EF, 기본 2.5
  interval: number; // 일 단위
  repetitions: number;
  nextReviewDate: string; // ISO date
  lastReviewDate: string | null;
}

// 퀴즈 세션
export interface QuizSession {
  level: 1 | 2 | 3 | 4;
  totalCards: number;
  correctCount: number;
  wrongCount: number;
  startedAt: string;
  completedAt: string | null;
}
