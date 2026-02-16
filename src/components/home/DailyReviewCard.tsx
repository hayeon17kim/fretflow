import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FireIcon } from '@/components/icons/FireIcon';
import type { LevelId } from '@/config/levels';
import { LEVELS } from '@/config/levels';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface DailyReviewCardProps {
  streak: number;
  dueCount: number;
  estimatedMinutes: number;
  levelDueCounts: Record<LevelId, number>;
  onStartReview: () => void;
}

export function DailyReviewCard({
  streak,
  dueCount,
  estimatedMinutes,
  levelDueCounts,
  onStartReview,
}: DailyReviewCardProps) {
  const { t } = useTranslation();

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
        onPress={onStartReview}
        accessibilityRole="button"
        accessibilityLabel={dueCount > 0 ? t('home.startReview') : t('home.addCards')}
      >
        <Text style={s.ctaBtnText}>
          {dueCount > 0 ? t('home.startReview') : t('home.addCards')}
        </Text>
      </Pressable>
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
});
