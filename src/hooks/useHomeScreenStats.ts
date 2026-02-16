import { useMemo } from 'react';
import { TARGET_CARDS_PER_LEVEL } from '@/config/levels';
import type { LevelId } from '@/config/levels';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

interface HomeScreenStats {
  dueCount: number;
  estimatedMinutes: number;
  levelDueCounts: Record<LevelId, number>;
  levelProgress: Record<LevelId, number>;
}

/**
 * Custom hook for HomeScreen statistics calculations
 * Centralizes all stats logic with memoization for performance
 */
export function useHomeScreenStats(): HomeScreenStats {
  const { getDueCards, getCardCount } = useSpacedRepetition();

  // Get all cards due today
  const dueCards = useMemo(() => getDueCards(), [getDueCards]);
  const dueCount = dueCards.length;

  // Estimate review time (0.35 min per card heuristic)
  const estimatedMinutes = useMemo(
    () => Math.max(1, Math.ceil(dueCount * 0.35)),
    [dueCount],
  );

  // Per-level due card counts
  const levelDueCounts = useMemo(() => {
    return dueCards.reduce(
      (acc, card) => {
        acc[card.type]++;
        return acc;
      },
      { note: 0, interval: 0, scale: 0, ear: 0 } as Record<LevelId, number>,
    );
  }, [dueCards]);

  // Per-level progress percentage (0-100)
  const levelProgress = useMemo(
    () => ({
      note: Math.min(100, Math.round((getCardCount('note') / TARGET_CARDS_PER_LEVEL) * 100)),
      interval: Math.min(
        100,
        Math.round((getCardCount('interval') / TARGET_CARDS_PER_LEVEL) * 100),
      ),
      scale: Math.min(100, Math.round((getCardCount('scale') / TARGET_CARDS_PER_LEVEL) * 100)),
      ear: Math.min(100, Math.round((getCardCount('ear') / TARGET_CARDS_PER_LEVEL) * 100)),
    }),
    [getCardCount],
  );

  return {
    dueCount,
    estimatedMinutes,
    levelDueCounts,
    levelProgress,
  };
}
