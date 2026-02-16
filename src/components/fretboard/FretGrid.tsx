import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FretPosition, StringNumber } from '@/types/music';
import type { FretHighlight } from '../Fretboard';
import { FretCell } from './FretCell';
import { COLORS, FRETBOARD } from '@/utils/constants';

const DOT_FRETS = [3, 5, 7, 9, 12, 15];
const DOUBLE_DOT_FRETS = [12];

interface FretGridProps {
  startFret: number;
  fretCount: number;
  cellWidth: number;
  cellHeight: number;
  dotSize: number;
  autoCompact: boolean;
  tappable: boolean;
  highlights: FretHighlight[];
  pressedCell: string | null;
  onCellPress: (pos: FretPosition) => void;
}

export function FretGrid({
  startFret,
  fretCount,
  cellWidth,
  cellHeight,
  dotSize,
  autoCompact,
  tappable,
  highlights,
  pressedCell,
  onCellPress,
}: FretGridProps) {
  // Pre-compute highlights map for O(1) lookup instead of O(n) per cell
  // Performance: For 30 cells + 5 highlights: 150 ops → 35 ops (4.3x faster)
  const highlightsMap = useMemo(() => {
    const map = new Map<string, FretHighlight>();
    highlights.forEach((hl) => {
      const key = `${hl.string}-${hl.fret}`;
      map.set(key, hl);
    });
    return map;
  }, [highlights]);

  return (
    <View style={s.grid}>
      {/* Nut (thick line at fret 0) */}
      {startFret === 0 && <View style={s.nut} />}

      {FRETBOARD.standardTuning.map((_, si) => {
        const stringNum = (si + 1) as StringNumber;
        const isLastString = si === FRETBOARD.totalStrings - 1;

        return (
          <View key={si} style={{ position: 'relative', height: cellHeight }}>
            {/* String line */}
            <View
              style={[
                s.stringLine,
                {
                  height: si >= 4 ? 2 : si >= 2 ? 1.5 : 1,
                },
              ]}
            />

            {/* Fret cells */}
            <View style={{ flexDirection: 'row', height: cellHeight }}>
              {Array.from({ length: fretCount }, (_, fi) => {
                const fret = startFret + fi;
                const key = `${stringNum}-${fret}`;
                const highlight = highlightsMap.get(key);
                const isPressed = pressedCell === key;

                // Show inlay only on middle string (index 2)
                const showInlay =
                  si === 2 &&
                  DOT_FRETS.includes(fret) &&
                  !DOUBLE_DOT_FRETS.includes(fret) &&
                  !highlight;

                return (
                  <FretCell
                    key={fi}
                    stringNum={stringNum}
                    stringIndex={si}
                    fret={fret}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    dotSize={dotSize}
                    autoCompact={autoCompact}
                    tappable={tappable}
                    isLastString={isLastString}
                    highlight={highlight}
                    isPressed={isPressed}
                    showInlay={showInlay}
                    onPress={onCellPress}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  grid: {
    flex: 1,
    borderWidth: 1,
    borderColor: `${COLORS.textTertiary}40`,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  nut: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.textSecondary,
    zIndex: 5,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  stringLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    backgroundColor: '#666',
    transform: [{ translateY: -0.5 }],
    zIndex: 1,
  },
});
