import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { SoftGuideModal } from '@/components/SoftGuideModal';
import { QUIZ_ROUTES } from '@/config/routes';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizInit } from '@/hooks/useQuizInit';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import type { FretPosition, StringNumber } from '@/types/music';
import type { ScaleQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import { navigateToQuizCompletion, recordQuizAnswer } from '@/utils/quizHelpers';

// ─── Adapt generated cards to tap-based format ───
interface TapScaleQuestion {
  id: string;
  name: string; // e.g., "C Pentatonic Minor"
  position: string; // e.g., "Position 1"
  scaleName: string;
  rootNote: string;
  rootPosition: FretPosition;
  positions: FretPosition[];
  fretRange: [number, number];
  hint: string;
}

function adaptScaleCard(
  card: ScaleQuestionCard,
  t: (key: string, params?: any) => string,
): TapScaleQuestion {
  const scaleNameKo = t(`quiz.scale.scaleNames.${card.scaleName}`);
  const hint = t(`quiz.scale.patternHints.${card.scaleName}`);

  // Calculate fret range — consistent window, clamped to avoid overflow
  const MAX_FRET = 17;
  const MIN_WINDOW = 8;
  const MAX_WINDOW = 10;
  const frets = card.correctPositions.map((p) => p.fret);
  const naturalMin = Math.max(0, Math.min(...frets) - 1);
  const naturalMax = Math.min(Math.max(...frets) + 2, MAX_FRET);
  const span = naturalMax - naturalMin;
  const window = Math.max(MIN_WINDOW, Math.min(MAX_WINDOW, span));
  // Center the window, clamped to valid range
  const idealStart = Math.max(0, naturalMin - Math.floor((window - span) / 2));
  const startFret = Math.min(idealStart, Math.max(0, MAX_FRET - window));
  const endFret = Math.min(startFret + window, MAX_FRET);

  return {
    id: card.id,
    name: `${card.rootNote} ${scaleNameKo}`,
    position: t('quiz.scale.position', { number: 1 }),
    scaleName: card.scaleName,
    rootNote: card.rootNote,
    rootPosition: card.rootPosition,
    positions: card.correctPositions,
    fretRange: [startFret, endFret],
    hint,
  };
}

interface Score {
  correct: number;
  wrong: number;
  missed: number;
  total: number;
  accuracy: number;
}

export default function QuizScaleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview } = useSpacedRepetition();
  const { showGoalToast } = useGoalAchievement();

  // Stable reference so useQuizInit's useMemo doesn't regenerate cards on every render
  const adaptCard = useCallback(
    (card: ScaleQuestionCard) => adaptScaleCard(card, t),
    [t],
  );

  // Initialize quiz with tier-based progression
  const { questions } = useQuizInit<TapScaleQuestion>({
    trackId: 'scale',
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
  const [selected, setSelected] = useState<FretPosition[]>([]);
  const [score, setScore] = useState<Score | null>(null);

  // Soft guide for first visit (Issue #22)
  const trackFirstVisit = useAppStore((s) => s.trackFirstVisit);
  const markTrackVisited = useAppStore((s) => s.markTrackVisited);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!trackFirstVisit.scale) {
      setShowGuide(true);
    }
  }, [trackFirstVisit.scale]);

  const handleContinue = () => {
    markTrackVisited('scale');
    setShowGuide(false);
  };

  const handleGoToLevel1 = () => {
    markTrackVisited('scale');
    setShowGuide(false);
    router.replace(QUIZ_ROUTES.note);
  };

  const isSelected = (s: StringNumber, f: number) =>
    selected.some((p) => p.string === s && p.fret === f);
  const isScalePos = (s: StringNumber, f: number) =>
    q.positions.some((p) => p.string === s && p.fret === f);

  const handleTap = (pos: FretPosition) => {
    if (state !== 'question') return;
    if (isSelected(pos.string, pos.fret)) {
      setSelected((prev) => prev.filter((p) => !(p.string === pos.string && p.fret === pos.fret)));
    } else {
      setSelected((prev) => [...prev, pos]);
    }
  };

  const checkAnswer = () => {
    const correctSelections = selected.filter((p) => isScalePos(p.string, p.fret)).length;
    const wrongSelections = selected.filter((p) => !isScalePos(p.string, p.fret)).length;
    const missedPositions = q.positions.filter((p) => !isSelected(p.string, p.fret)).length;
    const totalScale = q.positions.length;
    const accuracy = Math.round((correctSelections / totalScale) * 100);

    setScore({
      correct: correctSelections,
      wrong: wrongSelections,
      missed: missedPositions,
      total: totalScale,
      accuracy,
    });

    const correct = accuracy >= 80 && wrongSelections === 0;

    recordQuizAnswer({
      cardId: q.id,
      trackId: 'scale',
      isCorrect: correct,
      questionData: {
        scaleName: q.scaleName,
        positions: q.positions,
      } as any,
      recordAnswer,
      addCard,
      recordReview,
    });
  };

  const handleNext = () => {
    nextCard(() => {
      navigateToQuizCompletion({ router, correctCount, total, trackId: 'scale' });
    });
    setSelected([]);
    setScore(null);
  };

  const buildHighlights = (): FretHighlight[] => {
    const highlights: FretHighlight[] = [];

    for (let s = 1; s <= 6; s++) {
      const str = s as StringNumber;
      for (let f = q.fretRange[0]; f <= q.fretRange[1]; f++) {
        const sel = isSelected(str, f);
        const isScale = isScalePos(str, f);

        if (state === 'question') {
          if (sel) {
            highlights.push({
              string: str,
              fret: f,
              color: COLORS.track3,
              label: '●',
              textColor: '#fff',
            });
          }
        } else {
          if (isScale && sel) {
            highlights.push({ string: str, fret: f, color: COLORS.correct, label: '✓' });
          } else if (isScale && !sel) {
            highlights.push({
              string: str,
              fret: f,
              color: `${COLORS.correct}40`,
              label: '○',
              textColor: COLORS.correct,
              border: COLORS.correct,
              opacity: 0.6,
            });
          } else if (!isScale && sel) {
            highlights.push({
              string: str,
              fret: f,
              color: COLORS.wrong,
              label: '✕',
              textColor: '#fff',
            });
          }
        }
      }
    }

    return highlights;
  };

  return (
    <View style={s.container}>
      <GoalAchievedToast visible={showGoalToast} />
      <QuizHeader
        label={t('quiz.scale.title')}
        color={COLORS.track3}
        progress={progress}
        total={total}
        onBack={() => router.back()}
      />

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
          <Text style={s.quizBadgeText}>{t('quiz.scale.badge')}</Text>
        </View>

        <Text style={s.questionMain}>
          {q.name}{' '}
          <Text style={{ color: COLORS.track3 }}>{q.position}</Text>
        </Text>
        <Text style={s.questionSub}>{t('quiz.scale.questionSub')}</Text>

        <Fretboard
          startFret={q.fretRange[0]}
          endFret={q.fretRange[1]}
          highlights={buildHighlights()}
          tappable={state === 'question'}
          onTap={handleTap}
        />

        {/* Pattern hint */}
        {state !== 'question' && (
          <View style={s.hintBox}>
            <Text style={s.hintTitle}>{t('quiz.scale.patternTip')}</Text>
            <Text style={s.hintText}>{q.hint}</Text>
          </View>
        )}

        {/* Score */}
        <View style={s.scoreArea}>
          {state === 'correct' && score && (
            <Text style={s.resultCorrect}>
              {t('quiz.scale.correctAnswer', {
                correct: score.correct,
                total: score.total,
                accuracy: score.accuracy,
              })}
            </Text>
          )}
          {state === 'wrong' && score && (
            <View style={{ alignItems: 'center' }}>
              <Text style={s.resultWrong}>
                {t('quiz.scale.wrongAnswer', { correct: score.correct, total: score.total })}
                {score.wrong > 0 ? ` · ${t('quiz.scale.wrongCount', { count: score.wrong })}` : ''}
                {score.missed > 0
                  ? ` · ${t('quiz.scale.missedCount', { count: score.missed })}`
                  : ''}
              </Text>
              <Text style={s.scoreSub}>{t('quiz.scale.scoreSub')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom button */}
      <View style={s.bottomArea}>
        {state === 'question' ? (
          <Pressable
            onPress={checkAnswer}
            disabled={selected.length === 0}
            style={({ pressed }) => [
              s.confirmBtn,
              { backgroundColor: selected.length > 0 ? COLORS.track3 : `${COLORS.track3}40` },
              pressed && selected.length > 0 && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[s.confirmText, { color: selected.length > 0 ? '#fff' : COLORS.textTertiary }]}
            >
              {t('quiz.scale.confirmButton', { count: selected.length })}
            </Text>
          </Pressable>
        ) : (
          <NextButton onPress={handleNext} correct={state === 'correct'} />
        )}
      </View>

      {/* Soft guide modal for first visit (Issue #22) */}
      <SoftGuideModal
        visible={showGuide}
        trackId="scale"
        onContinue={handleContinue}
        onGoToLevel1={handleGoToLevel1}
      />
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
    maxHeight: 440,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  quizBadge: {
    alignSelf: 'center',
    backgroundColor: `${COLORS.track3}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  quizBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.track3,
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
    backgroundColor: `${COLORS.track3}10`,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.track3}20`,
  },
  hintTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.track3,
    marginBottom: 2,
  },
  hintText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  scoreArea: {
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
  scoreSub: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginTop: 2,
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
