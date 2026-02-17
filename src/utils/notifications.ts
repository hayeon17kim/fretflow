export const NOTIFICATION_IDS = {
  DAILY_REMINDER_TODAY: 'daily-reminder-today',
  DAILY_REMINDER_TOMORROW: 'daily-reminder-tomorrow',
  STREAK_ALERT: 'streak-alert',
} as const;

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

export function formatTime(timeStr: string, locale: string = 'en'): string {
  const { hours, minutes } = parseTime(timeStr);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale === 'en',
  });
}
