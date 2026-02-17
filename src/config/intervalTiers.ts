import type { IntervalName } from '@/types/music';

export interface IntervalTier {
  id: number;
  name: string;
  intervals: readonly IntervalName[];
  unlockThreshold: number; // Mastered cards required
  description: string;
}

export const INTERVAL_TIERS: readonly IntervalTier[] = [
  {
    id: 1,
    name: 'Perfect',
    intervals: ['P4', 'P5', 'P8'],
    unlockThreshold: 0,
    description: 'Perfect intervals (easiest to hear)',
  },
  {
    id: 2,
    name: 'Thirds & Sixths',
    intervals: ['M3', 'm3', 'M6', 'm6'],
    unlockThreshold: 5,
    description: 'Major and minor thirds and sixths',
  },
  {
    id: 3,
    name: 'Seconds & Sevenths',
    intervals: ['M2', 'm2', 'M7', 'm7'],
    unlockThreshold: 12,
    description: 'Whole steps and half steps',
  },
  {
    id: 4,
    name: 'Chromatic',
    intervals: ['TT'],
    unlockThreshold: 20,
    description: 'Tritone (most challenging)',
  },
] as const;

/**
 * Get available intervals based on number of mastered cards
 */
export function getAvailableIntervals(masteredCount: number): IntervalName[] {
  const available: IntervalName[] = [];

  for (const tier of INTERVAL_TIERS) {
    if (masteredCount >= tier.unlockThreshold) {
      available.push(...tier.intervals);
    } else {
      break; // Stop at first locked tier
    }
  }

  return available;
}

/**
 * Get current tier based on mastered count
 */
export function getCurrentIntervalTier(masteredCount: number): IntervalTier {
  for (let i = INTERVAL_TIERS.length - 1; i >= 0; i--) {
    if (masteredCount >= INTERVAL_TIERS[i].unlockThreshold) {
      return INTERVAL_TIERS[i];
    }
  }
  return INTERVAL_TIERS[0];
}
