// Badge level-up detection hook (Issue #22)
// Checks for badge level increases and triggers feedback (toast + haptic)

import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrackId } from '@/config/tracks';
import { getTrackLabel } from '@/config/tracks';
import { useAppStore } from '@/stores/useAppStore';
import { BADGES, type BadgeLevel, getBadgeForProgress } from '@/utils/badges';

interface UseBadgeCheckOptions {
  onBadgeLevelUp?: (trackId: TrackId, newBadge: BadgeLevel) => void;
}

/**
 * Hook to check for badge level-ups and trigger feedback
 * @param trackId - Track to check
 * @param currentProgress - Current progress percentage (0-100)
 * @param options - Optional callbacks
 */
export function useBadgeCheck(
  trackId: TrackId,
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
    const storedBadge = badgeLevels[trackId];

    // Check if badge level increased
    if (currentBadge !== storedBadge) {
      const badgeOrder: BadgeLevel[] = ['none', 'beginner', 'familiar', 'proficient', 'master'];
      const currentIndex = badgeOrder.indexOf(currentBadge);
      const storedIndex = badgeOrder.indexOf(storedBadge);

      if (currentIndex > storedIndex) {
        // Badge level up!
        updateBadgeLevel(trackId, currentBadge);

        // Trigger haptic feedback
        if (vibrationEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Call callback if provided
        if (options?.onBadgeLevelUp) {
          options.onBadgeLevelUp(trackId, currentBadge);
        }
      }
    }
  }, [trackId, currentProgress, badgeLevels, updateBadgeLevel, vibrationEnabled, options]);
}

/**
 * Get the toast message for badge level-up
 * @param trackId - Track that leveled up
 * @param badgeLevel - New badge level
 * @param t - Translation function
 */
export function getBadgeLevelUpMessage(
  trackId: TrackId,
  badgeLevel: BadgeLevel,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const trackLabel = getTrackLabel(trackId, t);
  const badgeName = t(`badges.${badgeLevel}`);
  return t('badges.trackUp', { track: trackLabel, badge: badgeName });
}
