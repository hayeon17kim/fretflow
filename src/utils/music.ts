import type { FretPosition, NoteName } from '@/types/music';
import { FRETBOARD } from './constants';

// 각 줄의 개방현 음 (MIDI note number)
// 1번줄 E4=64, 2번줄 B3=59, 3번줄 G3=55, 4번줄 D3=50, 5번줄 A2=45, 6번줄 E2=40
const OPEN_STRING_MIDI = [64, 59, 55, 50, 45, 40] as const;

const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * 프렛 위치 → 음 이름
 */
export function getNoteAtPosition(pos: FretPosition): NoteName {
  const midi = OPEN_STRING_MIDI[pos.string - 1] + pos.fret;
  return NOTE_NAMES[midi % 12];
}

/**
 * 프렛 위치 → MIDI 번호
 */
export function getMidiNote(pos: FretPosition): number {
  return OPEN_STRING_MIDI[pos.string - 1] + pos.fret;
}

/**
 * 두 위치 사이 반음 간격 (interval)
 */
export function getInterval(from: FretPosition, to: FretPosition): number {
  return Math.abs(getMidiNote(to) - getMidiNote(from));
}

/**
 * 특정 음의 모든 프렛보드 위치 찾기
 */
export function findNotePositions(note: NoteName, startFret = 0, endFret = 12): FretPosition[] {
  const positions: FretPosition[] = [];

  for (let s = 1; s <= FRETBOARD.totalStrings; s++) {
    for (let f = startFret; f <= endFret; f++) {
      const pos: FretPosition = { string: s as FretPosition['string'], fret: f };
      if (getNoteAtPosition(pos) === note) {
        positions.push(pos);
      }
    }
  }

  return positions;
}

/**
 * 프렛 인레이 마커 확인 (3,5,7,9,12,15...)
 */
export function isMarkerFret(fret: number): boolean {
  return FRETBOARD.dotFrets.includes(fret as (typeof FRETBOARD.dotFrets)[number]);
}

export function isDoubleMarkerFret(fret: number): boolean {
  return FRETBOARD.doubleDotFrets.includes(fret as (typeof FRETBOARD.doubleDotFrets)[number]);
}
