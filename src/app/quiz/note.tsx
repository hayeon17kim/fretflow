import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Fretboard } from '@/components/Fretboard';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import { generateCardBatch, type NoteQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

export default function QuizNoteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview, getMasteredCards } = useSpacedRepetition();
  const params = useLocalSearchParams();
  const { showGoalToast } = useGoalAchievement();

  // Get session size from params, default to 10
  const sessionSize = params.sessionSize ? parseInt(params.sessionSize as string, 10) : 10;

  // Get mastered count for tier unlocking
  const masteredCount = getMasteredCards('note').length;

  // Generate cards at session start (once) with tier-based difficulty
  const questions = useMemo(
    () => generateCardBatch('note', sessionSize, masteredCount) as NoteQuestionCard[],
    [sessionSize, masteredCount],
  );

  const {
    currentCard: q,
    state,
    total,
    progress,
    correctCount,
    wrongCount,
    recordAnswer,
    nextCard,
  } = useQuizSession({
    cards: questions,
  });

  const handleAnswer = (index: number) => {
    if (state !== 'question') return;
    const correct = q.options[index] === q.answer;

    // Record response time
    const responseTime = recordAnswer(correct);

    // Add card (if not exists) & record review
    addCard({
      id: q.id,
      type: 'note',
      question: { string: q.string, fret: q.fret } as any,
    });
    recordReview(q.id, correct, responseTime);

    // Update daily statistics
    useAppStore.getState().incrementReview(correct);
  };

  const handleNext = () => {
    nextCard(() => {
      router.push({
        pathname: '/quiz/completion',
        params: {
          correct: correctCount.toString(),
          total: total.toString(),
          trackId: 'note',
        },
      });
    });
  };

  return (
    <View style={s.container}>
      <GoalAchievedToast visible={showGoalToast} />
      <QuizHeader
        label={t('quiz.note.title')}
        color={COLORS.track1}
        progress={progress}
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
          <NextButton onPress={handleNext} correct={state === 'correct'} />
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
