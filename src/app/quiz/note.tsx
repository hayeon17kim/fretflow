import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fretboard } from '@/components/Fretboard';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import type { StringNumber } from '@/types/music';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

type QuizState = 'question' | 'correct' | 'wrong';

// ─── Mock quiz data ───
const MOCK_QUESTIONS = [
  {
    string: 5 as StringNumber,
    fret: 7,
    answer: 'E',
    options: ['A', 'E', 'D', 'B'],
    stringLabel: '5번줄',
    fretLabel: '7프렛',
  },
  {
    string: 6 as StringNumber,
    fret: 3,
    answer: 'G',
    options: ['G', 'A', 'F', 'E'],
    stringLabel: '6번줄',
    fretLabel: '3프렛',
  },
  {
    string: 3 as StringNumber,
    fret: 5,
    answer: 'E',
    options: ['D', 'C', 'E', 'F'],
    stringLabel: '3번줄',
    fretLabel: '5프렛',
  },
  {
    string: 1 as StringNumber,
    fret: 1,
    answer: 'F',
    options: ['F', 'G', 'E', 'D'],
    stringLabel: '1번줄',
    fretLabel: '1프렛',
  },
  {
    string: 4 as StringNumber,
    fret: 2,
    answer: 'E',
    options: ['A', 'B', 'E', 'D'],
    stringLabel: '4번줄',
    fretLabel: '2프렛',
  },
];

export default function QuizNoteScreen() {
  const router = useRouter();
  const total = MOCK_QUESTIONS.length;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<QuizState>('question');

  const q = MOCK_QUESTIONS[currentIdx];

  const handleAnswer = (index: number) => {
    if (state !== 'question') return;
    setState(q.options[index] === q.answer ? 'correct' : 'wrong');
  };

  const nextCard = () => {
    if (currentIdx + 1 >= total) {
      // Session complete — go back for now
      router.back();
      return;
    }
    setCurrentIdx((prev) => prev + 1);
    setState('question');
  };

  return (
    <View style={s.container}>
      <QuizHeader
        label="음 위치"
        levelNum={1}
        color={COLORS.level1}
        progress={currentIdx + (state !== 'question' ? 1 : 0)}
        total={total}
        onBack={() => router.back()}
      />

      {/* Card */}
      <QuizCard state={state}>
        <Text style={s.positionLabel}>
          {q.stringLabel} · {q.fretLabel}
        </Text>
        <Fretboard
          startFret={Math.max(0, q.fret - 2)}
          endFret={Math.max(0, q.fret - 2) + 4}
          highlights={[
            {
              string: q.string,
              fret: q.fret,
              color:
                state === 'correct'
                  ? COLORS.correct
                  : state === 'wrong'
                    ? COLORS.wrong
                    : COLORS.accent,
              label: state !== 'question' ? q.answer : '?',
            },
          ]}
        />
        <View style={s.resultArea}>
          {state === 'correct' && (
            <View style={s.resultRow}>
              <Text style={s.soundTag}>🔊 소리 재생</Text>
              <Text style={s.resultCorrect}>정답!</Text>
            </View>
          )}
          {state === 'wrong' && (
            <View style={s.resultRow}>
              <Text
                style={[s.soundTag, { color: COLORS.wrong, backgroundColor: `${COLORS.wrong}15` }]}
              >
                🔇 오답음
              </Text>
              <Text style={s.resultWrong}>정답은 {q.answer}</Text>
            </View>
          )}
          {state === 'question' && <Text style={s.questionText}>이 음은?</Text>}
        </View>
      </QuizCard>

      {/* Answer area */}
      <View style={s.answerArea}>
        {state === 'question' ? (
          <AnswerGrid options={q.options} onSelect={handleAnswer} />
        ) : (
          <NextButton onPress={nextCard} correct={state === 'correct'} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.xl,
    paddingTop: 54,
    paddingBottom: 40,
  },
  positionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  resultArea: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  soundTag: {
    fontSize: 10,
    color: COLORS.correct,
    backgroundColor: `${COLORS.correct}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  resultCorrect: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: '700',
    color: COLORS.correct,
  },
  resultWrong: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: '700',
    color: COLORS.wrong,
  },
  questionText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  answerArea: {
    marginTop: SPACING.lg,
  },
});
