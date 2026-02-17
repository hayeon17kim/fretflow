import type { StringNumber } from '@/types/music';

export interface FretRange {
  min: number;
  max: number;
}

export interface NotePositionTier {
  id: number;
  name: string;
  fretRange: FretRange;
  strings: readonly StringNumber[];
  unlockThreshold: number; // Mastered cards required
  description: string;
}

export const NOTE_POSITION_TIERS: readonly NotePositionTier[] = [
  {
    id: 1,
    name: 'Basic',
    fretRange: { min: 0, max: 5 },
    strings: [1, 2, 3, 4, 5, 6],
    unlockThreshold: 0,
    description: 'Open position (frets 0-5)',
  },
  {
    id: 2,
    name: 'Extended',
    fretRange: { min: 0, max: 12 },
    strings: [1, 2, 3, 4, 5, 6],
    unlockThreshold: 5,
    description: 'First position to octave (frets 0-12)',
  },
  {
    id: 3,
    name: 'Advanced',
    fretRange: { min: 0, max: 17 },
    strings: [1, 2, 3, 4, 5, 6],
    unlockThreshold: 15,
    description: 'High positions (frets 0-17)',
  },
  {
    id: 4,
    name: 'Master',
    fretRange: { min: 0, max: 24 },
    strings: [1, 2, 3, 4, 5, 6],
    unlockThreshold: 30,
    description: 'Full fretboard (all 24 frets)',
  },
] as const;

/**
 * Get available fret range based on number of mastered cards
 */
export function getAvailableFretRange(masteredCount: number): FretRange {
  for (let i = NOTE_POSITION_TIERS.length - 1; i >= 0; i--) {
    if (masteredCount >= NOTE_POSITION_TIERS[i].unlockThreshold) {
      return NOTE_POSITION_TIERS[i].fretRange;
    }
  }
  return NOTE_POSITION_TIERS[0].fretRange;
}

/**
 * Get current tier based on mastered count
 */
export function getCurrentNotePositionTier(masteredCount: number): NotePositionTier {
  for (let i = NOTE_POSITION_TIERS.length - 1; i >= 0; i--) {
    if (masteredCount >= NOTE_POSITION_TIERS[i].unlockThreshold) {
      return NOTE_POSITION_TIERS[i];
    }
  }
  return NOTE_POSITION_TIERS[0];
}
