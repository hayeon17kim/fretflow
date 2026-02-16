// Smart level recommendation hook (Issue #22)
// Recommends the best level for user to practice based on due cards and progress

import { useMemo } from 'react';
import type { LevelId } from '@/config/levels';
import { LEVELS } from '@/config/levels';
import { useSpacedRepetition } from './useSpacedRepetition';

export interface RecommendationResult {
  recommendedLevel: LevelId;
  reason: 'due_cards' | 'lowest_progress' | 'default';
  dueCount: number;
  progress: number;
}

/**
 * Smart level recommendation based on:
 * 1. Priority: Level with most due cards
 * 2. Fallback: Level with lowest progress
 * 3. Default: Lv.1 (note)
 */
export function useSmartRecommendation(): RecommendationResult {
  const { getDueCards, getLevelProgress } = useSpacedRepetition();

  return useMemo(() => {
    // Calculate due cards for each level
    const levelDueCounts: Record<LevelId, number> = {
      note: getDueCards('note').length,
      interval: getDueCards('interval').length,
      scale: getDueCards('scale').length,
      ear: getDueCards('ear').length,
    };

    // Priority 1: Level with most due cards
    const maxDue = Math.max(...Object.values(levelDueCounts));

    if (maxDue > 0) {
      // Find first level with max due cards (Lv.1 prioritized by iteration order)
      for (const level of LEVELS) {
        if (levelDueCounts[level.id] === maxDue) {
          return {
            recommendedLevel: level.id,
            reason: 'due_cards',
            dueCount: maxDue,
            progress: getLevelProgress(level.id),
          };
        }
      }
    }

    // Priority 2: Level with lowest progress
    const levelProgress: Record<LevelId, number> = {
      note: getLevelProgress('note'),
      interval: getLevelProgress('interval'),
      scale: getLevelProgress('scale'),
      ear: getLevelProgress('ear'),
    };

    const minProgress = Math.min(...Object.values(levelProgress));

    // Find first level with min progress (Lv.1 prioritized by iteration order)
    for (const level of LEVELS) {
      if (levelProgress[level.id] === minProgress) {
        return {
          recommendedLevel: level.id,
          reason: 'lowest_progress',
          dueCount: 0,
          progress: minProgress,
        };
      }
    }

    // Priority 3: Default to Lv.1
    return {
      recommendedLevel: 'note',
      reason: 'default',
      dueCount: 0,
      progress: getLevelProgress('note'),
    };
  }, [getDueCards, getLevelProgress]);
}
