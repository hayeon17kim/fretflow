import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertIcon } from '@/components/icons/AlertIcon';
import { TrophyIcon } from '@/components/icons/TrophyIcon';
import { CircularProgress } from '@/components/progress/CircularProgress';
import { getTrackLabel, TRACKS, TARGET_CARDS_PER_TRACK } from '@/config/tracks';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { BADGES, getBadgeForProgress, getProgressToNextBadge } from '@/utils/badges';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function MasteryScreen() {
  const { t } = useTranslation();
  const { getCardCount, getMasteredCards, getWeakCards } = useSpacedRepetition();

  // Overall statistics
  const totalCards = getCardCount(); // Fix: Add missing variable (Issue #22)
  const totalMastered = getMasteredCards().length;
  const totalWeak = getWeakCards().length;
  const totalTarget = TRACKS.length * TARGET_CARDS_PER_TRACK; // 4 tracks × 60 = 240
  const overallProgress = Math.min(100, Math.round((totalMastered / totalTarget) * 100));

  // Statistics by track (Issue #22: Add badge info)
  const trackStats = TRACKS.map((track) => {
    const total = getCardCount(track.id);
    const mastered = getMasteredCards(track.id).length;
    const weak = getWeakCards(track.id).length;
    const progress = Math.min(100, Math.round((mastered / TARGET_CARDS_PER_TRACK) * 100));
    const badgeLevel = getBadgeForProgress(progress);
    const badge = BADGES[badgeLevel];
    const progressToNext = getProgressToNextBadge(progress, badgeLevel);
    return { ...track, total, mastered, weak, progress, badge, badgeLevel, progressToNext };
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
            <TrophyIcon color={COLORS.track1} size={24} />
            <Text style={s.overallTitle}>{t('mastery.overallStatus')}</Text>
          </View>

          <View style={s.overallStats}>
            <View style={s.overallStatItem}>
              <Text style={s.overallStatValue}>{totalCards}</Text>
              <Text style={s.overallStatLabel}>{t('mastery.totalCards')}</Text>
            </View>
            <View style={s.overallStatDivider} />
            <View style={s.overallStatItem}>
              <Text style={[s.overallStatValue, { color: COLORS.track1 }]}>{totalMastered}</Text>
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

        {/* ─── Track mastery grid ─── */}
        <Text style={s.sectionTitle}>{t('mastery.trackMastery')}</Text>
        <View style={s.trackGrid}>
          {trackStats.map((track) => (
            <View
              key={track.id}
              style={[s.trackBox, { borderColor: `${track.color}25` }]}
              accessibilityRole="summary"
            >
              {/* Icon with circular progress and badge (Issue #22) */}
              <View style={s.trackIconContainer}>
                <CircularProgress progress={track.progress} color={track.color} size={60} />
                <Text style={s.trackBoxEmoji}>{track.emoji}</Text>
              </View>

              {/* Info */}
              <Text style={s.trackBoxName}>{getTrackLabel(track.id, t)}</Text>
              <Text style={s.trackBoxProgress}>{track.progress}%</Text>

              {/* Badge info (Issue #22) */}
              {track.badge.emoji && (
                <View style={s.badgeInfo}>
                  <Text style={s.badgeEmoji}>{track.badge.emoji}</Text>
                  <Text style={s.badgeName}>{t(`badges.${track.badgeLevel}`)}</Text>
                </View>
              )}
              {track.progressToNext > 0 && (
                <Text style={s.nextBadgeText}>
                  {t('badges.nextBadge', { percent: track.progressToNext })}
                </Text>
              )}

              {/* Stats */}
              <View style={s.trackBoxStats}>
                <Text style={s.trackBoxStat}>
                  <Text style={[s.trackBoxStatValue, { color: track.color }]}>{track.mastered}</Text>
                  <Text style={s.trackBoxStatLabel}>
                    /{track.total} {t('mastery.mastered')}
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
                <Text style={{ color: COLORS.wrong }}>
                  {totalWeak}
                  {t('mastery.cardUnit')}
                </Text>
                {
                  t('mastery.weakCardsCount', { count: totalWeak }).split(
                    `${totalWeak}${t('mastery.cardUnit')}`,
                  )[1]
                }
              </Text>
              <Text style={s.weakCardDesc}>{t('mastery.weakCardsDesc')}</Text>

              {/* Track breakdown */}
              <View style={s.weakBreakdown}>
                {trackStats
                  .filter((track) => track.weak > 0)
                  .map((track) => (
                    <View key={track.id} style={s.weakBreakdownItem}>
                      <View style={[s.weakDot, { backgroundColor: track.color }]} />
                      <Text style={s.weakBreakdownText}>
                        {getTrackLabel(track.id, t)}: {track.weak}
                        {t('mastery.cardUnit')}
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
    backgroundColor: `${COLORS.track1}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.track1,
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.track1,
    textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Track grid
  trackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  trackBox: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  trackIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  trackBoxEmoji: {
    fontSize: 26,
    position: 'absolute',
  },
  trackBoxName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  trackBoxProgress: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  badgeName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  nextBadgeText: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginBottom: SPACING.sm,
  },
  trackBoxStats: {
    width: '100%',
  },
  trackBoxStat: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  trackBoxStatValue: {
    fontWeight: '700',
  },
  trackBoxStatLabel: {
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
