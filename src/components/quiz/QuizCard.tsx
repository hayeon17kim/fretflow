import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, SPACING } from '@/utils/constants';

type QuizState = 'question' | 'correct' | 'wrong';

interface QuizCardProps {
  state: QuizState;
  children: ReactNode;
}

export function QuizCard({ state, children }: QuizCardProps) {
  const borderColor =
    state === 'correct' ? COLORS.correct : state === 'wrong' ? COLORS.wrong : COLORS.border;

  return <View style={[s.card, { borderColor }]}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    maxHeight: 340,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.lg + 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
