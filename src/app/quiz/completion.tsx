import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FireIcon } from '@/components/icons/FireIcon';
import { TrophyIcon } from '@/components/icons/TrophyIcon';
import { getLevelLabel, LEVELS } from '@/config/levels';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function QuizCompletionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    correct: string;
    total: string;
    levelNum: string;
  }>();

  const correct = Number(params.correct);
  const total = Number(params.total);
  const levelNum = Number(params.levelNum) as 1 | 2 | 3 | 4;

  const level = LEVELS.find((l) => l.num === levelNum);
  const accuracy = Math.round((correct / total) * 100);

  // Get streak from app store
  const streak = useAppStore((state) => state.todayStats.streak);

  // Get due cards count
  const { getDueCards } = useSpacedRepetition();
  const dueCards = getDueCards();
  const tomorrowDueCount = dueCards.length;

  // Motivational message based on accuracy
  const getMessage = () => {
    if (accuracy === 100) return t('quiz.completion.perfect');
    if (accuracy >= 80) return t('quiz.completion.great');
    if (accuracy >= 60) return t('quiz.completion.good');
    return t('quiz.completion.keepGoing');
  };

  const handleContinue = () => {
    // Navigate to home screen instead of going back to completed quiz
    router.replace('/(tabs)');
  };

  if (!level) return null;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.levelBadge, { backgroundColor: `${level.color}20` }]}>
          <Text style={s.levelEmoji}>{level.emoji}</Text>
          <Text style={[s.levelLabel, { color: level.color }]}>{getLevelLabel(level.id, t)}</Text>
        </View>
        <Text style={s.headerTitle}>{t('quiz.completion.sessionComplete')}</Text>
      </View>

      {/* Main Result Card */}
      <View style={[s.resultCard, { borderColor: `${level.color}40` }]}>
        {/* Trophy icon */}
        <View style={s.trophyContainer}>
          <TrophyIcon color={level.color} size={64} />
        </View>

        {/* Accuracy */}
        <Text style={[s.accuracyText, { color: level.color }]}>{accuracy}%</Text>
        <Text style={s.scoreText}>
          {t('quiz.completion.score', { correct, total })}
        </Text>

        {/* Message */}
        <Text style={s.messageText}>{getMessage()}</Text>
      </View>

      {/* Stats Grid */}
      <View style={s.statsGrid}>
        {/* Streak */}
        <View style={s.statCard}>
          <View style={s.statIconRow}>
            <FireIcon color={COLORS.level1} size={20} />
            <Text style={s.statLabel}>{t('quiz.completion.streak')}</Text>
          </View>
          <Text style={[s.statValue, { color: COLORS.level1 }]}>
            {t('quiz.completion.streakDays', { count: streak })}
          </Text>
        </View>

        {/* Tomorrow's review */}
        <View style={s.statCard}>
          <Text style={s.statLabel}>{t('quiz.completion.tomorrow')}</Text>
          <Text style={[s.statValue, { color: level.color }]}>
            {t('quiz.completion.tomorrowCards', { count: tomorrowDueCount })}
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <Pressable
        style={({ pressed }) => [
          s.continueBtn,
          { backgroundColor: level.color },
          pressed && s.continueBtnPressed,
        ]}
        onPress={handleContinue}
      >
        <Text style={s.continueBtnText}>{t('quiz.completion.continue')}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  levelEmoji: {
    fontSize: 16,
  },
  levelLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: SPACING.lg,
  },
  trophyContainer: {
    marginBottom: SPACING.md,
  },
  accuracyText: {
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 72,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  messageText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  continueBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  continueBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  continueBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#fff',
  },
});
