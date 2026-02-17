import { useMemo } from 'react';
import type { TrackId } from '@/config/tracks';
import { TARGET_CARDS_PER_TRACK } from '@/config/tracks';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

interface HomeScreenStats {
  dueCount: number;
  estimatedMinutes: number;
  trackDueCounts: Record<TrackId, number>;
  trackProgress: Record<TrackId, number>;
}

/**
 * Custom hook for HomeScreen statistics calculations
 * Centralizes all stats logic with memoization for performance
 */
export function useHomeScreenStats(): HomeScreenStats {
  const { getDueCards, getMasteredCards } = useSpacedRepetition();

  // Get all cards due today
  const dueCards = useMemo(() => getDueCards(), [getDueCards]);
  const dueCount = dueCards.length;

  // Estimate review time (0.35 min per card heuristic)
  const estimatedMinutes = useMemo(() => Math.max(1, Math.ceil(dueCount * 0.35)), [dueCount]);

  // Per-track due card counts
  const trackDueCounts = useMemo(() => {
    return dueCards.reduce(
      (acc, card) => {
        acc[card.type]++;
        return acc;
      },
      { note: 0, interval: 0, scale: 0, ear: 0 } as Record<TrackId, number>,
    );
  }, [dueCards]);

  // Per-track progress percentage (0-100) based on mastered cards
  const trackProgress = useMemo(
    () => ({
      note: Math.min(
        100,
        Math.round((getMasteredCards('note').length / TARGET_CARDS_PER_TRACK) * 100),
      ),
      interval: Math.min(
        100,
        Math.round((getMasteredCards('interval').length / TARGET_CARDS_PER_TRACK) * 100),
      ),
      scale: Math.min(
        100,
        Math.round((getMasteredCards('scale').length / TARGET_CARDS_PER_TRACK) * 100),
      ),
      ear: Math.min(
        100,
        Math.round((getMasteredCards('ear').length / TARGET_CARDS_PER_TRACK) * 100),
      ),
    }),
    [getMasteredCards],
  );

  return {
    dueCount,
    estimatedMinutes,
    trackDueCounts,
    trackProgress,
  };
}
