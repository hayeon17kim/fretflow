/**
 * Step 3: 온보딩 결과 화면
 * 점수 표시 + 격려 메시지 + "틀린 문제는 내일 다시 등장" 인사이트
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function OnboardingResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const correct = parseInt(params.correct as string, 10) || 0;
  const total = parseInt(params.total as string, 10) || 3;
  const percentage = Math.round((correct / total) * 100);

  // 점수에 따른 격려 메시지 & 이모지
  const getEncouragement = () => {
    if (percentage === 100) {
      return { emoji: '🎉', key: 'perfect' as const };
    }
    if (percentage >= 67) {
      return { emoji: '👏', key: 'great' as const };
    }
    if (percentage >= 34) {
      return { emoji: '💪', key: 'good' as const };
    }
    return { emoji: '🎯', key: 'keepGoing' as const };
  };

  const { emoji, key } = getEncouragement();

  const handleContinue = () => {
    router.push('/onboarding/goal');
  };

  return (
    <View style={[s.container, { paddingTop: insets.top + 40 }]}>
      {/* Center content */}
      <View style={s.centerContent}>
        <Text style={s.emoji}>{emoji}</Text>

        {/* Score */}
        <Text style={s.scoreText}>{t('onboardingFlow.result.score', { correct, total })}</Text>

        {/* Encouragement */}
        <Text style={s.encouragement}>{t(`onboardingFlow.result.${key}`)}</Text>

        {/* Key insight */}
        <View style={s.insightCard}>
          <Text style={s.insightIcon}>💡</Text>
          <Text style={s.insightText}>{t('onboardingFlow.result.insight')}</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={[s.bottomArea, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable style={s.continueButton} onPress={handleContinue}>
          <Text style={s.continueButtonText}>{t('onboardingFlow.result.continue')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  scoreText: {
    fontSize: FONT_SIZE.title,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  encouragement: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    width: '100%',
  },
  insightIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomArea: {
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.track1,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.bg,
  },
});
