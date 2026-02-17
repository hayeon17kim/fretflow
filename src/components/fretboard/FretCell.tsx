import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { FretPosition, StringNumber } from '@/types/music';
import { COLORS } from '@/utils/constants';
import type { FretHighlight } from '../Fretboard';
import { HighlightDot } from './HighlightDot';
import { InlayMarker } from './InlayMarker';

interface FretCellProps {
  stringNum: StringNumber;
  stringIndex: number;
  fret: number;
  cellWidth: number;
  cellHeight: number;
  dotSize: number;
  autoCompact: boolean;
  tappable: boolean;
  isLastString: boolean;
  highlight?: FretHighlight;
  isPressed: boolean;
  showInlay: boolean;
  onPress: (pos: FretPosition) => void;
}

export const FretCell = memo(
  function FretCell({
    stringNum,
    stringIndex,
    fret,
    cellWidth,
    cellHeight,
    dotSize,
    autoCompact,
    tappable,
    isLastString,
    highlight,
    isPressed,
    showInlay,
    onPress,
  }: FretCellProps) {
    const handlePress = useCallback(() => {
      onPress({ string: stringNum, fret });
    }, [stringNum, fret, onPress]);

    return (
      <Pressable
        onPress={handlePress}
        disabled={!tappable}
        style={({ pressed }) => [
          s.cell,
          {
            width: cellWidth,
            height: cellHeight,
            backgroundColor:
              isPressed || pressed
                ? 'rgba(255,255,255,0.12)'
                : tappable && !highlight
                  ? 'rgba(255,255,255,0.02)'
                  : 'transparent',
            borderRightWidth: 1.5,
            borderRightColor: COLORS.fretLine,
            borderBottomWidth: 0,
          },
        ]}
      >
        {/* Inlay marker */}
        <InlayMarker visible={showInlay} />

        {/* Highlight or empty dot */}
        {highlight ? (
          <HighlightDot
            label={highlight.label}
            color={highlight.color}
            textColor={highlight.textColor}
            border={highlight.border}
            opacity={highlight.opacity}
            size={dotSize}
            autoCompact={autoCompact}
            isPressed={isPressed}
          />
        ) : tappable ? (
          <View
            style={[
              s.emptyDot,
              {
                width: dotSize - 4,
                height: dotSize - 4,
                borderRadius: (dotSize - 4) / 2,
                backgroundColor: isPressed
                  ? `${COLORS.textTertiary}40`
                  : `${COLORS.textTertiary}10`,
              },
            ]}
          />
        ) : null}
      </Pressable>
    );
  },
  // Custom comparison function for performance
  (prevProps, nextProps) => {
    return (
      prevProps.isPressed === nextProps.isPressed &&
      prevProps.highlight === nextProps.highlight &&
      prevProps.tappable === nextProps.tappable &&
      prevProps.cellWidth === nextProps.cellWidth &&
      prevProps.cellHeight === nextProps.cellHeight
    );
  },
);

const s = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  emptyDot: {
    borderWidth: 1.5,
    borderColor: `${COLORS.textTertiary}60`,
    zIndex: 3,
  },
});
