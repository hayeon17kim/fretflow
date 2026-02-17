import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '@/utils/constants';

interface InlayMarkerProps {
  visible: boolean;
  isDouble?: boolean;
}

export const InlayMarker = memo(function InlayMarker({
  visible,
  isDouble = false,
}: InlayMarkerProps) {
  if (!visible) return null;

  if (isDouble) {
    return (
      <View style={s.doubleDotContainer}>
        <View style={s.dot} />
        <View style={s.dot} />
      </View>
    );
  }

  return <View style={s.dot} />;
});

const s = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: `${COLORS.fretDot}55`,
  },
  doubleDotContainer: {
    position: 'absolute',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
  },
});
