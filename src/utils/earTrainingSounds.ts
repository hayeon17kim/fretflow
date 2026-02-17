import type { NoteWithOctave } from '@/config/earTrainingTiers';

type SoundRegistry = Partial<Record<NoteWithOctave, number>>;

export const ALL_SOUNDS: SoundRegistry = {};

// List of all available sound files
const SOUND_FILES: NoteWithOctave[] = [
  // Octave 2
  'E2',
  'F2',
  'F#2',
  'G2',
  'G#2',
  'A2',
  'A#2',
  'B2',
  // Octave 3
  'C3',
  'C#3',
  'D3',
  'D#3',
  'E3',
  'F3',
  'F#3',
  'G3',
  'G#3',
  'A3',
  'A#3',
  'B3',
  // Octave 4
  'C4',
  'C#4',
  'D4',
  'D#4',
  'E4',
  'F4',
  'F#4',
  'G4',
  'G#4',
  'A4',
  'A#4',
  'B4',
  // Octave 5
  'C5',
  'C#5',
  'D5',
  'D#5',
  'E5',
];

// Load all sound files at initialization
try {
  SOUND_FILES.forEach((note) => {
    try {
      ALL_SOUNDS[note] = require(`../../assets/sounds/${note}.wav`);
    } catch (err) {
      console.warn(`[EarTraining] Sound file not found: ${note}.wav`);
    }
  });
} catch (error) {
  console.error('[EarTraining] Failed to initialize sounds:', error);
}

/**
 * Get sound file module for a note
 */
export function getSoundFile(note: NoteWithOctave): number | null {
  return ALL_SOUNDS[note] ?? null;
}

/**
 * Get list of all successfully loaded sounds
 */
export function getLoadedSounds(): NoteWithOctave[] {
  return Object.keys(ALL_SOUNDS).filter(
    (note) => ALL_SOUNDS[note as NoteWithOctave],
  ) as NoteWithOctave[];
}

/**
 * Check if a sound is loaded
 */
export function isSoundLoaded(note: NoteWithOctave): boolean {
  return !!ALL_SOUNDS[note];
}
