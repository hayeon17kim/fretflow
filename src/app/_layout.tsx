import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { queryClient } from '@/api/query-client';
import { useAppStore } from '@/stores/useAppStore';
import { useNotifications } from '@/hooks/useNotifications';
import { COLORS } from '@/utils/constants';
import { migrateEarTrainingCards } from '@/utils/earTrainingMigration';
import '@/i18n';

// Set notification handler (controls foreground behavior)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);
  const { scheduleAllNotifications } = useNotifications();

  // Run migrations on app start
  useEffect(() => {
    migrateEarTrainingCards();
  }, []);

  // Register notification tap handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { type } = response.notification.request.content.data;

      // Navigate to home screen on tap
      if (type === 'daily_review' || type === 'streak_alert') {
        router.push('/(tabs)');
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Schedule notifications on app startup (if onboarding done)
  useEffect(() => {
    if (hasSeenOnboarding) {
      scheduleAllNotifications();
    }
  }, [hasSeenOnboarding, scheduleAllNotifications]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      {/* 첫 사용자는 온보딩으로 리다이렉트 */}
      {!hasSeenOnboarding && <Redirect href="/onboarding" />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'slide_from_right',
        }}
      />
    </QueryClientProvider>
  );
}
