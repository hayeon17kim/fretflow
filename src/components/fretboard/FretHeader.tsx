import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/utils/constants';

const DOT_FRETS = [3, 5, 7, 9, 12, 15];

interface FretHeaderProps {
  startFret: number;
  fretCount: number;
  cellWidth: number;
  autoCompact: boolean;
  marginLeft: number;
}

export function FretHeader({
  startFret,
  fretCount,
  cellWidth,
  autoCompact,
  marginLeft,
}: FretHeaderProps) {
  return (
    <View style={[s.header, { marginLeft }]}>
      {Array.from({ length: fretCount }, (_, i) => {
        const fretNum = startFret + i;
        const isDotFret = DOT_FRETS.includes(fretNum);

        return (
          <View key={fretNum} style={{ width: cellWidth, alignItems: 'center' }}>
            <Text
              style={[
                s.fretNumber,
                {
                  fontSize: autoCompact ? 8 : 9,
                  color: isDotFret ? COLORS.textSecondary : COLORS.textTertiary,
                  fontWeight: isDotFret ? '700' : '400',
                },
              ]}
            >
              {fretNum === 0 ? '0' : fretNum}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fretNumber: {
    textAlign: 'center',
  },
});
