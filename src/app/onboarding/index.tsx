/**
 * Step 1: 온보딩 인트로 화면
 * "프렛보드를 얼마나 알고 계신가요?" + 시작 버튼 + 건너뛰기
 */
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    router.push('/onboarding/mini-quiz');
  };

  const handleSkip = () => {
    router.push('/onboarding/goal');
  };

  return (
    <View style={[s.container, { paddingTop: insets.top + 20 }]}>
      {/* Skip button */}
      <Pressable style={s.skipButton} onPress={handleSkip}>
        <Text style={s.skipText}>{t('onboardingFlow.skip')}</Text>
      </Pressable>

      {/* Center content */}
      <View style={s.centerContent}>
        <Text style={s.emoji}>🎸</Text>
        <Text style={s.title}>{t('onboardingFlow.intro.title')}</Text>
        <Text style={s.subtitle}>{t('onboardingFlow.intro.subtitle')}</Text>
      </View>

      {/* CTA */}
      <View style={[s.bottomArea, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable style={s.startButton} onPress={handleStart}>
          <Text style={s.startButtonText}>{t('onboardingFlow.intro.start')}</Text>
        </Pressable>
        <Text style={s.duration}>{t('onboardingFlow.intro.duration')}</Text>
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
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  skipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
  bottomArea: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  startButton: {
    backgroundColor: COLORS.track1,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.bg,
  },
  duration: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
});
