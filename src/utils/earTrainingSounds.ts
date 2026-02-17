import type { NoteWithOctave } from '@/config/earTrainingTiers';

type SoundRegistry = Partial<Record<NoteWithOctave, number>>;

// Explicitly import all sound files (Metro bundler requires static paths)
const SOUND_IMPORTS: SoundRegistry = {
  // Octave 2
  E2: require('../../assets/sounds/E2.wav'),
  F2: require('../../assets/sounds/F2.wav'),
  'F#2': require('../../assets/sounds/F#2.wav'),
  G2: require('../../assets/sounds/G2.wav'),
  'G#2': require('../../assets/sounds/G#2.wav'),
  A2: require('../../assets/sounds/A2.wav'),
  'A#2': require('../../assets/sounds/A#2.wav'),
  B2: require('../../assets/sounds/B2.wav'),
  // Octave 3
  C3: require('../../assets/sounds/C3.wav'),
  'C#3': require('../../assets/sounds/C#3.wav'),
  D3: require('../../assets/sounds/D3.wav'),
  'D#3': require('../../assets/sounds/D#3.wav'),
  E3: require('../../assets/sounds/E3.wav'),
  F3: require('../../assets/sounds/F3.wav'),
  'F#3': require('../../assets/sounds/F#3.wav'),
  G3: require('../../assets/sounds/G3.wav'),
  'G#3': require('../../assets/sounds/G#3.wav'),
  A3: require('../../assets/sounds/A3.wav'),
  'A#3': require('../../assets/sounds/A#3.wav'),
  B3: require('../../assets/sounds/B3.wav'),
  // Octave 4
  C4: require('../../assets/sounds/C4.wav'),
  'C#4': require('../../assets/sounds/C#4.wav'),
  D4: require('../../assets/sounds/D4.wav'),
  'D#4': require('../../assets/sounds/D#4.wav'),
  E4: require('../../assets/sounds/E4.wav'),
  F4: require('../../assets/sounds/F4.wav'),
  'F#4': require('../../assets/sounds/F#4.wav'),
  G4: require('../../assets/sounds/G4.wav'),
  'G#4': require('../../assets/sounds/G#4.wav'),
  A4: require('../../assets/sounds/A4.wav'),
  'A#4': require('../../assets/sounds/A#4.wav'),
  B4: require('../../assets/sounds/B4.wav'),
  // Octave 5
  C5: require('../../assets/sounds/C5.wav'),
  'C#5': require('../../assets/sounds/C#5.wav'),
  D5: require('../../assets/sounds/D5.wav'),
  'D#5': require('../../assets/sounds/D#5.wav'),
  E5: require('../../assets/sounds/E5.wav'),
};

export const ALL_SOUNDS: SoundRegistry = SOUND_IMPORTS;

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
