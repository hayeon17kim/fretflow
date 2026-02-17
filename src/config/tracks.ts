import { COLORS } from '@/utils/constants';

export type TrackId = 'note' | 'interval' | 'scale' | 'ear';

export interface TrackConfig {
  id: TrackId;
  emoji: string;
  color: string;
  basic?: boolean;
}

export const TRACKS: readonly TrackConfig[] = [
  {
    id: 'note',
    emoji: '🎵',
    color: COLORS.track1,
  },
  {
    id: 'interval',
    emoji: '📏',
    color: COLORS.track2,
  },
  {
    id: 'scale',
    emoji: '🎼',
    color: COLORS.track3,
  },
  {
    id: 'ear',
    emoji: '👂',
    color: COLORS.track4,
    basic: true,
  },
] as const;

export const TARGET_CARDS_PER_TRACK = 60;

// Helper functions to get localized track data
export function getTrackLabel(trackId: TrackId, t: (key: string) => string): string {
  return t(`tracks.${trackId}.label`);
}

export function getTrackDesc(trackId: TrackId, t: (key: string) => string): string {
  return t(`tracks.${trackId}.desc`);
}

export function getTrackExample(trackId: TrackId, t: (key: string) => string): string {
  return t(`tracks.${trackId}.example`);
}
