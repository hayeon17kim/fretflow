import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/utils/constants';

interface HighlightDotProps {
  label?: string;
  color: string;
  textColor?: string;
  border?: string;
  opacity?: number;
  size: number;
  autoCompact: boolean;
  isPressed: boolean;
}

export const HighlightDot = memo(function HighlightDot({
  label,
  color,
  textColor,
  border,
  opacity = 1,
  size,
  autoCompact,
  isPressed,
}: HighlightDotProps) {
  return (
    <View
      style={[
        s.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: border ? 2 : 0,
          borderColor: border || 'transparent',
          opacity,
          transform: [{ scale: isPressed ? 0.9 : 1 }],
        },
      ]}
    >
      {label && (
        <Text
          style={[
            s.label,
            {
              fontSize: autoCompact ? 8 : 11,
              color: textColor || COLORS.bg,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,229,160,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 3,
  },
  label: {
    fontWeight: '700',
  },
});
