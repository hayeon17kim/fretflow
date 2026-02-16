import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertIcon } from '@/components/icons/AlertIcon';
import { TrophyIcon } from '@/components/icons/TrophyIcon';
import { CircularProgress } from '@/components/progress/CircularProgress';
import { getLevelLabel, LEVELS } from '@/config/levels';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function MasteryScreen() {
  const { t } = useTranslation();
  const { getCardCount, getMasteredCards, getWeakCards } = useSpacedRepetition();
  const [_refreshKey, setRefreshKey] = useState(0);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []),
  );

  // Overall statistics
  const totalCards = getCardCount();
  const totalMastered = getMasteredCards().length;
  const totalWeak = getWeakCards().length;
  const overallProgress = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  // Statistics by level
  const levelStats = LEVELS.map((lv) => {
    const total = getCardCount(lv.id);
    const mastered = getMasteredCards(lv.id).length;
    const weak = getWeakCards(lv.id).length;
    const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { ...lv, total, mastered, weak, progress };
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Header ─── */}
        <View style={s.header}>
          <Text style={s.title}>{t('mastery.title')}</Text>
          <Text style={s.subtitle}>{t('mastery.subtitle')}</Text>
        </View>

        {/* ─── Overall stats card ─── */}
        <View style={s.overallCard} accessibilityRole="summary">
          <View style={s.overallHeader}>
            <TrophyIcon color={COLORS.level1} size={24} />
            <Text style={s.overallTitle}>{t('mastery.overallStatus')}</Text>
          </View>

          <View style={s.overallStats}>
            <View style={s.overallStatItem}>
              <Text style={s.overallStatValue}>{totalCards}</Text>
              <Text style={s.overallStatLabel}>{t('mastery.totalCards')}</Text>
            </View>
            <View style={s.overallStatDivider} />
            <View style={s.overallStatItem}>
              <Text style={[s.overallStatValue, { color: COLORS.level1 }]}>{totalMastered}</Text>
              <Text style={s.overallStatLabel}>{t('mastery.mastered')}</Text>
            </View>
            <View style={s.overallStatDivider} />
            <View style={s.overallStatItem}>
              <Text style={[s.overallStatValue, { color: COLORS.wrong }]}>{totalWeak}</Text>
              <Text style={s.overallStatLabel}>{t('mastery.weakCards')}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={s.progressBarContainer}>
            <View style={s.progressBarBg}>
              <View style={[s.progressBarFill, { width: `${overallProgress}%` }]} />
            </View>
            <Text style={s.progressBarText}>
              {t('mastery.completion', { progress: overallProgress })}
            </Text>
          </View>
        </View>

        {/* ─── Level mastery grid ─── */}
        <Text style={s.sectionTitle}>{t('mastery.levelMastery')}</Text>
        <View style={s.levelGrid}>
          {levelStats.map((lv) => (
            <View
              key={lv.id}
              style={[s.levelBox, { borderColor: `${lv.color}25` }]}
              accessibilityRole="summary"
            >
              {/* Icon with circular progress */}
              <View style={s.levelIconContainer}>
                <CircularProgress progress={lv.progress} color={lv.color} size={60} />
                <Text style={s.levelBoxEmoji}>{lv.emoji}</Text>
              </View>

              {/* Info */}
              <Text style={s.levelBoxName}>
                {t('common.levelShort', { num: lv.num })} {getLevelLabel(lv.id, t)}
              </Text>
              <Text style={s.levelBoxProgress}>{lv.progress}%</Text>

              {/* Stats */}
              <View style={s.levelBoxStats}>
                <Text style={s.levelBoxStat}>
                  <Text style={[s.levelBoxStatValue, { color: lv.color }]}>{lv.mastered}</Text>
                  <Text style={s.levelBoxStatLabel}>
                    /{lv.total} {t('mastery.mastered')}
                  </Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ─── Weak cards section ─── */}
        {totalWeak > 0 && (
          <>
            <View style={s.weakHeader}>
              <AlertIcon color={COLORS.wrong} size={18} />
              <Text style={s.sectionTitle}>{t('mastery.focusReview')}</Text>
            </View>

            <View style={s.weakCard} accessibilityRole="alert">
              <Text style={s.weakCardTitle}>
                {t('mastery.weakCardsCount', { count: totalWeak }).split(`${totalWeak}`)[0]}
                <Text style={{ color: COLORS.wrong }}>{totalWeak}{t('mastery.cardUnit')}</Text>
                {t('mastery.weakCardsCount', { count: totalWeak }).split(`${totalWeak}${t('mastery.cardUnit')}`)[1]}
              </Text>
              <Text style={s.weakCardDesc}>{t('mastery.weakCardsDesc')}</Text>

              {/* Level breakdown */}
              <View style={s.weakBreakdown}>
                {levelStats
                  .filter((lv) => lv.weak > 0)
                  .map((lv) => (
                    <View key={lv.id} style={s.weakBreakdownItem}>
                      <View style={[s.weakDot, { backgroundColor: lv.color }]} />
                      <Text style={s.weakBreakdownText}>
                        {getLevelLabel(lv.id, t)}: {lv.weak}{t('mastery.cardUnit')}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          </>
        )}

        {/* ─── Empty state ─── */}
        {totalCards === 0 && (
          <View style={s.emptyState} accessibilityRole="text">
            <Text style={s.emptyEmoji}>📚</Text>
            <Text style={s.emptyTitle}>{t('mastery.emptyTitle')}</Text>
            <Text style={s.emptyDesc}>{t('mastery.emptyDesc')}</Text>
          </View>
        )}
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

  // Header
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Overall card
  overallCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  overallTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  overallStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  overallStatItem: {
    alignItems: 'center',
  },
  overallStatValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  overallStatLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  overallStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  progressBarContainer: {
    gap: SPACING.sm,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: `${COLORS.level1}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.level1,
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.level1,
    textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Level grid
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  levelBox: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  levelBoxEmoji: {
    fontSize: 26,
    position: 'absolute',
  },
  levelBoxName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  levelBoxProgress: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  levelBoxStats: {
    width: '100%',
  },
  levelBoxStat: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  levelBoxStatValue: {
    fontWeight: '700',
  },
  levelBoxStatLabel: {
    color: COLORS.textSecondary,
  },

  // Weak cards
  weakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  weakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.wrong}25`,
    marginBottom: SPACING.xl,
  },
  weakCardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  weakCardDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  weakBreakdown: {
    gap: SPACING.sm,
  },
  weakBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  weakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weakBreakdownText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
