import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Fretboard } from '@/components/Fretboard';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { generateCardBatch, type NoteQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

type QuizState = 'question' | 'correct' | 'wrong';

const SESSION_SIZE = 10; // 한 세션당 카드 수

export default function QuizNoteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview } = useSpacedRepetition();

  // 세션 시작 시 카드 생성 (한 번만)
  const questions = useMemo(
    () => generateCardBatch('note', SESSION_SIZE) as NoteQuestionCard[],
    [],
  );
  const total = questions.length;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [state, setState] = useState<QuizState>('question');

  const q = questions[currentIdx];

  const handleAnswer = (index: number) => {
    if (state !== 'question') return;
    const correct = q.options[index] === q.answer;
    setState(correct ? 'correct' : 'wrong');

    // 응답 시간 기록
    const responseTime = Date.now() - startTime;

    // 카드 추가 (아직 없으면) & 리뷰 기록
    addCard({
      id: q.id,
      type: 'note',
      question: { string: q.string, fret: q.fret } as any,
    });
    recordReview(q.id, correct, responseTime);
  };

  const nextCard = () => {
    if (currentIdx + 1 >= total) {
      // 세션 완료
      router.back();
      return;
    }
    setCurrentIdx((prev) => prev + 1);
    setState('question');
    setStartTime(Date.now()); // 다음 카드 시작 시간 리셋
  };

  return (
    <View style={s.container}>
      <QuizHeader
        label={t('quiz.note.title')}
        levelNum={1}
        color={COLORS.level1}
        progress={currentIdx + (state !== 'question' ? 1 : 0)}
        total={total}
        onBack={() => router.back()}
      />

      {/* Card */}
      <QuizCard state={state}>
        <Text style={s.positionLabel}>
          {t('quiz.note.position', { string: q.string, fret: q.fret })}
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
              <Text style={s.soundTag}>{t('quiz.note.soundPlay')}</Text>
              <Text style={s.resultCorrect}>{t('quiz.note.correct')}</Text>
            </View>
          )}
          {state === 'wrong' && (
            <View style={s.resultRow}>
              <Text
                style={[s.soundTag, { color: COLORS.wrong, backgroundColor: `${COLORS.wrong}15` }]}
              >
                {t('quiz.note.wrongSound')}
              </Text>
              <Text style={s.resultWrong}>{t('quiz.note.wrongAnswer', { answer: q.answer })}</Text>
            </View>
          )}
          {state === 'question' && <Text style={s.questionText}>{t('quiz.note.question')}</Text>}
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
