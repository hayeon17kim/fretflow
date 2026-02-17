import { QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Redirect, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { queryClient } from '@/api/query-client';
import { useAppStore } from '@/stores/useAppStore';
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

  // Track if we've already redirected to prevent re-redirect on re-renders
  const hasRedirected = useRef(false);
  const shouldRedirectToOnboarding = !hasSeenOnboarding && !hasRedirected.current;

  if (shouldRedirectToOnboarding) {
    hasRedirected.current = true;
  }

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

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      {/* Redirect to onboarding only if user hasn't seen it (based on initial state) */}
      {shouldRedirectToOnboarding && <Redirect href="/onboarding" />}
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
