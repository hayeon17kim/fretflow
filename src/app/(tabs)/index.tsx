import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { DailyReviewCard } from '@/components/home/DailyReviewCard';
import { LevelCardGrid } from '@/components/home/LevelCardGrid';
import { LevelProgressStats } from '@/components/home/LevelProgressStats';
import type { LevelId } from '@/config/levels';
import { QUIZ_ROUTES } from '@/config/routes';
import { useHomeScreenStats } from '@/hooks/useHomeScreenStats';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const todayStats = useAppStore((s) => s.todayStats);

  // 화면 포커스 시 리렌더링을 위한 상태
  const [_refreshKey, setRefreshKey] = useState(0);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []),
  );

  // Get all statistics from hook
  const { dueCount, estimatedMinutes, levelDueCounts, levelProgress } = useHomeScreenStats();

  const handleStartReview = useCallback(() => {
    router.push('/quiz/note');
  }, [router]);

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
          onStartReview={handleStartReview}
        />

        {/* ─── Quick stats row ─── */}
        <LevelProgressStats levelProgress={levelProgress} />

        {/* ─── Level cards ─── */}
        <LevelCardGrid levelProgress={levelProgress} onLevelPress={handleLevelPress} />

        {/* ─── Practice shortcut ─── */}
        <Pressable
          style={({ pressed }) => [s.practiceBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/(tabs)/practice')}
          accessibilityRole="button"
          accessibilityLabel={t('home.practiceShortcut')}
        >
          <Text style={s.practiceBtnText}>{t('home.practiceShortcut')}</Text>
        </Pressable>
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

  // Practice shortcut button
  practiceBtn: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  practiceBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});
