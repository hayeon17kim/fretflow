import { useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { useSpacedRepetition } from './useSpacedRepetition';
import { NOTIFICATION_IDS, parseTime } from '@/utils/notifications';

export function useNotifications() {
  const { t } = useTranslation();
  const { settings, todayStats } = useAppStore();
  const { getDueCards } = useSpacedRepetition();

  const cancelAllScheduledNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  const scheduleDailyReminder = useCallback(async () => {
    const dueCount = getDueCards().length;
    if (dueCount === 0) return; // Don't schedule if no due cards

    const { hours, minutes } = parseTime(settings.notifications.dailyReminderTime);
    const estimatedMinutes = Math.max(1, Math.ceil(dueCount * 0.35));

    // Schedule for today if time hasn't passed
    const now = new Date();
    const todayTrigger = new Date();
    todayTrigger.setHours(hours, minutes, 0, 0);

    if (todayTrigger > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.dailyReminder.title'),
          body: t('notifications.dailyReminder.body', {
            count: dueCount,
            minutes: estimatedMinutes,
          }),
          data: { type: 'daily_review', dueCount },
        },
        trigger: todayTrigger,
        identifier: NOTIFICATION_IDS.DAILY_REMINDER_TODAY,
      });
    }

    // Schedule for tomorrow
    const tomorrowTrigger = new Date(todayTrigger);
    tomorrowTrigger.setDate(tomorrowTrigger.getDate() + 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifications.dailyReminder.title'),
        body: t('notifications.dailyReminder.body', {
          count: dueCount,
          minutes: estimatedMinutes,
        }),
        data: { type: 'daily_review', dueCount },
      },
      trigger: tomorrowTrigger,
      identifier: NOTIFICATION_IDS.DAILY_REMINDER_TOMORROW,
    });
  }, [settings.notifications.dailyReminderTime, getDueCards, t]);

  const scheduleStreakAlert = useCallback(async () => {
    const { streak, cardsReviewed } = todayStats;
    if (streak === 0) return; // No streak to protect

    const trigger = new Date();
    trigger.setHours(21, 0, 0, 0); // 9pm

    // Only schedule if time hasn't passed today
    if (trigger > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.streakAlert.title', { count: streak }),
          body: t('notifications.streakAlert.body'),
          data: { type: 'streak_alert', streak },
        },
        trigger,
        identifier: NOTIFICATION_IDS.STREAK_ALERT,
      });
    }
  }, [todayStats, t]);

  const scheduleAllNotifications = useCallback(async () => {
    await cancelAllScheduledNotifications();

    if (!settings.notifications.enabled || !settings.notifications.permissionGranted) {
      return;
    }

    await scheduleDailyReminder();
    await scheduleStreakAlert();
  }, [
    settings.notifications.enabled,
    settings.notifications.permissionGranted,
    scheduleDailyReminder,
    scheduleStreakAlert,
    cancelAllScheduledNotifications,
  ]);

  return {
    scheduleAllNotifications,
    cancelAllScheduledNotifications,
  };
}

// Debug helper function
export async function debugScheduledNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log('[알림 디버그] 예약된 알림:', scheduled.length);
  scheduled.forEach((n) => {
    const trigger = n.trigger as any;
    if (trigger.type === 'date') {
      console.log(`  - ${n.identifier}: ${new Date(trigger.value).toLocaleString()}`);
    }
  });
}
