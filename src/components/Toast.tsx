// Toast notification component (Issue #22)

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface ToastProps {
  visible: boolean;
  message: string;
  emoji?: string;
  duration?: number;
  onHide?: () => void;
}

export function Toast({ visible, message, emoji, duration = 3000, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.container, { top: insets.top + 60, opacity }]}>
      <View style={s.toast}>
        {emoji && <Text style={s.emoji}>{emoji}</Text>}
        <Text style={s.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.xl,
    right: SPACING.xl,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 24,
  },
  message: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
