/**
 * Developer tools for testing tier system
 */

import type { FlashCard } from '@/types/music';
import { SM2_DEFAULTS } from './constants';
import { cardStorage } from './storage';

const CARDS_KEY = 'cards';

interface MasteredCardSimulation {
  note: number;
  scale: number;
  ear: number;
}

/**
 * Get current counts from storage
 */
function getCards(): FlashCard[] {
  try {
    const raw = cardStorage.getString(CARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FlashCard[];
  } catch {
    return [];
  }
}

/**
 * Save cards to storage
 */
function saveCards(cards: FlashCard[]): void {
  cardStorage.set(CARDS_KEY, JSON.stringify(cards));
}

/**
 * Create a dummy mastered card
 */
function createMasteredCard(type: FlashCard['type'], index: number): FlashCard {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + 30); // 30 days later

  return {
    id: `dev-${type}-${index}-${Date.now()}`,
    type,
    // biome-ignore lint/suspicious/noExplicitAny: Dev tool only
    question: { dummy: true } as any,
    easeFactor: 2.6, // Above mastery threshold
    interval: 14, // Above mastery threshold (7 days)
    repetitions: 5, // Above mastery threshold (3)
    nextReviewDate: futureDate.toISOString().split('T')[0],
    lastReviewDate: today.toISOString().split('T')[0],
  };
}

/**
 * Get current mastered card counts per track
 */
export function getMasteredCounts(): MasteredCardSimulation {
  const cards = getCards();

  const counts: MasteredCardSimulation = {
    note: 0,
    scale: 0,
    ear: 0,
  };

  for (const card of cards) {
    if (card.repetitions >= 3 && card.easeFactor >= 2.5 && card.interval >= 7) {
      counts[card.type]++;
    }
  }

  return counts;
}

/**
 * Set mastered card count for a specific track (for testing)
 */
export function setMasteredCount(type: FlashCard['type'], targetCount: number): void {
  const cards = getCards();

  // Remove existing dev cards for this track
  const filteredCards = cards.filter((c) => !c.id.startsWith(`dev-${type}-`));

  // Add dummy mastered cards
  for (let i = 0; i < targetCount; i++) {
    filteredCards.push(createMasteredCard(type, i));
  }

  saveCards(filteredCards);
}

/**
 * Reset all cards (for testing)
 */
export function resetAllCards(): void {
  cardStorage.delete(CARDS_KEY);
}

/**
 * Reset dev cards only (keep real progress)
 */
export function resetDevCards(): void {
  const cards = getCards();
  const realCards = cards.filter((c) => !c.id.startsWith('dev-'));
  saveCards(realCards);
}
