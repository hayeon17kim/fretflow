// Badge system for track mastery progression (Issue #22)

export type BadgeLevel = 'none' | 'beginner' | 'familiar' | 'proficient' | 'master';

export interface Badge {
  level: BadgeLevel;
  emoji: string;
  threshold: number; // percentage (0-100)
  color: string;
}

export const BADGES: Record<BadgeLevel, Badge> = {
  none: { level: 'none', emoji: '', threshold: 0, color: '' },
  beginner: { level: 'beginner', emoji: '🌱', threshold: 0, color: '#10B981' },
  familiar: { level: 'familiar', emoji: '🌿', threshold: 30, color: '#3B82F6' },
  proficient: { level: 'proficient', emoji: '🌳', threshold: 60, color: '#8B5CF6' },
  master: { level: 'master', emoji: '🏅', threshold: 90, color: '#F59E0B' },
};

/**
 * Get badge level for a given progress percentage
 * @param progress - Progress percentage (0-100)
 * @returns Badge level
 */
export function getBadgeForProgress(progress: number): BadgeLevel {
  if (progress >= 90) return 'master';
  if (progress >= 60) return 'proficient';
  if (progress >= 30) return 'familiar';
  if (progress > 0) return 'beginner';
  return 'none';
}

/**
 * Get the next badge level
 * @param currentBadge - Current badge level
 * @returns Next badge or null if already at master
 */
export function getNextBadge(currentBadge: BadgeLevel): Badge | null {
  const order: BadgeLevel[] = ['none', 'beginner', 'familiar', 'proficient', 'master'];
  const currentIndex = order.indexOf(currentBadge);
  if (currentIndex >= order.length - 1) return null;
  return BADGES[order[currentIndex + 1]];
}

/**
 * Get progress to next badge threshold
 * @param currentProgress - Current progress percentage
 * @param currentBadge - Current badge level
 * @returns Percentage needed to reach next badge, or 0 if already at master
 */
export function getProgressToNextBadge(
  currentProgress: number,
  currentBadge: BadgeLevel,
): number {
  const nextBadge = getNextBadge(currentBadge);
  if (!nextBadge) return 0;
  return Math.max(0, nextBadge.threshold - currentProgress);
}
