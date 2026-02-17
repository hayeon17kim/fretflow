/**
 * Phase Unlock Toast
 *
 * Shows a celebration toast when user unlocks a new phase
 * (after 5 consecutive correct answers)
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { TrackWithPhase } from '@/stores/usePhaseStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface Props {
  visible: boolean;
  trackId: TrackWithPhase;
  newPhase: 1 | 2 | 3;
}

// Star icon for celebration
function StarIcon({ size = 24, color = COLORS.accent }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

export function PhaseUnlockToast({ visible, trackId, newPhase }: Props) {
  const { t } = useTranslation();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      // Fade in + slide down + scale up
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withTiming(0, { duration: 400 });
      scale.value = withTiming(1, { duration: 400 });

      // Fade out after 3 seconds
      opacity.value = withDelay(3000, withTiming(0, { duration: 400 }));
      translateY.value = withDelay(3000, withTiming(-20, { duration: 400 }));
      scale.value = withDelay(3000, withTiming(0.8, { duration: 400 }));
    }
  }, [visible, opacity, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!visible) return null;

  const trackColor = trackId === 'note' ? COLORS.track1 : COLORS.track3;

  return (
    <Animated.View style={[s.container, animatedStyle]}>
      <View style={[s.toast, { borderColor: trackColor }]}>
        <StarIcon size={28} color={trackColor} />
        <View style={s.textContainer}>
          <Text style={[s.title, { color: trackColor }]}>
            {t('quiz.phaseUnlock.title', { phase: newPhase })}
          </Text>
          <Text style={s.subtitle}>{t('quiz.phaseUnlock.subtitle')}</Text>
        </View>
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
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 30,
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    minWidth: 280,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md + 1,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
