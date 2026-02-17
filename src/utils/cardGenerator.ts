/**
 * 실제 플래시 카드 생성 로직
 * MOCK_QUESTIONS를 대체하여 실제 문제를 생성합니다.
 */

import type { FretPosition, IntervalName, NoteName, ScaleName } from '@/types/music';
import type { NoteWithOctave } from '@/config/earTrainingTiers';
import {
  getAvailableSounds,
  parseNoteWithOctave,
  getAdjacentNotes,
} from '@/config/earTrainingTiers';
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

// ─── 음 위치 (Note Position) 카드 ───

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
    id: `note-${answer}-${string}-${fret}`,
    type: 'note',
    string,
    fret,
    answer,
    options,
  };
}

// ─── 인터벌 (Interval) 카드 ───

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

  // Get note names for deterministic ID
  const rootNote = getNoteAtPosition({ string: rootString, fret: rootFret });
  const targetNote = getNoteAtPosition(targetPosition);

  return {
    id: `interval-${rootNote}-${targetNote}-${answer}`,
    type: 'interval',
    rootPosition: { string: rootString, fret: rootFret },
    targetPosition,
    answer,
    options,
  };
}

// ─── 스케일 패턴 (Scale Pattern) 카드 ───

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
    id: `scale-${scaleName}-${rootNote}-pos1`,
    type: 'scale',
    scaleName,
    rootNote,
    rootPosition,
    correctPositions,
    allPositions,
  };
}

// ─── 귀 훈련 (Ear Training) 카드 ───

export interface EarQuestionCard {
  id: string;
  type: 'ear';
  answer: NoteWithOctave;
  options: NoteWithOctave[];
}

/**
 * Generate distractor options for ear training
 */
function generateDistractors(
  correct: NoteWithOctave,
  pool: NoteWithOctave[],
): NoteWithOctave[] {
  const [note, octaveStr] = parseNoteWithOctave(correct);
  const octave = parseInt(octaveStr, 10);

  const distractors: NoteWithOctave[] = [];
  const used = new Set<NoteWithOctave>([correct]);

  // 1. Same note, different octave (if available)
  const sameNoteDiffOctave = pool.filter(
    (n) => n.startsWith(note) && !n.endsWith(octaveStr) && !used.has(n),
  );
  if (sameNoteDiffOctave.length > 0) {
    const selected = randomChoice(sameNoteDiffOctave);
    distractors.push(selected);
    used.add(selected);
  }

  // 2. Adjacent semitones (harder distractors)
  const adjacentNotes = getAdjacentNotes(note);
  const adjacentOptions = pool.filter(
    (n) => adjacentNotes.some((adj) => n.startsWith(adj)) && n.endsWith(octaveStr) && !used.has(n),
  );
  if (adjacentOptions.length > 0 && distractors.length < 3) {
    const selected = randomChoice(adjacentOptions);
    distractors.push(selected);
    used.add(selected);
  }

  // 3. Random from pool (fill remaining)
  while (distractors.length < 3) {
    const remaining = pool.filter((n) => !used.has(n));
    if (remaining.length === 0) break;

    const selected = randomChoice(remaining);
    distractors.push(selected);
    used.add(selected);
  }

  return distractors;
}

/**
 * Generate ear training card with progressive difficulty
 * @param masteredCount Number of mastered ear training cards (for tier unlocking)
 */
export function generateEarCard(masteredCount: number = 0): EarQuestionCard {
  const availableSounds = getAvailableSounds(masteredCount);

  // Fallback if no sounds available
  if (availableSounds.length === 0) {
    throw new Error('[CardGenerator] No sounds available for ear training');
  }

  // Select random answer
  const answer = randomChoice(availableSounds);

  // Generate distractors
  const wrongNotes = generateDistractors(answer, availableSounds);

  // If we don't have enough options, add random ones
  while (wrongNotes.length < 3 && availableSounds.length > wrongNotes.length + 1) {
    const candidate = randomChoice(availableSounds);
    if (candidate !== answer && !wrongNotes.includes(candidate)) {
      wrongNotes.push(candidate);
    }
  }

  // Ensure we have exactly 3 distractors
  const selectedWrong = wrongNotes.slice(0, 3);

  // Shuffle options
  const options = shuffle([answer, ...selectedWrong]);

  return {
    id: `ear-${answer}`,
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
