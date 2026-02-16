import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FRETBOARD } from '@/utils/constants';

interface StringColumnProps {
  cellHeight: number;
  autoCompact: boolean;
}

export function StringColumn({ cellHeight, autoCompact }: StringColumnProps) {
  return (
    <View style={s.column}>
      {FRETBOARD.standardTuning.map((note, i) => (
        <View
          key={i}
          style={{ height: cellHeight, justifyContent: 'center', alignItems: 'flex-end' }}
        >
          <Text
            style={[
              s.label,
              {
                fontSize: autoCompact ? 8 : 10,
                width: autoCompact ? 16 : 20,
              },
            ]}
          >
            {note}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  column: {
    paddingRight: 5,
  },
  label: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
});
