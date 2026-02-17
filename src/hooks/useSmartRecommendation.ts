// Smart track recommendation hook (Issue #22)
// Recommends the best track for user to practice based on due cards and progress

import { useMemo } from 'react';
import type { TrackId } from '@/config/tracks';
import { TRACKS } from '@/config/tracks';
import { useSpacedRepetition } from './useSpacedRepetition';

export interface RecommendationResult {
  recommendedTrack: TrackId;
  reason: 'due_cards' | 'lowest_progress' | 'default';
  dueCount: number;
  progress: number;
}

/**
 * Smart track recommendation based on:
 * 1. Priority: Track with most due cards
 * 2. Fallback: Track with lowest progress
 * 3. Default: Note Position track
 */
export function useSmartRecommendation(): RecommendationResult {
  const { getDueCards, getTrackProgress } = useSpacedRepetition();

  return useMemo(() => {
    // Calculate due cards for each track
    const trackDueCounts: Record<TrackId, number> = {
      note: getDueCards('note').length,
      scale: getDueCards('scale').length,
      ear: getDueCards('ear').length,
    };

    // Priority 1: Track with most due cards
    const maxDue = Math.max(...Object.values(trackDueCounts));

    if (maxDue > 0) {
      // Find first track with max due cards (Note Position prioritized by iteration order)
      for (const track of TRACKS) {
        if (trackDueCounts[track.id] === maxDue) {
          return {
            recommendedTrack: track.id,
            reason: 'due_cards',
            dueCount: maxDue,
            progress: getTrackProgress(track.id),
          };
        }
      }
    }

    // Priority 2: Track with lowest progress
    const trackProgress: Record<TrackId, number> = {
      note: getTrackProgress('note'),
      scale: getTrackProgress('scale'),
      ear: getTrackProgress('ear'),
    };

    const minProgress = Math.min(...Object.values(trackProgress));

    // Find first track with min progress (Note Position prioritized by iteration order)
    for (const track of TRACKS) {
      if (trackProgress[track.id] === minProgress) {
        return {
          recommendedTrack: track.id,
          reason: 'lowest_progress',
          dueCount: 0,
          progress: minProgress,
        };
      }
    }

    // Priority 3: Default to Note Position
    return {
      recommendedTrack: 'note',
      reason: 'default',
      dueCount: 0,
      progress: getTrackProgress('note'),
    };
  }, [getDueCards, getTrackProgress]);
}
