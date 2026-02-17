import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import type { TrackId } from '@/config/tracks';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
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

  // Get session size from params, default to 10
  const sessionSize = params.sessionSize
    ? parseInt(params.sessionSize as string, 10)
    : DEFAULT_SESSION_SIZE;

  // Get mastered count for tier-based progression
  const masteredCount = getMasteredCards(trackId).length;

  // Generate cards for this session with tier-based difficulty
  const questions = useMemo(() => {
    const generatedCards = generateCardBatch(trackId, sessionSize, masteredCount);

    // If there's a card adapter function, use it
    if (adaptCard) {
      return generatedCards.map((card) => adaptCard(card)) as T[];
    }

    return generatedCards as T[];
  }, [trackId, sessionSize, masteredCount, adaptCard]);

  return {
    questions,
    sessionSize,
    masteredCount,
  };
}
