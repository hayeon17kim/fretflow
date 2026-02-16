import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { FireIcon } from '@/components/icons/FireIcon';
import { LockIcon } from '@/components/icons/LockIcon';
import { CircularProgress } from '@/components/progress/CircularProgress';
import { LEVELS, TARGET_CARDS_PER_LEVEL } from '@/config/levels';
import { QUIZ_ROUTES } from '@/config/routes';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const todayStats = useAppStore((s) => s.todayStats);
  const { getDueCards, getCardCount, isLevelLocked, getLevelProgress } = useSpacedRepetition();

  // 화면 포커스 시 리렌더링을 위한 상태
  const [_refreshKey, setRefreshKey] = useState(0);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []),
  );

  const dueCards = getDueCards();
  const _totalCards = getCardCount();
  const dueCount = dueCards.length;
  const estimatedMinutes = Math.max(1, Math.ceil(dueCount * 0.35));

  // Per-level due card count
  const levelDueCounts = dueCards.reduce(
    (acc, card) => {
      acc[card.type]++;
      return acc;
    },
    { note: 0, interval: 0, scale: 0, ear: 0 } as Record<string, number>,
  );

  // Per-level progress (mastered cards / total target per level)
  const levelProgress = useMemo(
    () => ({
      note: Math.min(100, Math.round((getCardCount('note') / TARGET_CARDS_PER_LEVEL) * 100)),
      interval: Math.min(
        100,
        Math.round((getCardCount('interval') / TARGET_CARDS_PER_LEVEL) * 100),
      ),
      scale: Math.min(100, Math.round((getCardCount('scale') / TARGET_CARDS_PER_LEVEL) * 100)),
      ear: Math.min(100, Math.round((getCardCount('ear') / TARGET_CARDS_PER_LEVEL) * 100)),
    }),
    [getCardCount],
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

        {/* ─── Main CTA card (V5.2) ─── */}
        <View style={s.ctaCard}>
          {/* Streak + count */}
          <View style={s.ctaTopRow}>
            <View style={s.streakRow}>
              <FireIcon color={COLORS.level1} />
              <Text style={[s.streakText, { color: COLORS.level1 }]}>
                {t('home.streak', { count: todayStats.streak })}
              </Text>
            </View>
            <Text style={s.dueInfo}>
              {t('home.dueInfo', { count: dueCount, minutes: estimatedMinutes })}
            </Text>
          </View>

          {/* Title */}
          <Text style={s.ctaTitle}>{t('home.todayReview')}</Text>

          {/* Level composition chips */}
          <View style={s.chipRow}>
            {LEVELS.map((lv) => {
              const count = levelDueCounts[lv.id];
              if (count === 0) return null;
              return (
                <View key={lv.id} style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                  <Text style={[s.chipText, { color: lv.color }]}>
                    {lv.label} ×{count}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* CTA button */}
          <Pressable
            style={({ pressed }) => [s.ctaBtn, pressed && s.ctaBtnPressed]}
            onPress={() => {
              // Start review — route to note quiz as default mix
              router.push('/quiz/note');
            }}
            accessibilityRole="button"
            accessibilityLabel={dueCount > 0 ? t('home.startReview') : t('home.addCards')}
          >
            <Text style={s.ctaBtnText}>
              {dueCount > 0 ? t('home.startReview') : t('home.addCards')}
            </Text>
          </Pressable>
        </View>

        {/* ─── Quick stats row ─── */}
        <View style={s.statsRow}>
          {LEVELS.map((lv) => (
            <View key={lv.id} style={[s.statBox, { borderColor: `${lv.color}15` }]}>
              <Text style={[s.statValue, { color: lv.color }]}>{levelProgress[lv.id]}%</Text>
              <Text style={s.statLabel}>
                {t('common.levelShort', { num: lv.num })} {lv.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ─── Level cards ─── */}
        <Text style={s.sectionTitle}>{t('home.levelPractice')}</Text>
        {LEVELS.map((lv) => {
          const progress = levelProgress[lv.id];
          const locked = isLevelLocked(lv.num as 1 | 2 | 3 | 4);

          return (
            <Pressable
              key={lv.id}
              style={({ pressed }) => [
                s.levelCard,
                { borderColor: `${lv.color}25` },
                pressed && !locked && { opacity: 0.85 },
                locked && { opacity: 0.5 },
              ]}
              onPress={() => {
                if (locked) {
                  // 잠금 해제 조건 알림
                  const prevLevel = lv.num - 1;
                  const prevLevelProgress = getLevelProgress(
                    LEVELS[prevLevel - 1].id as 'note' | 'interval' | 'scale',
                  );
                  Alert.alert(
                    t('home.lockedAlert'),
                    t('home.lockedMessage', {
                      level: prevLevel,
                      name: LEVELS[prevLevel - 1].label,
                      progress: prevLevelProgress,
                    }),
                    [{ text: t('home.confirm'), style: 'default' }],
                  );
                } else {
                  router.push(QUIZ_ROUTES[lv.id]);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`${lv.label}`}
            >
              <View style={s.levelCardInner}>
                {/* Icon with circular progress */}
                <View style={s.levelIcon}>
                  <CircularProgress progress={progress} color={lv.color} />
                  {locked ? <LockIcon size={20} /> : <Text style={s.levelEmoji}>{lv.emoji}</Text>}
                </View>

                {/* Info */}
                <View style={s.levelInfo}>
                  <View style={s.levelNameRow}>
                    <Text style={[s.levelName, locked && { color: COLORS.textSecondary }]}>
                      {lv.label}
                    </Text>
                    {locked && (
                      <View style={[s.chip, { backgroundColor: `${COLORS.textSecondary}15` }]}>
                        <Text style={[s.chipText, { color: COLORS.textSecondary }]}>
                          {t('home.locked')}
                        </Text>
                      </View>
                    )}
                    {'basic' in lv && lv.basic && !locked && (
                      <View style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                        <Text style={[s.chipText, { color: lv.color }]}>{t('home.basicMode')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.levelDesc, locked && { color: COLORS.textTertiary }]}>
                    {lv.desc}
                  </Text>
                </View>

                {/* Progress number */}
                <Text
                  style={[s.levelProgress, { color: locked ? COLORS.textSecondary : lv.color }]}
                >
                  {progress}%
                </Text>
              </View>
            </Pressable>
          );
        })}

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

  // CTA card
  ctaCard: {
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.level1}30`,
    backgroundColor: COLORS.surface,
  },
  ctaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  dueInfo: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '600',
  },
  ctaBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.level1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.bg,
  },

  // Quick stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Level cards
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
  },
  levelCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelEmoji: {
    fontSize: 20,
    position: 'absolute',
  },
  levelInfo: {
    flex: 1,
  },
  levelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  levelDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  levelProgress: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '700',
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
