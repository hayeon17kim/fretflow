/**
 * 실제 플래시 카드 생성 로직
 * MOCK_QUESTIONS를 대체하여 실제 문제를 생성합니다.
 */

import type { FretPosition, IntervalName, NoteName, ScaleName } from '@/types/music';
import { getNoteAtPosition } from './music';

// ─── 유틸리티 함수 ───

/** 배열에서 랜덤 요소 선택 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 배열 섞기 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Lv.1: 음 위치 카드 ───

export interface NoteQuestionCard {
  id: string;
  type: 'note';
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number;
  answer: NoteName;
  options: NoteName[];
}

const ALL_NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function generateNoteCard(): NoteQuestionCard {
  // 랜덤 위치 선택 (0-12 프렛, 모든 현)
  const string = (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
  const fret = Math.floor(Math.random() * 13); // 0-12 프렛

  const position: FretPosition = { string, fret };
  const answer = getNoteAtPosition(position);

  // 오답 생성 (정답 제외한 3개)
  const wrongNotes = ALL_NOTES.filter((n) => n !== answer);
  const selectedWrong = shuffle(wrongNotes).slice(0, 3);

  // 옵션 섞기
  const options = shuffle([answer, ...selectedWrong]);

  return {
    id: `note-${string}-${fret}-${Date.now()}`,
    type: 'note',
    string,
    fret,
    answer,
    options,
  };
}

// ─── Lv.2: 인터벌 카드 ───

export interface IntervalQuestionCard {
  id: string;
  type: 'interval';
  rootPosition: FretPosition;
  targetPosition: FretPosition;
  answer: IntervalName;
  options: IntervalName[];
}

const INTERVAL_NAMES: IntervalName[] = [
  'P1',
  'm2',
  'M2',
  'm3',
  'M3',
  'P4',
  'TT',
  'P5',
  'm6',
  'M6',
  'm7',
  'M7',
  'P8',
];

const INTERVAL_SEMITONES: Record<IntervalName, number> = {
  P1: 0,
  m2: 1,
  M2: 2,
  m3: 3,
  M3: 4,
  P4: 5,
  TT: 6,
  P5: 7,
  m6: 8,
  M6: 9,
  m7: 10,
  M7: 11,
  P8: 12,
};

export function generateIntervalCard(): IntervalQuestionCard {
  // 루트 음 (3-9 프렛, 4-6번 줄에서 선택)
  const rootString = (Math.floor(Math.random() * 3) + 4) as 4 | 5 | 6;
  const rootFret = Math.floor(Math.random() * 7) + 3; // 3-9

  // 목표 인터벌 선택 (P1 제외)
  const validIntervals = INTERVAL_NAMES.filter((i) => i !== 'P1');
  const answer = randomChoice(validIntervals);
  const semitones = INTERVAL_SEMITONES[answer];

  // 목표 위치 계산 (같은 줄에서 위로)
  const targetPosition: FretPosition = {
    string: rootString,
    fret: rootFret + semitones,
  };

  // 오답 생성
  const wrongIntervals = validIntervals.filter((i) => i !== answer);
  const selectedWrong = shuffle(wrongIntervals).slice(0, 3);
  const options = shuffle([answer, ...selectedWrong]);

  return {
    id: `interval-${rootString}-${rootFret}-${Date.now()}`,
    type: 'interval',
    rootPosition: { string: rootString, fret: rootFret },
    targetPosition,
    answer,
    options,
  };
}

// ─── Lv.3: 스케일 카드 ───

export interface ScaleQuestionCard {
  id: string;
  type: 'scale';
  scaleName: ScaleName;
  rootNote: NoteName;
  rootPosition: FretPosition;
  correctPositions: FretPosition[];
  allPositions: FretPosition[]; // 프렛보드에 표시할 모든 위치 (탭 가능)
}

const SCALE_PATTERNS: Record<ScaleName, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  'natural-minor': [0, 2, 3, 5, 7, 8, 10, 12],
  'pentatonic-major': [0, 2, 4, 7, 9, 12],
  'pentatonic-minor': [0, 3, 5, 7, 10, 12],
  blues: [0, 3, 5, 6, 7, 10, 12],
};

const SCALE_NAMES: ScaleName[] = ['major', 'pentatonic-major', 'pentatonic-minor'];

export function generateScaleCard(): ScaleQuestionCard {
  const scaleName = randomChoice(SCALE_NAMES);
  const pattern = SCALE_PATTERNS[scaleName];

  // 루트 음 (5-6번 줄, 3-7 프렛)
  const rootString = (Math.random() < 0.5 ? 5 : 6) as 5 | 6;
  const rootFret = Math.floor(Math.random() * 5) + 3; // 3-7
  const rootPosition: FretPosition = { string: rootString, fret: rootFret };
  const rootNote = getNoteAtPosition(rootPosition);

  // 스케일 패턴 생성 (1포지션 - 같은 줄에서 위로)
  const correctPositions: FretPosition[] = pattern.map((semitone) => ({
    string: rootString,
    fret: rootFret + semitone,
  }));

  // 프렛보드 탭 가능한 위치 (주변 음들 포함)
  const allPositions: FretPosition[] = [];
  for (let s = 6; s >= 4; s--) {
    for (let f = rootFret; f <= Math.min(rootFret + 12, 15); f++) {
      allPositions.push({ string: s as 4 | 5 | 6, fret: f });
    }
  }

  return {
    id: `scale-${scaleName}-${rootNote}-${Date.now()}`,
    type: 'scale',
    scaleName,
    rootNote,
    rootPosition,
    correctPositions,
    allPositions,
  };
}

// ─── Lv.4: 귀 훈련 카드 ───

export interface EarQuestionCard {
  id: string;
  type: 'ear';
  answer: NoteName;
  options: NoteName[];
}

const BASIC_EAR_NOTES: NoteName[] = ['E', 'A', 'D', 'G', 'B']; // 개방현 5음

export function generateEarCard(): EarQuestionCard {
  const answer = randomChoice(BASIC_EAR_NOTES);

  // 오답 생성 (나머지 개방현)
  const wrongNotes = BASIC_EAR_NOTES.filter((n) => n !== answer);
  const selectedWrong = shuffle(wrongNotes).slice(0, 3);
  const options = shuffle([answer, ...selectedWrong]);

  return {
    id: `ear-${answer}-${Date.now()}`,
    type: 'ear',
    answer,
    options,
  };
}

// ─── 배치 생성 ───

/** 특정 레벨의 카드 여러 개 생성 */
export function generateCardBatch(
  type: 'note' | 'interval' | 'scale' | 'ear',
  count: number,
): (NoteQuestionCard | IntervalQuestionCard | ScaleQuestionCard | EarQuestionCard)[] {
  const generators = {
    note: generateNoteCard,
    interval: generateIntervalCard,
    scale: generateScaleCard,
    ear: generateEarCard,
  };

  const generator = generators[type];
  return Array.from({ length: count }, () => generator());
}
