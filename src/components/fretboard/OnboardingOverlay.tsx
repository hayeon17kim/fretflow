import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/utils/constants';

interface OnboardingOverlayProps {
  visible: boolean;
}

export function OnboardingOverlay({ visible }: OnboardingOverlayProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <View style={s.overlay}>
      <Text style={s.emoji}>👆</Text>
      <Text style={s.title}>{t('onboarding.title')}</Text>
      <Text style={s.sub}>{t('onboarding.subtitle')}</Text>
      <Text style={s.hint}>{t('onboarding.hint')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  sub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginTop: 8,
  },
});
