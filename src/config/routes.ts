import type { LevelId } from './levels';

export const QUIZ_ROUTES: Record<LevelId, string> = {
  note: '/quiz/note',
  interval: '/quiz/interval',
  scale: '/quiz/scale',
  ear: '/quiz/ear',
} as const;
