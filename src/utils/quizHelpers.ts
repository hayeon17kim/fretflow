import type { Router } from 'expo-router';
import type { TrackId } from '@/config/tracks';
import type { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import type { FretPosition } from '@/types/music';

type SpacedRepetitionHook = ReturnType<typeof useSpacedRepetition>;

interface RecordQuizAnswerOptions {
  cardId: string;
  trackId: TrackId;
  isCorrect: boolean;
  questionData: any;
  recordAnswer: (correct: boolean) => number;
  addCard: SpacedRepetitionHook['addCard'];
  recordReview: SpacedRepetitionHook['recordReview'];
}

/**
 * Records a quiz answer by:
 * 1. Recording response time
 * 2. Adding card to spaced repetition system
 * 3. Recording review in SM-2 algorithm
 * 4. Updating daily statistics
 */
export function recordQuizAnswer(options: RecordQuizAnswerOptions): void {
  const { cardId, trackId, isCorrect, questionData, recordAnswer, addCard, recordReview } = options;

  // 1. Record response time
  const responseTime = recordAnswer(isCorrect);

  // 2. Add card to spaced repetition system (if not already exists)
  addCard({
    id: cardId,
    type: trackId,
    question: questionData,
  });

  // 3. Record this review in SM-2 algorithm
  recordReview(cardId, isCorrect, responseTime);

  // 4. Update daily statistics
  useAppStore.getState().incrementReview(isCorrect);
}

interface NavigateToCompletionOptions {
  router: Router;
  correctCount: number;
  total: number;
  trackId: TrackId;
}

/**
 * Navigates to the quiz completion screen with results
 */
export function navigateToQuizCompletion(options: NavigateToCompletionOptions): void {
  const { router, correctCount, total, trackId } = options;

  router.push({
    pathname: '/quiz/completion',
    params: {
      correct: correctCount.toString(),
      total: total.toString(),
      trackId,
    },
  });
}
