import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE } from '@/utils/constants';

interface AnswerGridProps {
  options: string[];
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function AnswerGrid({ options, onSelect, disabled }: AnswerGridProps) {
  return (
    <View style={s.grid}>
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          onPress={() => !disabled && onSelect(i)}
          style={({ pressed }) => [s.btn, pressed && !disabled && s.pressed]}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`답안 ${opt}`}
          accessibilityHint="이 답을 선택하려면 탭하세요"
          accessibilityState={{ disabled }}
        >
          <Text style={s.btnText}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

interface NextButtonProps {
  onPress: () => void;
  correct: boolean;
}

export function NextButton({ onPress, correct }: NextButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.nextBtn,
        { backgroundColor: correct ? COLORS.correct : COLORS.surface },
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="다음 문제"
      accessibilityHint={
        correct ? '정답입니다. 다음 문제로 이동합니다' : '오답입니다. 다음 문제로 이동합니다'
      }
    >
      <Text style={[s.nextText, { color: correct ? COLORS.bg : COLORS.textPrimary }]}>다음 →</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  btn: {
    width: '48%',
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  btnText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nextBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
