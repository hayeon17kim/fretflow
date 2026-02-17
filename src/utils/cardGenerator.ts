/**
 * 실제 플래시 카드 생성 로직
 * MOCK_QUESTIONS를 대체하여 실제 문제를 생성합니다.
 */

import type { NoteWithOctave } from '@/config/earTrainingTiers';
import {
  getAdjacentNotes,
  getAvailableSounds,
  parseNoteWithOctave,
} from '@/config/earTrainingTiers';
import { getAvailableFretRange } from '@/config/notePositionTiers';
import { getAvailableScales } from '@/config/scaleTiers';
import type { FretPosition, NoteName, ScaleName } from '@/types/music';
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

/**
 * Generate note position card with progressive difficulty
 * @param masteredCount Number of mastered note position cards (for tier unlocking)
 */
export function generateNoteCard(masteredCount: number = 0): NoteQuestionCard {
  // Get available fret range based on tier
  const { min, max } = getAvailableFretRange(masteredCount);

  // 랜덤 위치 선택 (티어별 프렛 범위, 모든 현)
  const string = (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
  const fret = Math.floor(Math.random() * (max - min + 1)) + min;

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

/**
 * Generate scale card with progressive difficulty
 * @param masteredCount Number of mastered scale cards (for tier unlocking)
 */
export function generateScaleCard(masteredCount: number = 0): ScaleQuestionCard {
  // Get available scales based on tier
  const availableScales = getAvailableScales(masteredCount);

  // Fallback if no scales available
  if (availableScales.length === 0) {
    throw new Error('[CardGenerator] No scales available');
  }

  const scaleName = randomChoice(availableScales);
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
function generateDistractors(correct: NoteWithOctave, pool: NoteWithOctave[]): NoteWithOctave[] {
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

/**
 * Generate multiple cards with tier-based difficulty
 * @param type Card type
 * @param count Number of cards to generate
 * @param masteredCount Number of mastered cards (for tier unlocking)
 */
export function generateCardBatch(
  type: 'note' | 'scale' | 'ear',
  count: number,
  masteredCount: number = 0,
): (NoteQuestionCard | ScaleQuestionCard | EarQuestionCard)[] {
  const generators = {
    note: () => generateNoteCard(masteredCount),
    scale: () => generateScaleCard(masteredCount),
    ear: () => generateEarCard(masteredCount),
  };

  const generator = generators[type];
  return Array.from({ length: count }, () => generator());
}
