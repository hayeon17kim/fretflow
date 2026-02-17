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
import type { Phase } from '@/stores/usePhaseStore';
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

/**
 * Note Question Card with phase support
 *
 * Phase 1: Multiple choice (position → note)
 *   - Shows position on fretboard, user selects note from 4 options
 *   - Uses: string, fret, answer, options
 *
 * Phase 2: Reverse multiple choice (note → position)
 *   - Shows note name, user selects correct position from 4 candidates
 *   - Uses: targetNote, candidatePositions, correctPosition
 *
 * Phase 3: Free tap (note → find on fretboard)
 *   - Shows note name, user taps anywhere on fretboard
 *   - Uses: targetNote, correctPosition, fretRange
 */
export interface NoteQuestionCard {
  id: string;
  type: 'note';
  phase: Phase;

  // Phase 1 fields (multiple choice)
  string?: 1 | 2 | 3 | 4 | 5 | 6;
  fret?: number;
  answer?: NoteName;
  options?: NoteName[];

  // Phase 2 & 3 fields (reverse/free tap)
  targetNote?: NoteName;
  correctPosition?: FretPosition;

  // Phase 2 specific (candidate positions)
  candidatePositions?: FretPosition[];

  // Phase 3 specific (allowed tappable range)
  fretRange?: { min: number; max: number };
}

const ALL_NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Generate Phase 1 note card: Multiple choice (position → note)
 * Shows position on fretboard, user selects note from 4 options
 *
 * @param masteredCount Number of mastered note position cards (for tier unlocking)
 */
export function generateNotePhase1Card(masteredCount: number = 0): NoteQuestionCard {
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
    id: `note-p1-${answer}-${string}-${fret}`,
    type: 'note',
    phase: 1,
    string,
    fret,
    answer,
    options,
  };
}

/**
 * Generate Phase 2 note card: Reverse multiple choice (note → position)
 * Shows note name, user selects correct position from 4 candidates
 *
 * @param masteredCount Number of mastered note position cards (for tier unlocking)
 */
export function generateNotePhase2Card(masteredCount: number = 0): NoteQuestionCard {
  const { min, max } = getAvailableFretRange(masteredCount);
  const targetNote = randomChoice(ALL_NOTES);

  // Find all positions of this note within fret range
  const allPositionsOfNote: FretPosition[] = [];
  for (let string = 1; string <= 6; string++) {
    for (let fret = min; fret <= max; fret++) {
      const pos: FretPosition = { string: string as 1 | 2 | 3 | 4 | 5 | 6, fret };
      if (getNoteAtPosition(pos) === targetNote) {
        allPositionsOfNote.push(pos);
      }
    }
  }

  // Need at least 4 positions for this phase
  // If not enough positions, try again with different note
  if (allPositionsOfNote.length < 4) {
    // Fallback: expand fret range temporarily
    const expandedPositions: FretPosition[] = [];
    for (let string = 1; string <= 6; string++) {
      for (let fret = 0; fret <= 15; fret++) {
        const pos: FretPosition = { string: string as 1 | 2 | 3 | 4 | 5 | 6, fret };
        if (getNoteAtPosition(pos) === targetNote) {
          expandedPositions.push(pos);
        }
      }
    }
    allPositionsOfNote.push(...expandedPositions);
  }

  // Select correct position and 3 distractors
  const correctPosition = randomChoice(allPositionsOfNote);
  const distractors = allPositionsOfNote
    .filter((p) => p.string !== correctPosition.string || p.fret !== correctPosition.fret)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const candidatePositions = shuffle([correctPosition, ...distractors]);

  return {
    id: `note-p2-${targetNote}-${correctPosition.string}-${correctPosition.fret}`,
    type: 'note',
    phase: 2,
    targetNote,
    correctPosition,
    candidatePositions,
  };
}

/**
 * Generate Phase 3 note card: Free tap (note → find on fretboard)
 * Shows note name, user taps anywhere on fretboard to find it
 *
 * @param masteredCount Number of mastered note position cards (for tier unlocking)
 */
