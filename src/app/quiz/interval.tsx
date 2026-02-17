import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizInit } from '@/hooks/useQuizInit';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import type { FretPosition } from '@/types/music';
import type { IntervalQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import { getNoteAtPosition } from '@/utils/music';
import { navigateToQuizCompletion, recordQuizAnswer } from '@/utils/quizHelpers';

// ─── Adapt generated cards to tap-based format ───
interface TapIntervalQuestion {
  id: string;
  root: FretPosition;
  correct: FretPosition;
  rootNote: string;
  answerNote: string;
  intervalName: string;
  patternHint: string;
  fretRange: [number, number];
}

function adaptIntervalCard(
  card: IntervalQuestionCard,
  t: (key: string) => string,
): TapIntervalQuestion {
  const rootNote = getNoteAtPosition(card.rootPosition);
  const answerNote = getNoteAtPosition(card.targetPosition);
  const intervalNameKo = t(`quiz.interval.intervalNames.${card.answer}`);
  const patternHint = t(`quiz.interval.patternHints.${card.answer}`);

  // Calculate fret range — consistent window so fretboard doesn't resize between questions
  const MAX_FRET = 17;
  const MIN_WINDOW = 8;
  const naturalMin = Math.max(0, Math.min(card.rootPosition.fret, card.targetPosition.fret) - 1);
  const naturalMax = Math.min(Math.max(card.rootPosition.fret, card.targetPosition.fret) + 2, MAX_FRET);
  const span = naturalMax - naturalMin;
  const window = Math.max(MIN_WINDOW, span);
  // Center the window around the root/target, clamped to valid range
  const idealStart = Math.max(0, naturalMin - Math.floor((window - span) / 2));
  const startFret = Math.min(idealStart, Math.max(0, MAX_FRET - window));
  const endFret = Math.min(startFret + window, MAX_FRET);

  return {
    id: card.id,
    root: card.rootPosition,
    correct: card.targetPosition,
    rootNote,
    answerNote,
    intervalName: `${intervalNameKo} ↑`,
    patternHint,
    fretRange: [startFret, endFret],
  };
}

export default function QuizIntervalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview } = useSpacedRepetition();
  const { showGoalToast } = useGoalAchievement();

  // Stable reference so useQuizInit's useMemo doesn't regenerate cards on every render
  const adaptCard = useCallback(
    (card: IntervalQuestionCard) => adaptIntervalCard(card, t),
    [t],
  );

  // Initialize quiz with tier-based progression
  const { questions } = useQuizInit<TapIntervalQuestion>({
    trackId: 'interval',
    adaptCard,
  });

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
  const [tapped, setTapped] = useState<FretPosition | null>(null);

  const handleTap = (pos: FretPosition) => {
    if (state !== 'question') return;
    if (tapped?.string === pos.string && tapped?.fret === pos.fret) {
      setTapped(null);
    } else {
      setTapped(pos);
    }
  };

  const confirmAnswer = () => {
    if (!tapped) return;
    const correct = tapped.string === q.correct.string && tapped.fret === q.correct.fret;

    recordQuizAnswer({
      cardId: q.id,
      trackId: 'interval',
      isCorrect: correct,
      questionData: { rootPosition: q.root, targetPosition: q.correct } as any,
      recordAnswer,
      addCard,
      recordReview,
    });
  };

  const handleNext = () => {
    nextCard(() => {
      navigateToQuizCompletion({ router, correctCount, total, trackId: 'interval' });
    });
    setTapped(null);
  };

  const buildHighlights = (): FretHighlight[] => {
    const highlights: FretHighlight[] = [
      // Root position (always shown)
      { string: q.root.string, fret: q.root.fret, color: COLORS.correct, label: q.rootNote },
    ];

    // Show user's current selection (before confirming)
    if (state === 'question' && tapped) {
      highlights.push({
        string: tapped.string,
        fret: tapped.fret,
        color: COLORS.track2,
        label: '?',
        textColor: '#fff',
        border: COLORS.track2,
      });
    }

    // Show correct answer after submission
    if (state === 'correct') {
      highlights.push({
        string: q.correct.string,
        fret: q.correct.fret,
        color: COLORS.correct,
        label: q.answerNote,
      });
    }

    // Show both wrong and correct after wrong answer
    if (state === 'wrong') {
      if (tapped) {
        highlights.push({
          string: tapped.string,
          fret: tapped.fret,
          color: COLORS.wrong,
          label: '✕',
          textColor: '#fff',
        });
      }
      highlights.push({
        string: q.correct.string,
        fret: q.correct.fret,
        color: COLORS.correct,
        label: q.answerNote,
        border: COLORS.correct,
      });
    }

    return highlights;
  };

  return (
    <View style={s.container}>
      <GoalAchievedToast visible={showGoalToast} />
      <QuizHeader
        label={t('quiz.interval.title')}
        color={COLORS.track2}
        progress={progress}
        total={total}
        onBack={() => router.back()}
      />

      {/* Card */}
      <View
        style={[
          s.card,
          {
            borderColor:
              state === 'correct'
                ? COLORS.correct
                : state === 'wrong'
                  ? COLORS.wrong
                  : COLORS.border,
          },
        ]}
      >
        <View style={s.quizBadge}>
          <Text style={s.quizBadgeText}>{t('quiz.interval.badge')}</Text>
        </View>

        <Text style={s.questionMain}>
          {t('quiz.interval.questionMain', { rootNote: q.rootNote, intervalName: '' })}{' '}
          <Text style={{ color: COLORS.track2 }}>{q.intervalName}</Text>
        </Text>
        <Text style={s.questionSub}>{t('quiz.interval.questionSub')}</Text>

        <Fretboard
          startFret={q.fretRange[0]}
          endFret={q.fretRange[1]}
          highlights={buildHighlights()}
          tappable={state === 'question'}
          onTap={handleTap}
        />

        {/* Pattern hint — after answer */}
        {state !== 'question' && (
          <View style={s.hintBox}>
            <Text style={s.hintTitle}>{t('quiz.interval.patternRule')}</Text>
            <Text style={s.hintText}>{q.patternHint}</Text>
          </View>
        )}

        <View style={s.resultArea}>
          {state === 'correct' && (
            <Text style={s.resultCorrect}>
              {t('quiz.interval.correctAnswer', {
                rootNote: q.rootNote,
                answerNote: q.answerNote,
                intervalName: q.intervalName.replace(' ↑', ''),
              })}
            </Text>
          )}
          {state === 'wrong' && (
            <Text style={s.resultWrong}>
              {t('quiz.interval.wrongAnswer', {
                string: q.correct.string + 1,
                fret: q.correct.fret,
                answerNote: q.answerNote,
              })}
            </Text>
          )}
        </View>
      </View>

      {/* Bottom button */}
      <View style={s.bottomArea}>
        {state === 'question' ? (
          <Pressable
            onPress={confirmAnswer}
            disabled={!tapped}
            style={({ pressed }) => [
              s.confirmBtn,
              { backgroundColor: tapped ? COLORS.track2 : `${COLORS.track2}30` },
              pressed && tapped && { opacity: 0.8 },
            ]}
          >
            <Text style={[s.confirmText, { color: tapped ? '#fff' : COLORS.textTertiary }]}>
              {tapped ? t('quiz.interval.confirmButton') : t('quiz.interval.selectPosition')}
            </Text>
          </Pressable>
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
  card: {
    flex: 1,
    maxHeight: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  quizBadge: {
    alignSelf: 'center',
    backgroundColor: `${COLORS.track2}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  quizBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.track2,
  },
  questionMain: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  questionSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  hintBox: {
    marginTop: SPACING.sm,
    backgroundColor: `${COLORS.track2}10`,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.track2}20`,
  },
  hintTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.track2,
    marginBottom: 2,
  },
  hintText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  resultArea: {
    marginTop: 'auto',
    paddingTop: SPACING.sm,
    alignItems: 'center',
  },
  resultCorrect: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.correct,
  },
  resultWrong: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.wrong,
  },
  bottomArea: {
    marginTop: SPACING.md,
  },
  confirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
