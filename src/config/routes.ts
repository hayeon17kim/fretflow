import type { TrackId } from './tracks';

export const QUIZ_ROUTES: Record<TrackId, string> = {
  note: '/quiz/note',
  interval: '/quiz/interval',
  scale: '/quiz/scale',
  ear: '/quiz/ear',
} as const;
