import type { NoteWithOctave } from '@/config/earTrainingTiers';
import type { FlashCard } from '@/types/music';
import { cardStorage } from '@/utils/storage';

const CARDS_KEY = 'cards';
const MIGRATION_KEY = 'ear_training_migration_v1';

function getCards(): FlashCard[] {
  try {
    const raw = cardStorage.getString(CARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FlashCard[];
  } catch (error) {
    console.error('[Migration] Failed to parse cards:', error);
    return [];
  }
}

function saveCards(cards: FlashCard[]): void {
  try {
    cardStorage.set(CARDS_KEY, JSON.stringify(cards));
  } catch (error) {
    console.error('[Migration] Failed to save cards:', error);
    throw error;
  }
}

/**
 * Migrate old ear training cards from format "ear-E" to "ear-E2"
 * Maps old open string notes to their specific octaves
 */
export function migrateEarTrainingCards(): void {
  // Check if migration already ran
  const migrated = cardStorage.getBoolean(MIGRATION_KEY);
  if (migrated) {
    console.log('[Migration] Ear training cards already migrated');
    return;
  }

  const cards = getCards();
  let modifiedCount = 0;

  // Map old note names to new note names with octaves
  const noteMap: Record<string, NoteWithOctave> = {
    E: 'E2',
    A: 'A2',
    D: 'D3',
    G: 'G3',
    B: 'B3',
  };

  cards.forEach((card, idx) => {
    // Only migrate ear training cards with old format
    if (card.type === 'ear' && card.id.match(/^ear-[A-G]#?$/)) {
      const oldNote = card.id.replace('ear-', '');
      const newNote = noteMap[oldNote];

      if (newNote) {
        // Update card ID
        cards[idx] = {
          ...card,
          id: `ear-${newNote}`,
        };
        modifiedCount++;
        console.log(`[Migration] Migrated card: ${card.id} → ear-${newNote}`);
      }
    }
  });

  if (modifiedCount > 0) {
    saveCards(cards);
    console.log(`[Migration] Migrated ${modifiedCount} ear training cards`);
  } else {
    console.log('[Migration] No ear training cards to migrate');
  }

  // Mark migration as complete
  cardStorage.set(MIGRATION_KEY, true);
}
