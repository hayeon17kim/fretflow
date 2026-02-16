import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import type { FretPosition, IntervalName } from '@/types/music';
import { generateCardBatch, type IntervalQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import { getNoteAtPosition } from '@/utils/music';

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

  // Calculate fret range to show (show root - 1 to target + 2)
  const minFret = Math.max(0, card.rootPosition.fret - 1);
  const maxFret = Math.min(card.targetPosition.fret + 2, 15);

  return {
    id: card.id,
    root: card.rootPosition,
    correct: card.targetPosition,
    rootNote,
    answerNote,
    intervalName: `${intervalNameKo} ↑`,
    patternHint,
    fretRange: [minFret, maxFret],
  };
}

export default function QuizIntervalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview } = useSpacedRepetition();
  const params = useLocalSearchParams();

  // Get session size from params, default to 10
  const sessionSize = params.sessionSize ? parseInt(params.sessionSize as string, 10) : 10;

  // Generate cards for this session
  const questions = useMemo(() => {
    const generatedCards = generateCardBatch('interval', sessionSize) as IntervalQuestionCard[];
    return generatedCards.map((card) => adaptIntervalCard(card, t));
  }, [sessionSize, t]);

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

    // Record answer time
    const responseTime = recordAnswer(correct);

    // Add card to spaced repetition system (if not already exists)
    addCard({
      id: q.id,
      type: 'interval',
      question: { rootPosition: q.root, targetPosition: q.correct } as any,
    });

    // Record this review in SM-2 algorithm
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
          levelNum: '2',
        },
      });
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
        color: COLORS.level2,
        label: '?',
        textColor: '#fff',
        border: COLORS.level2,
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
      <QuizHeader
        label={t('quiz.interval.title')}
        levelNum={2}
        color={COLORS.level2}
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
          <Text style={{ color: COLORS.level2 }}>{q.intervalName}</Text>
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
              { backgroundColor: tapped ? COLORS.level2 : `${COLORS.level2}30` },
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
  },
  quizBadge: {
    alignSelf: 'center',
    backgroundColor: `${COLORS.level2}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  quizBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.level2,
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
    backgroundColor: `${COLORS.level2}10`,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.level2}20`,
  },
  hintTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.level2,
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
