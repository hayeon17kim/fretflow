import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface GoalAchievedToastProps {
  visible: boolean;
}

// Check mark icon
function CheckMarkIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.correct}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function GoalAchievedToast({ visible }: GoalAchievedToastProps) {
  const { t } = useTranslation();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    if (visible) {
      // Fade in + slide down
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });

      // Fade out after 2.5 seconds
      opacity.value = withDelay(2500, withTiming(0, { duration: 300 }));
      translateY.value = withDelay(2500, withTiming(-20, { duration: 300 }));
    }
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[s.container, animatedStyle]}>
      <View style={s.toast}>
        <CheckMarkIcon size={24} />
        <Text style={s.message}>{t('quiz.goalAchieved', '오늘 목표 달성! 🎉')}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.correct,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.correct,
  },
});
