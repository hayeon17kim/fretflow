import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '@/api/query-client';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS } from '@/utils/constants';
import '@/i18n';

export default function RootLayout() {
  const hasSeenOnboarding = useAppStore((s) => s.hasSeenOnboarding);

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
