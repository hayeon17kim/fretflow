import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '@/utils/constants';

interface InlayMarkerProps {
  visible: boolean;
}

export const InlayMarker = memo(function InlayMarker({ visible }: InlayMarkerProps) {
  if (!visible) return null;

  return <View style={s.dot} />;
});

const s = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${COLORS.textTertiary}50`,
  },
});
