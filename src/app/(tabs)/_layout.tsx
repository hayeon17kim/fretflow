import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { TabIcon } from '@/components/TabIcon';
import { useNotifications } from '@/hooks/useNotifications';
import { COLORS, FONT_SIZE } from '@/utils/constants';

export default function TabLayout() {
  const { t } = useTranslation();
  const { scheduleAllNotifications } = useNotifications();

  // Schedule notifications on tab layout mount (after onboarding)
  useEffect(() => {
    scheduleAllNotifications();

    // Listen for app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        scheduleAllNotifications();
      }
    });

    return () => subscription.remove();
  }, [scheduleAllNotifications]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          height: 84,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.track1,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs - 1,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t('tabs.practice'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="practice" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mastery"
        options={{
          title: t('tabs.mastery'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="mastery" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
