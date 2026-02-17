import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { COLORS } from '@/utils/constants';

// ─── Sound wave bars (playing indicator) ───
export function WaveBars({ color }: { color: string }) {
  const heights = [12, 20, 28, 20, 12, 24, 16];
  return (
    <View style={styles.waveBars}>
      {heights.map((h, i) => (
        <View key={`bar${i}`} style={[styles.waveBar, { height: h, backgroundColor: color }]} />
      ))}
    </View>
  );
}

// ─── Play button ───
export function PlayButton({ playing, onPress }: { playing: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.playBtn,
        playing ? styles.playBtnPlaying : styles.playBtnIdle,
        pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
      ]}
    >
      {playing ? (
        <WaveBars color={COLORS.track4} />
      ) : (
        <Svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Polygon points="5,3 19,12 5,21" fill="#fff" stroke="none" />
        </Svg>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  waveBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  playBtnIdle: {
    backgroundColor: COLORS.track4,
  },
  playBtnPlaying: {
    backgroundColor: `${COLORS.track4}20`,
  },
});
