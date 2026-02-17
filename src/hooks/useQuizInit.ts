import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import type { TrackId } from '@/config/tracks';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { usePhaseStore } from '@/stores/usePhaseStore';
import { generateCardBatch } from '@/utils/cardGenerator';

const DEFAULT_SESSION_SIZE = 10;

interface UseQuizInitOptions<T> {
  trackId: TrackId;
  adaptCard?: (card: any, ...args: any[]) => T;
}

export function useQuizInit<T = any>(options: UseQuizInitOptions<T>) {
  const { trackId, adaptCard } = options;
  const params = useLocalSearchParams();
  const { getMasteredCards } = useSpacedRepetition();
  const getCurrentPhase = usePhaseStore((state) => state.getCurrentPhase);

  // Keep latest adaptCard in a ref so it's never a useMemo dependency.
  // This prevents card regeneration when callers pass inline functions.
  const adaptCardRef = useRef(adaptCard);
  adaptCardRef.current = adaptCard;

  // Get session size from params, default to 10
  const sessionSize = params.sessionSize
    ? parseInt(params.sessionSize as string, 10)
    : DEFAULT_SESSION_SIZE;

  // Get mastered count for tier-based progression
  const masteredCount = getMasteredCards(trackId).length;

  // Get current phase for note/scale tracks (phase system)
  const currentPhase = trackId === 'note' || trackId === 'scale' ? getCurrentPhase(trackId) : 1;

  // Generate cards for this session with tier-based difficulty and phase distribution
  // NOTE: adaptCard intentionally excluded from deps — ref keeps it fresh
  const questions = useMemo(() => {
    const generatedCards = generateCardBatch(trackId, sessionSize, masteredCount, currentPhase);

    const adapter = adaptCardRef.current;
    if (adapter) {
      return generatedCards.map((card) => adapter(card)) as T[];
    }

    return generatedCards as T[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, sessionSize, masteredCount, currentPhase]);

  return {
    questions,
    sessionSize,
    masteredCount,
    currentPhase,
  };
}
