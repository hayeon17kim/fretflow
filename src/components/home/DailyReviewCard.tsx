import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FireIcon } from '@/components/icons/FireIcon';
import type { LevelId } from '@/config/levels';
import { getLevelLabel, LEVELS } from '@/config/levels';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface DailyReviewCardProps {
  streak: number;
  dueCount: number;
  estimatedMinutes: number;
  levelDueCounts: Record<LevelId, number>;
  cardsReviewed: number;
  dailyGoal: number;
  recommendedLevel: LevelId; // Issue #22
  onStartReview: () => void;
  onLearnNew: () => void;
}

export function DailyReviewCard({
  streak,
  dueCount,
  estimatedMinutes,
  levelDueCounts,
  cardsReviewed,
  dailyGoal,
  recommendedLevel,
  onStartReview,
  onLearnNew,
}: DailyReviewCardProps) {
  const { t } = useTranslation();

  // Calculate progress
  const progress = dailyGoal > 0 ? cardsReviewed / dailyGoal : 0;
  const progressPercent = Math.min(Math.round(progress * 100), 100);

  // Determine progress color based on percentage
  const getProgressColor = () => {
    if (progressPercent >= 100) return COLORS.correct; // Green for complete
    if (progressPercent >= 67) return COLORS.level2; // Blue for good progress
    if (progressPercent >= 34) return '#F59E0B'; // Yellow for moderate progress
    return COLORS.textTertiary; // Gray for low progress
  };

  const progressColor = getProgressColor();

  // Get recommended level label (Issue #22)
  const recommendedLevelLabel = getLevelLabel(recommendedLevel, t);

  const hasDueCards = dueCount > 0;
  // First-time user: never reviewed anything AND nothing scheduled yet
  const isFirstTime = cardsReviewed === 0 && dueCount === 0;

  return (
    <View style={s.ctaCard}>
      {/* Streak + count */}
      <View style={s.ctaTopRow}>
        <View style={s.streakRow}>
          <FireIcon color={COLORS.level1} />
          <Text style={[s.streakText, { color: COLORS.level1 }]}>
            {t('home.streak', { count: streak })}
          </Text>
        </View>
        {hasDueCards && (
          <Text style={s.dueInfo}>
            {t('home.recommendedLevel', { level: recommendedLevelLabel, count: dueCount })}
          </Text>
        )}
      </View>

      {/* Daily goal progress — hide for first-time users (all zeros) */}
      {!isFirstTime && (
        <View style={s.goalSection}>
          <View style={s.goalTextRow}>
            <Text style={s.goalLabel}>{t('home.dailyGoal')}</Text>
            <Text style={[s.goalProgress, { color: progressColor }]}>
              {cardsReviewed} / {dailyGoal}
            </Text>
          </View>
          <View style={s.progressBarContainer}>
            <View
              style={[
                s.progressBar,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={[s.progressPercent, { color: progressColor }]}>
            {progressPercent}%{progressPercent >= 100 && ' 🎉'}
          </Text>
        </View>
      )}

      {isFirstTime ? (
        <>
          {/* ── First-time user: start learning ── */}
          <Text style={s.ctaTitle}>{t('home.firstTimeTitle')}</Text>

          <Pressable
            style={({ pressed }) => [s.ctaBtn, pressed && s.ctaBtnPressed]}
            onPress={onLearnNew}
            accessibilityRole="button"
            accessibilityLabel={t('home.firstTimeCta')}
          >
            <Text style={s.ctaBtnText}>{t('home.firstTimeCta')} →</Text>
          </Pressable>
        </>
      ) : hasDueCards ? (
        <>
          {/* ── Due cards exist: review mode ── */}
          <Text style={s.ctaTitle}>
            {`${t('home.todayReview')}: ${recommendedLevelLabel}`}
          </Text>

          {/* Level composition chips */}
          <View style={s.chipRow}>
            {LEVELS.map((lv) => {
              const count = levelDueCounts[lv.id];
              if (count === 0) return null;
              return (
                <View key={lv.id} style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                  <Text style={[s.chipText, { color: lv.color }]}>
                    {getLevelLabel(lv.id, t)} ×{count}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Start review CTA */}
          <Pressable
            style={({ pressed }) => [s.ctaBtn, pressed && s.ctaBtnPressed]}
            onPress={onStartReview}
            accessibilityRole="button"
            accessibilityLabel={t('home.startReview')}
          >
            <Text style={s.ctaBtnText}>{t('home.startReview')}</Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* ── No due cards: review done ── */}
          <Text style={s.ctaTitle}>{t('home.reviewDone')}</Text>
          <Text style={s.doneDesc}>{t('home.reviewDoneDesc')}</Text>

          {/* Learn new cards — outline button (secondary action) */}
          <Pressable
            style={({ pressed }) => [s.learnBtn, pressed && s.ctaBtnPressed]}
            onPress={onLearnNew}
            accessibilityRole="button"
            accessibilityLabel={t('home.learnNew')}
          >
            <Text style={s.learnBtnText}>{t('home.learnNew')} →</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
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
  doneDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  learnBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.level1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.level1,
  },
  goalSection: {
    marginBottom: SPACING.md,
  },
  goalTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: `${COLORS.border}40`,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    textAlign: 'right',
  },
});
