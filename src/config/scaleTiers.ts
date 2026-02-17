import type { ScaleName } from '@/types/music';

export interface ScaleTier {
  id: number;
  name: string;
  scales: readonly ScaleName[];
  unlockThreshold: number; // Mastered cards required
  description: string;
}

export const SCALE_TIERS: readonly ScaleTier[] = [
  {
    id: 1,
    name: 'Pentatonic',
    scales: ['pentatonic-major', 'pentatonic-minor'],
    unlockThreshold: 0,
    description: '5-note scales (easiest patterns)',
  },
  {
    id: 2,
    name: 'Diatonic',
    scales: ['major', 'natural-minor'],
    unlockThreshold: 8,
    description: '7-note scales (standard patterns)',
  },
  {
    id: 3,
    name: 'Blues',
    scales: ['blues'],
    unlockThreshold: 18,
    description: 'Blues scale with blue notes',
  },
] as const;

/**
 * Get available scales based on number of mastered cards
 */
export function getAvailableScales(masteredCount: number): ScaleName[] {
  const available: ScaleName[] = [];

  for (const tier of SCALE_TIERS) {
    if (masteredCount >= tier.unlockThreshold) {
      available.push(...tier.scales);
    } else {
      break; // Stop at first locked tier
    }
  }

  return available;
}

/**
 * Get current tier based on mastered count
 */
export function getCurrentScaleTier(masteredCount: number): ScaleTier {
  for (let i = SCALE_TIERS.length - 1; i >= 0; i--) {
    if (masteredCount >= SCALE_TIERS[i].unlockThreshold) {
      return SCALE_TIERS[i];
    }
  }
  return SCALE_TIERS[0];
}
