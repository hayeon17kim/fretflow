import { useState } from 'react';
import type { QuizState } from '@/types/quiz';

interface UseQuizSessionConfig<T> {
  cards: T[];
}

export function useQuizSession<T extends { id: string }>(config: UseQuizSessionConfig<T>) {
  const { cards } = config;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [state, setState] = useState<QuizState>('question');
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const currentCard = cards[currentIdx];
  const total = cards.length;
  const progress = currentIdx + (state !== 'question' ? 1 : 0);

  const recordAnswer = (correct: boolean) => {
    setState(correct ? 'correct' : 'wrong');
    if (correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCount((prev) => prev + 1);
    }
    return Date.now() - startTime;
  };

  const nextCard = (onComplete: () => void) => {
    if (currentIdx + 1 >= total) {
      onComplete();
      return;
    }
    setCurrentIdx((prev) => prev + 1);
    setState('question');
    setStartTime(Date.now());
  };

  const resetCard = () => {
    setState('question');
    setStartTime(Date.now());
  };

  return {
    currentCard,
    currentIdx,
    state,
    setState,
    total,
    progress,
    correctCount,
    wrongCount,
    recordAnswer,
    nextCard,
    resetCard,
  };
}
