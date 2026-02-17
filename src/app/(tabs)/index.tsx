import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { DailyReviewCard } from '@/components/home/DailyReviewCard';
import { LevelCardGrid } from '@/components/home/LevelCardGrid';
import type { LevelId } from '@/config/levels';
import { LEVELS } from '@/config/levels';
import { QUIZ_ROUTES } from '@/config/routes';
import { useHomeScreenStats } from '@/hooks/useHomeScreenStats';
import { useSmartRecommendation } from '@/hooks/useSmartRecommendation';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const todayStats = useAppStore((s) => s.todayStats);
  const settings = useAppStore((s) => s.settings);
  const { scheduleAllNotifications } = useNotifications();

  // State to trigger re-render on screen focus
  const [_refreshKey, setRefreshKey] = useState(0);

  // Refresh data and reschedule notifications whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
      scheduleAllNotifications();

      // Listen for app state changes (foreground/background)
      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          scheduleAllNotifications();
        }
      });

      return () => subscription.remove();
    }, [scheduleAllNotifications]),
  );

  // Get all statistics from hook
  const { dueCount, estimatedMinutes, levelDueCounts, levelProgress } = useHomeScreenStats();
  const { isLevelLocked } = useSpacedRepetition();

  // Smart recommendation for optimal level selection (Issue #22)
  const { recommendedLevel, dueCount: recommendedDueCount } = useSmartRecommendation();

  const handleStartReview = useCallback(() => {
    // Route to the recommended level for due card review
    router.push(QUIZ_ROUTES[recommendedLevel]);
  }, [router, recommendedLevel]);

  // Learn new cards — go directly to recommended level quiz (no extra level-select step)
  const handleLearnNew = useCallback(() => {
    router.push(QUIZ_ROUTES[recommendedLevel]);
  }, [router, recommendedLevel]);

  const handleLevelPress = useCallback(
    (levelId: LevelId) => {
      router.push(QUIZ_ROUTES[levelId]);
    },
    [router],
  );

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Top row ─── */}
        <View style={s.topRow}>
          <View>
            <Text style={s.greeting}>{t('home.greeting')}</Text>
            <Text style={s.title}>{t('home.title')}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/settings')}
            style={s.profileBtn}
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
          >
            <Svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.level1}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx={12} cy={7} r={4} />
            </Svg>
          </Pressable>
        </View>

        {/* ─── Daily review CTA card ─── */}
        <DailyReviewCard
          streak={todayStats.streak}
          dueCount={dueCount}
          estimatedMinutes={estimatedMinutes}
          levelDueCounts={levelDueCounts}
          cardsReviewed={todayStats.cardsReviewed}
          dailyGoal={settings.dailyGoal}
          recommendedLevel={recommendedLevel}
          onStartReview={handleStartReview}
          onLearnNew={handleLearnNew}
        />

        {/* ─── Level cards ─── */}
        <LevelCardGrid levelProgress={levelProgress} onLevelPress={handleLevelPress} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 100,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