export function generateNotePhase3Card(masteredCount: number = 0): NoteQuestionCard {
  const { min, max } = getAvailableFretRange(masteredCount);
  const targetNote = randomChoice(ALL_NOTES);

  // Select one random correct position within tier range
  const allPositionsOfNote: FretPosition[] = [];
  for (let string = 1; string <= 6; string++) {
    for (let fret = min; fret <= max; fret++) {
      const pos: FretPosition = { string: string as 1 | 2 | 3 | 4 | 5 | 6, fret };
      if (getNoteAtPosition(pos) === targetNote) {
        allPositionsOfNote.push(pos);
      }
    }
  }

  const correctPosition = randomChoice(allPositionsOfNote);

  return {
    id: `note-p3-${targetNote}-${correctPosition.string}-${correctPosition.fret}`,
    type: 'note',
    phase: 3,
    targetNote,
    correctPosition,
    fretRange: { min, max },
  };
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateNotePhase1Card instead
 */
export function generateNoteCard(masteredCount: number = 0): NoteQuestionCard {
  return generateNotePhase1Card(masteredCount);
}

// ─── 스케일 패턴 (Scale Pattern) 카드 ───

/**
 * Scale Question Card with phase support
 *
 * Phase 1: O/X judgment (is this note in the scale?)
 *   - Shows one note position, user answers O or X
 *   - Uses: scaleName, rootNote, rootPosition, checkPosition, isInScale
 *
 * Phase 2: Fill in the blanks (60-70% pre-revealed, 30-40% hidden)
 *   - Shows partial scale, user taps missing notes
 *   - Uses: scaleName, rootNote, rootPosition, preRevealedPositions, hiddenPositions, allPositions
 *
 * Phase 3: Full recall (blank fretboard)
 *   - User taps all notes in the scale
 *   - Uses: scaleName, rootNote, rootPosition, correctPositions, allPositions
 */
export interface ScaleQuestionCard {
  id: string;
  type: 'scale';
  phase: Phase;
  scaleName: ScaleName;
  rootNote: NoteName;
  rootPosition: FretPosition;

  // Phase 1 fields (O/X judgment)
  checkPosition?: FretPosition;
  isInScale?: boolean;

  // Phase 2 fields (fill blanks)
  preRevealedPositions?: FretPosition[];
  hiddenPositions?: FretPosition[];

  // Phase 3 fields (full recall) - also used in Phase 2
  correctPositions?: FretPosition[];
  allPositions?: FretPosition[]; // 프렛보드에 표시할 모든 위치 (탭 가능)
}

const SCALE_PATTERNS: Record<ScaleName, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  'natural-minor': [0, 2, 3, 5, 7, 8, 10, 12],
  'pentatonic-major': [0, 2, 4, 7, 9, 12],
  'pentatonic-minor': [0, 3, 5, 7, 10, 12],
  blues: [0, 3, 5, 6, 7, 10, 12],
};

/**
 * Generate Phase 1 scale card: O/X judgment
 * Shows one note, user answers if it's in the scale or not
 *
 * @param masteredCount Number of mastered scale cards (for tier unlocking)
 */
export function generateScalePhase1Card(masteredCount: number = 0): ScaleQuestionCard {
  const availableScales = getAvailableScales(masteredCount);
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

  // Generate scale positions
  const correctPositions: FretPosition[] = pattern.map((semitone) => ({
    string: rootString,
    fret: rootFret + semitone,
  }));

  // Select a random position to check (50% in scale, 50% not in scale)
  const isInScale = Math.random() < 0.5;
  let checkPosition: FretPosition;

  if (isInScale) {
    // Select from correct positions (exclude root for variety)
    const nonRootPositions = correctPositions.filter((p) => p.fret !== rootFret);
    checkPosition = randomChoice(nonRootPositions.length > 0 ? nonRootPositions : correctPositions);
  } else {
    // Select a position NOT in the scale
    const wrongPositions: FretPosition[] = [];
    for (let f = rootFret; f <= Math.min(rootFret + 12, 15); f++) {
      const pos: FretPosition = { string: rootString, fret: f };
      const isCorrect = correctPositions.some((cp) => cp.string === pos.string && cp.fret === pos.fret);
      if (!isCorrect) {
        wrongPositions.push(pos);
      }
    }
    checkPosition = randomChoice(wrongPositions);
  }

  return {
    id: `scale-p1-${scaleName}-${rootNote}-${checkPosition.fret}`,
    type: 'scale',
    phase: 1,
    scaleName,
    rootNote,
    rootPosition,
    checkPosition,
    isInScale,
  };
}

/**
 * Generate Phase 2 scale card: Fill in the blanks
 * Shows 60-70% of scale, user taps missing 30-40%
 * Always shows root, octave, and 5th (skeleton notes)
 *
 * @param masteredCount Number of mastered scale cards (for tier unlocking)
 */
