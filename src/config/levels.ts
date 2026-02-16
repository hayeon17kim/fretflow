import { COLORS } from '@/utils/constants';

export type LevelId = 'note' | 'interval' | 'scale' | 'ear';

export interface LevelConfig {
  id: LevelId;
  num: 1 | 2 | 3 | 4;
  emoji: string;
  color: string;
  basic?: boolean;
}

export const LEVELS: readonly LevelConfig[] = [
  {
    id: 'note',
    num: 1,
    emoji: '🎵',
    color: COLORS.level1,
  },
  {
    id: 'interval',
    num: 2,
    emoji: '📏',
    color: COLORS.level2,
  },
  {
    id: 'scale',
    num: 3,
    emoji: '🎼',
    color: COLORS.level3,
  },
  {
    id: 'ear',
    num: 4,
    emoji: '👂',
    color: COLORS.level4,
    basic: true,
  },
] as const;

export const TARGET_CARDS_PER_LEVEL = 60;

// Helper functions to get localized level data
export function getLevelLabel(levelId: LevelId, t: (key: string) => string): string {
  return t(`levels.${levelId}.label`);
}

export function getLevelDesc(levelId: LevelId, t: (key: string) => string): string {
  return t(`levels.${levelId}.desc`);
}

export function getLevelExample(levelId: LevelId, t: (key: string) => string): string {
  return t(`levels.${levelId}.example`);
}
