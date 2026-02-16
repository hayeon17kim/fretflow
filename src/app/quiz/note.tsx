import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Circle as SvgCircle, Rect as SvgRect } from 'react-native-svg';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

type QuizState = 'question' | 'correct' | 'wrong';

// ─── Mini fretboard (read-only, 4-fret window) ───
function MiniFretboard({
  highlightFret,
  highlightString,
  state,
}: {
  highlightFret: number;
  highlightString: number;
  state: QuizState;
}) {
  const strings = 6;
  const fretStart = Math.max(0, highlightFret - 2);
  const fretEnd = fretStart + 4;
  const fretCount = fretEnd - fretStart + 1;
  const w = 260;
  const h = 140;
  const padX = 30;
  const padY = 16;
  const fretW = (w - padX * 2) / (fretCount - 1);
  const stringH = (h - padY * 2) / (strings - 1);

  const dotColor =
    state === 'correct' ? COLORS.correct : state === 'wrong' ? COLORS.wrong : COLORS.accent;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Fret lines */}
      {Array.from({ length: fretCount }, (_, i) => (
        <Line
          key={`f${i}`}
          x1={padX + i * fretW}
          y1={padY}
          x2={padX + i * fretW}
          y2={h - padY}
          stroke={COLORS.fretLine}
          strokeWidth={i === 0 && fretStart === 0 ? 3 : 1}
        />
      ))}
      {/* String lines */}
      {Array.from({ length: strings }, (_, i) => (
        <Line
          key={`s${i}`}
          x1={padX}
          y1={padY + i * stringH}
          x2={w - padX}
          y2={padY + i * stringH}
          stroke={COLORS.fretLine}
          strokeWidth={1}
        />
      ))}
      {/* Fret labels */}
      {Array.from({ length: fretCount }, (_, i) => (
        <SvgRect key={`fl${i}`} x={0} y={0} width={0} height={0} fill="none" />
      ))}
      {/* Highlight dot */}
      <SvgCircle
        cx={padX + (highlightFret - fretStart) * fretW - fretW / 2}
        cy={padY + highlightString * stringH}
        r={14}
        fill={dotColor}
      />
      <SvgRect
        x={padX + (highlightFret - fretStart) * fretW - fretW / 2 - 8}
        y={padY + highlightString * stringH - 8}
        width={16}
        height={16}
        fill="none"
      />
      {/* Highlight label handled below in Text overlay */}
    </Svg>
  );
}

// ─── Mock quiz data ───
const MOCK_QUESTIONS = [
  {
    string: 4,
    fret: 7,
    answer: 'E',
    options: ['A', 'E', 'D', 'B'],
    stringLabel: '5번줄',
    fretLabel: '7프렛',
  },
  {
    string: 5,
    fret: 3,
    answer: 'G',
    options: ['G', 'A', 'F', 'E'],
    stringLabel: '6번줄',
    fretLabel: '3프렛',
  },
  {
    string: 2,
    fret: 5,
    answer: 'E',
    options: ['D', 'C', 'E', 'F'],
    stringLabel: '3번줄',
    fretLabel: '5프렛',
  },
  {
    string: 0,
    fret: 1,
    answer: 'F',
    options: ['F', 'G', 'E', 'D'],
    stringLabel: '1번줄',
    fretLabel: '1프렛',
  },
  {
    string: 3,
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
        <MiniFretboard highlightFret={q.fret} highlightString={q.string} state={state} />
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
