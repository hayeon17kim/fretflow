import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { FretPosition, StringNumber } from '@/types/music';
import { COLORS } from '@/utils/constants';
import { FretGrid } from './fretboard/FretGrid';
import { FretHeader } from './fretboard/FretHeader';
import { OnboardingOverlay } from './fretboard/OnboardingOverlay';
import { StringColumn } from './fretboard/StringColumn';

// 프렛보드 하이라이트 정보
export interface FretHighlight {
  string: StringNumber;
  fret: number;
  color: string;
  label?: string;
  border?: string;
  textColor?: string;
  opacity?: number;
}

interface FretboardProps {
  startFret?: number;
  endFret?: number;
  highlights?: FretHighlight[];
  onTap?: (pos: FretPosition) => void;
  tappable?: boolean;
  compact?: boolean;
  showOnboarding?: boolean;
}

export function Fretboard({
  startFret = 0,
  endFret = 15,
  highlights = [],
  onTap,
  tappable = false,
  compact = false,
  showOnboarding = false,
}: FretboardProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const [pressedCell, setPressedCell] = useState<string | null>(null);

  // Calculations
  const fretCount = endFret - startFret + 1;
  const autoCompact = compact || fretCount > 6;

  // padding(12*2) + border(1*2) + stringColumn(~28) = ~54px overhead
  const availableWidth = screenWidth - 54;
  const cellW = useMemo(
    () =>
      autoCompact
        ? Math.max(20, Math.min(32, Math.floor(availableWidth / fretCount)))
        : 36,
    [autoCompact, fretCount, availableWidth],
  );
  const cellH = autoCompact ? 30 : 34;
  const dotSize = autoCompact ? 18 : 24;

  const handleCellPress = useCallback(
    (pos: FretPosition) => {
      if (!tappable || !onTap) return;

      // Flash feedback (200ms)
      const key = `${pos.string}-${pos.fret}`;
      setPressedCell(key);
      setTimeout(() => setPressedCell(null), 200);

      onTap(pos);
    },
    [tappable, onTap],
  );

  return (
    <View style={s.container}>
      <OnboardingOverlay visible={showOnboarding} />

      <FretHeader
        startFret={startFret}
        fretCount={fretCount}
        cellWidth={cellW}
        autoCompact={autoCompact}
        marginLeft={autoCompact ? 22 : 28}
      />

      <View style={s.body}>
        <StringColumn cellHeight={cellH} autoCompact={autoCompact} />

        <FretGrid
          startFret={startFret}
          fretCount={fretCount}
          cellWidth={cellW}
          cellHeight={cellH}
          dotSize={dotSize}
          autoCompact={autoCompact}
          tappable={tappable}
          highlights={highlights}
          pressedCell={pressedCell}
          onCellPress={handleCellPress}
        />
      </View>

      {tappable && <Text style={s.hint}>{t('fretboard.tappableHint')}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  body: {
    flexDirection: 'row',
  },
  hint: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 9,
    color: COLORS.textTertiary,
    letterSpacing: 0.3,
  },
});
