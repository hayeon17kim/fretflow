import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/utils/constants';

interface OnboardingOverlayProps {
  visible: boolean;
}

export function OnboardingOverlay({ visible }: OnboardingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={s.overlay}>
      <Text style={s.emoji}>👆</Text>
      <Text style={s.title}>프렛보드를 직접 탭하세요!</Text>
      <Text style={s.sub}>○ 표시된 위치를 눌러 답을 선택해요</Text>
      <Text style={s.hint}>탭하여 시작</Text>
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
