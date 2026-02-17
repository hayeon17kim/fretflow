/**
 * Phase Helpers
 *
 * Utilities for managing phase distribution and selection in quiz cards.
 *
 * Phase distribution ratios:
 * - Phase 1 only: 100%
 * - Phase 2 unlocked: 30% Phase 1, 70% Phase 2
 * - Phase 3 unlocked: 10% Phase 1, 30% Phase 2, 60% Phase 3
 */

import type { Phase } from '@/stores/usePhaseStore';

/**
 * Get phase distribution weights based on maximum unlocked phase
 *
 * @param maxPhase Maximum unlocked phase (1, 2, or 3)
 * @returns Record mapping phase number to its percentage weight
 *
 * @example
 * getPhaseDistribution(2) // { 1: 30, 2: 70 }
 * getPhaseDistribution(3) // { 1: 10, 2: 30, 3: 60 }
 */
export function getPhaseDistribution(maxPhase: Phase): Record<number, number> {
  switch (maxPhase) {
    case 1:
      return { 1: 100 };
    case 2:
      return { 1: 30, 2: 70 };
    case 3:
      return { 1: 10, 2: 30, 3: 60 };
    default:
      return { 1: 100 };
  }
}

/**
 * Select a phase for a card using weighted random selection
 *
 * @param maxPhase Maximum unlocked phase (1, 2, or 3)
 * @returns Randomly selected phase based on distribution weights
 *
 * @example
 * // With maxPhase = 2:
 * // 30% chance of returning 1
 * // 70% chance of returning 2
 * selectPhaseForCard(2)
 */
export function selectPhaseForCard(maxPhase: Phase): Phase {
  const distribution = getPhaseDistribution(maxPhase);

  // Create weighted pool
  const phases: Phase[] = [];
  for (const [phase, weight] of Object.entries(distribution)) {
    const phaseNum = parseInt(phase, 10) as Phase;
    // Add phase to pool 'weight' times (e.g., Phase 1 added 30 times for 30%)
    for (let i = 0; i < weight; i++) {
      phases.push(phaseNum);
    }
  }

  // Select random phase from weighted pool
  const randomIndex = Math.floor(Math.random() * phases.length);
  return phases[randomIndex];
}

/**
 * Get number of cards per phase for a batch
 *
 * @param totalCards Total number of cards to generate
 * @param maxPhase Maximum unlocked phase
 * @returns Record mapping phase to number of cards to generate
 *
 * @example
 * getPhaseCardCounts(10, 2) // { 1: 3, 2: 7 }
 * getPhaseCardCounts(10, 3) // { 1: 1, 2: 3, 3: 6 }
 */
export function getPhaseCardCounts(
  totalCards: number,
  maxPhase: Phase,
): Record<number, number> {
  const distribution = getPhaseDistribution(maxPhase);
  const counts: Record<number, number> = {};

  let remaining = totalCards;

  // Calculate counts based on distribution
  const phases = Object.keys(distribution)
    .map((p) => parseInt(p, 10))
    .sort();

  for (let i = 0; i < phases.length - 1; i++) {
    const phase = phases[i];
    const weight = distribution[phase];
    const count = Math.floor((totalCards * weight) / 100);
    counts[phase] = count;
    remaining -= count;
  }

  // Assign remaining cards to the highest phase
  const lastPhase = phases[phases.length - 1];
  counts[lastPhase] = remaining;

  return counts;
}
