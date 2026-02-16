import { useCallback } from 'react';
import type { FlashCard } from '@/types/music';
import { SM2_DEFAULTS } from '@/utils/constants';
import { calculateSM2, mapResultToQuality } from '@/utils/sm2';
import { cardStorage } from '@/utils/storage';

const CARDS_KEY = 'cards';

function getCards(): FlashCard[] {
  const raw = cardStorage.getString(CARDS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as FlashCard[];
}

function saveCards(cards: FlashCard[]): void {
  cardStorage.set(CARDS_KEY, JSON.stringify(cards));
}

/**
 * SM-2 스페이스드 리피티션 훅
 * MMKV에 카드 데이터를 로컬 저장
 */
export function useSpacedRepetition() {
  // 오늘 복습할 카드 가져오기
  const getDueCards = useCallback((level?: FlashCard['type']) => {
    const today = new Date().toISOString().split('T')[0];
    const cards = getCards();
    return cards.filter((card) => {
      if (level && card.type !== level) return false;
      return card.nextReviewDate <= today;
    });
  }, []);

  // 카드 추가
  const addCard = useCallback(
    (
      card: Omit<
        FlashCard,
        'easeFactor' | 'interval' | 'repetitions' | 'nextReviewDate' | 'lastReviewDate'
      >,
    ) => {
      const cards = getCards();
      const today = new Date().toISOString().split('T')[0];

      const newCard: FlashCard = {
        ...card,
        easeFactor: SM2_DEFAULTS.initialEaseFactor,
        interval: SM2_DEFAULTS.initialInterval,
        repetitions: 0,
        nextReviewDate: today,
        lastReviewDate: null,
      };

      cards.push(newCard);
      saveCards(cards);
      return newCard;
    },
    [],
  );

  // 리뷰 결과 기록
  const recordReview = useCallback((cardId: string, correct: boolean, responseTimeMs: number) => {
    const cards = getCards();
    const idx = cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return;

    const card = cards[idx];
    const quality = mapResultToQuality(correct, responseTimeMs);
    const result = calculateSM2({
      quality,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      interval: card.interval,
    });

    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + result.interval);

    cards[idx] = {
      ...card,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      lastReviewDate: today.toISOString().split('T')[0],
      nextReviewDate: nextDate.toISOString().split('T')[0],
    };

    saveCards(cards);
    return cards[idx];
  }, []);

  // 레벨별 카드 수
  const getCardCount = useCallback((level?: FlashCard['type']) => {
    const cards = getCards();
    if (!level) return cards.length;
    return cards.filter((c) => c.type === level).length;
  }, []);

  // 마스터된 카드 (repetitions >= 3 && easeFactor >= 2.5 && interval >= 7)
  const getMasteredCards = useCallback((level?: FlashCard['type']) => {
    const cards = getCards();
    return cards.filter((c) => {
      if (level && c.type !== level) return false;
      return c.repetitions >= 3 && c.easeFactor >= 2.5 && c.interval >= 7;
    });
  }, []);

  // 약점 카드 (easeFactor < 2.0 또는 repetitions >= 2 && easeFactor < 2.3)
  const getWeakCards = useCallback((level?: FlashCard['type']) => {
    const cards = getCards();
    return cards.filter((c) => {
      if (level && c.type !== level) return false;
      return c.easeFactor < 2.0 || (c.repetitions >= 2 && c.easeFactor < 2.3);
    });
  }, []);

  // 모든 카드 가져오기
  const getAllCards = useCallback((level?: FlashCard['type']) => {
    const cards = getCards();
    if (!level) return cards;
    return cards.filter((c) => c.type === level);
  }, []);

  return {
    getDueCards,
    addCard,
    recordReview,
    getCardCount,
    getMasteredCards,
    getWeakCards,
    getAllCards,
  };
}
