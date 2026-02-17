/**
 * Step 4: 데일리 목표 선택
 * 10 / 20 / 30장 선택 → 설정에 저장 → 온보딩 완료 → 홈으로 이동
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

const GOAL_OPTIONS = [10, 20, 30] as const;

const GOAL_META: Record<number, { emoji: string; labelKey: string; descKey: string }> = {
  10: { emoji: '🌱', labelKey: 'light', descKey: 'lightDesc' },
  20: { emoji: '🔥', labelKey: 'moderate', descKey: 'moderateDesc' },
  30: { emoji: '⚡', labelKey: 'intense', descKey: 'intenseDesc' },
};

export default function OnboardingGoalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number>(20);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const settings = useAppStore((s) => s.settings);
  const setHasSeenOnboarding = useAppStore((s) => s.setHasSeenOnboarding);
  const { requestPermissions } = useNotificationPermissions();
  const { scheduleAllNotifications } = useNotifications();

  const handleConfirm = async () => {
    // 1. Request notification permission
    const { status } = await requestPermissions();
    const granted = status === 'granted';

    // 2. Save settings with permission status
    updateSettings({
      dailyGoal: selected,
      notifications: {
        ...settings.notifications,
        permissionGranted: granted,
        lastPermissionRequest: new Date().toISOString(),
      },
    });

    // 3. Schedule notifications if granted
    if (granted) {
      await scheduleAllNotifications();
    }

    // 4. Complete onboarding
    setHasSeenOnboarding(true);
    // 홈으로 이동 (replace로 뒤로가기 방지)
    router.replace('/(tabs)');
  };

  return (
    <View style={[s.container, { paddingTop: insets.top + 40 }]}>
      {/* Center content */}
      <View style={s.centerContent}>
        <Text style={s.title}>{t('onboardingFlow.goal.title')}</Text>
        <Text style={s.subtitle}>{t('onboardingFlow.goal.subtitle')}</Text>

        {/* Goal options */}
        <View style={s.optionsList}>
          {GOAL_OPTIONS.map((goal) => {
            const meta = GOAL_META[goal];
            const isSelected = selected === goal;
            return (
              <Pressable
                key={goal}
                style={[s.optionCard, isSelected && s.optionCardSelected]}
                onPress={() => setSelected(goal)}
              >
                <Text style={s.optionEmoji}>{meta.emoji}</Text>
                <View style={s.optionTextWrap}>
                  <Text style={[s.optionLabel, isSelected && s.optionLabelSelected]}>
                    {t(`onboardingFlow.goal.${meta.labelKey}`)}
                  </Text>
                  <Text style={s.optionDesc}>
                    {t(`onboardingFlow.goal.${meta.descKey}`, { count: goal })}
                  </Text>
                </View>
                <View style={[s.radio, isSelected && s.radioSelected]}>
                  {isSelected && <View style={s.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* CTA */}
      <View style={[s.bottomArea, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable style={s.confirmButton} onPress={handleConfirm}>
          <Text style={s.confirmButtonText}>{t('onboardingFlow.goal.confirm')}</Text>
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
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  optionsList: {
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  optionCardSelected: {
    borderColor: COLORS.track1,
    backgroundColor: `${COLORS.track1}10`,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  optionLabelSelected: {
    color: COLORS.track1,
  },
  optionDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.track1,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.track1,
  },
  bottomArea: {
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.track1,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.bg,
  },
});
