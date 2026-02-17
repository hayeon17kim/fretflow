import type { NoteName } from '@/types/music';

// Note with octave number
export type NoteWithOctave =
  | 'E2'
  | 'F2'
  | 'F#2'
  | 'G2'
  | 'G#2'
  | 'A2'
  | 'A#2'
  | 'B2'
  | 'C3'
  | 'C#3'
  | 'D3'
  | 'D#3'
  | 'E3'
  | 'F3'
  | 'F#3'
  | 'G3'
  | 'G#3'
  | 'A3'
  | 'A#3'
  | 'B3'
  | 'C4'
  | 'C#4'
  | 'D4'
  | 'D#4'
  | 'E4'
  | 'F4'
  | 'F#4'
  | 'G4'
  | 'G#4'
  | 'A4'
  | 'A#4'
  | 'B4'
  | 'C5'
  | 'C#5'
  | 'D5'
  | 'D#5'
  | 'E5';

export interface EarTrainingTier {
  id: number;
  name: string;
  sounds: readonly NoteWithOctave[];
  unlockThreshold: number; // Mastered cards required
  description: string;
}

export const EAR_TRAINING_TIERS: readonly EarTrainingTier[] = [
  {
    id: 1,
    name: 'Basic',
    sounds: ['E2', 'A2', 'D3', 'G3', 'B3'], // Open strings
    unlockThreshold: 0,
    description: 'Guitar open strings',
  },
  {
    id: 2,
    name: 'Natural Notes',
    sounds: ['C3', 'F3', 'A3', 'C4', 'D4', 'E4', 'F4', 'G4', 'B4'],
    unlockThreshold: 3,
    description: 'Natural notes in middle octaves',
  },
  {
    id: 3,
    name: 'Extended Range',
    sounds: ['E3', 'F2', 'G2', 'A4', 'C5', 'D5', 'E5'],
    unlockThreshold: 8,
    description: 'Wider pitch range',
  },
  {
    id: 4,
    name: 'Chromatic',
    sounds: [
      'C#3',
      'D#3',
      'F#3',
      'G#3',
      'A#3',
      'C#4',
      'D#4',
      'F#4',
      'G#4',
      'A#4',
      'F#2',
      'G#2',
      'A#2',
    ],
    unlockThreshold: 15,
    description: 'Sharp notes and chromatic intervals',
  },
  {
    id: 5,
    name: 'Master',
    sounds: ['B2', 'C#5', 'D#5'],
    unlockThreshold: 25,
    description: 'Complete chromatic range',
  },
] as const;

/**
 * Get available sounds based on number of mastered cards
 */
export function getAvailableSounds(masteredCount: number): NoteWithOctave[] {
  const available: NoteWithOctave[] = [];

  for (const tier of EAR_TRAINING_TIERS) {
    if (masteredCount >= tier.unlockThreshold) {
      available.push(...tier.sounds);
    } else {
      break; // Stop at first locked tier
    }
  }

  return available;
}

/**
 * Get current tier based on mastered count
 */
export function getCurrentTier(masteredCount: number): EarTrainingTier {
  for (let i = EAR_TRAINING_TIERS.length - 1; i >= 0; i--) {
    if (masteredCount >= EAR_TRAINING_TIERS[i].unlockThreshold) {
      return EAR_TRAINING_TIERS[i];
    }
  }
  return EAR_TRAINING_TIERS[0];
}

/**
 * Parse note with octave
 */
export function parseNoteWithOctave(note: NoteWithOctave): [NoteName, string] {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) throw new Error(`Invalid note format: ${note}`);
  return [match[1] as NoteName, match[2]];
}

/**
 * Get adjacent notes (for distractor generation)
 */
export function getAdjacentNotes(note: NoteName): NoteName[] {
  const notes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const index = notes.indexOf(note);
  if (index === -1) return [];

  const adjacent: NoteName[] = [];
  if (index > 0) adjacent.push(notes[index - 1]);
  if (index < notes.length - 1) adjacent.push(notes[index + 1]);

  return adjacent;
}
