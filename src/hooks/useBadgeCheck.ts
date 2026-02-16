// Badge level-up detection hook (Issue #22)
// Checks for badge level increases and triggers feedback (toast + haptic)

import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import type { LevelId } from '@/config/levels';
import { getLevelLabel } from '@/config/levels';
import { useAppStore } from '@/stores/useAppStore';
import { BADGES, getBadgeForProgress, type BadgeLevel } from '@/utils/badges';

interface UseBadgeCheckOptions {
  onBadgeLevelUp?: (levelId: LevelId, newBadge: BadgeLevel) => void;
}

/**
 * Hook to check for badge level-ups and trigger feedback
 * @param levelId - Level to check
 * @param currentProgress - Current progress percentage (0-100)
 * @param options - Optional callbacks
 */
export function useBadgeCheck(
  levelId: LevelId,
  currentProgress: number,
  options?: UseBadgeCheckOptions,
) {
  const { t } = useTranslation();
  const badgeLevels = useAppStore((s) => s.badgeLevels);
  const updateBadgeLevel = useAppStore((s) => s.updateBadgeLevel);
  const vibrationEnabled = useAppStore((s) => s.settings.vibrationEnabled);

  // Use ref to prevent triggering on initial mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip check on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentBadge = getBadgeForProgress(currentProgress);
    const storedBadge = badgeLevels[levelId];

    // Check if badge level increased
    if (currentBadge !== storedBadge) {
      const badgeOrder: BadgeLevel[] = ['none', 'beginner', 'familiar', 'proficient', 'master'];
      const currentIndex = badgeOrder.indexOf(currentBadge);
      const storedIndex = badgeOrder.indexOf(storedBadge);

      if (currentIndex > storedIndex) {
        // Badge level up!
        updateBadgeLevel(levelId, currentBadge);

        // Trigger haptic feedback
        if (vibrationEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Call callback if provided
        if (options?.onBadgeLevelUp) {
          options.onBadgeLevelUp(levelId, currentBadge);
        }
      }
    }
  }, [levelId, currentProgress, badgeLevels, updateBadgeLevel, vibrationEnabled, options]);
}

/**
 * Get the toast message for badge level-up
 * @param levelId - Level that leveled up
 * @param badgeLevel - New badge level
 * @param t - Translation function
 */
export function getBadgeLevelUpMessage(
  levelId: LevelId,
  badgeLevel: BadgeLevel,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const levelLabel = getLevelLabel(levelId, t);
  const badgeName = t(`badges.${badgeLevel}`);
  return t('badges.levelUp', { level: levelLabel, badge: badgeName });
}