export function generateScalePhase2Card(masteredCount: number = 0): ScaleQuestionCard {
  const availableScales = getAvailableScales(masteredCount);
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

  // Generate all correct positions
  const correctPositions: FretPosition[] = pattern.map((semitone) => ({
    string: rootString,
    fret: rootFret + semitone,
  }));

  // Smart hiding rules:
  // - Always show: root (0), 5th (7), octave (12)
  // - Prefer hiding: 7th, 4th (characteristic notes)
  // - Hide 30-40% of total notes
  const totalNotes = correctPositions.length;
  const targetHideCount = Math.floor(totalNotes * 0.35); // 35% average

  const alwaysShow = [0, 7, 12]; // root, 5th, octave
  const preferHide = [11, 10, 5, 6]; // 7th, 4th, tritone

  const preRevealedPositions: FretPosition[] = [];
  const hiddenPositions: FretPosition[] = [];

  // First, add always-show notes
  correctPositions.forEach((pos, idx) => {
    const semitone = pattern[idx];
    if (alwaysShow.includes(semitone)) {
      preRevealedPositions.push(pos);
    }
  });

  // Then, hide preferred notes up to target count
  correctPositions.forEach((pos, idx) => {
    const semitone = pattern[idx];
    if (
      hiddenPositions.length < targetHideCount &&
      preferHide.includes(semitone) &&
      !alwaysShow.includes(semitone)
    ) {
      hiddenPositions.push(pos);
    }
  });

  // Fill remaining slots
  correctPositions.forEach((pos, idx) => {
    const semitone = pattern[idx];
    const isRevealed = preRevealedPositions.some((p) => p.string === pos.string && p.fret === pos.fret);
    const isHidden = hiddenPositions.some((p) => p.string === pos.string && p.fret === pos.fret);

    if (!isRevealed && !isHidden) {
      if (hiddenPositions.length < targetHideCount) {
        hiddenPositions.push(pos);
      } else {
        preRevealedPositions.push(pos);
      }
    }
  });

  // 프렛보드 탭 가능한 위치
  const allPositions: FretPosition[] = [];
  for (let s = 6; s >= 4; s--) {
    for (let f = rootFret; f <= Math.min(rootFret + 12, 15); f++) {
      allPositions.push({ string: s as 4 | 5 | 6, fret: f });
    }
  }

  return {
    id: `scale-p2-${scaleName}-${rootNote}-blanks`,
    type: 'scale',
    phase: 2,
    scaleName,
    rootNote,
    rootPosition,
    preRevealedPositions,
    hiddenPositions,
    correctPositions,
    allPositions,
  };
}

/**
 * Generate Phase 3 scale card: Full recall
 * Blank fretboard, user taps all notes in scale
 *
 * @param masteredCount Number of mastered scale cards (for tier unlocking)
 */
export function generateScalePhase3Card(masteredCount: number = 0): ScaleQuestionCard {
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
    id: `scale-p3-${scaleName}-${rootNote}-pos1`,
    type: 'scale',
    phase: 3,
    scaleName,
    rootNote,
    rootPosition,
    correctPositions,
    allPositions,
  };
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use generateScalePhase3Card instead
 */
export function generateScaleCard(masteredCount: number = 0): ScaleQuestionCard {
  return generateScalePhase3Card(masteredCount);
}

// ─── 귀 훈련 (Ear Training) 카드 ───

/**
 * Ear Training Card
 * Note: Ear training only uses Phase 1 (multiple choice format)
 * Phase field included for consistency but always set to 1
 */
export interface EarQuestionCard {
  id: string;
  type: 'ear';
  phase: 1;
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
 * Note: Ear training only uses Phase 1 format (multiple choice)
 *
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
    phase: 1,
    answer,
    options,
  };
}

// ─── 배치 생성 ───

/**
 * Generate multiple cards with tier-based difficulty and phase distribution
 *
 * @param type Card type ('note', 'scale', 'ear')
 * @param count Number of cards to generate
 * @param masteredCount Number of mastered cards (for tier unlocking)
 * @param currentPhase Current unlocked phase (1, 2, or 3). Defaults to 1.
 *                     For ear training, this parameter is ignored (always uses Phase 1)
 * @returns Array of generated cards with appropriate phase distribution
 *
 * @example
 * // Generate 10 note cards with Phase 2 unlocked (30% Phase 1, 70% Phase 2)
 * generateCardBatch('note', 10, 0, 2)
 *
 * // Generate 10 scale cards with Phase 3 unlocked (10% P1, 30% P2, 60% P3)
 * generateCardBatch('scale', 10, 5, 3)
 */
export function generateCardBatch(
  type: 'note' | 'scale' | 'ear',
  count: number,
  masteredCount: number = 0,
  currentPhase: Phase = 1,
): (NoteQuestionCard | ScaleQuestionCard | EarQuestionCard)[] {
  // Ear training always uses Phase 1 (multiple choice)
  if (type === 'ear') {
    return Array.from({ length: count }, () => generateEarCard(masteredCount));
  }

  // Import phase helpers
  const { getPhaseCardCounts } = require('./phaseHelpers');
  const phaseCounts = getPhaseCardCounts(count, currentPhase);

  const cards: (NoteQuestionCard | ScaleQuestionCard)[] = [];

  // Generate cards for each phase based on distribution
  for (const [phaseStr, phaseCount] of Object.entries(phaseCounts)) {
    const phase = parseInt(phaseStr, 10) as Phase;

    for (let i = 0; i < phaseCount; i++) {
      if (type === 'note') {
        switch (phase) {
          case 1:
            cards.push(generateNotePhase1Card(masteredCount));
            break;
          case 2:
            cards.push(generateNotePhase2Card(masteredCount));
            break;
          case 3:
            cards.push(generateNotePhase3Card(masteredCount));
            break;
        }
      } else if (type === 'scale') {
        switch (phase) {
          case 1:
            cards.push(generateScalePhase1Card(masteredCount));
            break;
          case 2:
            cards.push(generateScalePhase2Card(masteredCount));
            break;
          case 3:
            cards.push(generateScalePhase3Card(masteredCount));
            break;
        }
      }
    }
  }

  // Shuffle cards so phases are mixed
  return shuffle(cards);
}
