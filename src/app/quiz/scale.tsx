import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import type { FretPosition, StringNumber } from '@/types/music';
import { generateCardBatch, type ScaleQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

const SESSION_SIZE = 10;

// ─── Adapt generated cards to tap-based format ───
interface TapScaleQuestion {
  id: string;
  name: string;           // e.g., "C Pentatonic Minor"
  position: string;       // e.g., "Position 1"
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

  // Calculate fret range from correctPositions
  const frets = card.correctPositions.map((p) => p.fret);
  const minFret = Math.min(...frets);
  const maxFret = Math.min(Math.max(...frets) + 2, 15);

  return {
    id: card.id,
    name: `${card.rootNote} ${scaleNameKo}`,
    position: t('quiz.scale.position', { number: 1 }),
    scaleName: card.scaleName,
    rootNote: card.rootNote,
    rootPosition: card.rootPosition,
    positions: card.correctPositions,
    fretRange: [minFret, maxFret],
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

  // Generate cards for this session
  const questions = useMemo(() => {
    const generatedCards = generateCardBatch('scale', SESSION_SIZE) as ScaleQuestionCard[];
    return generatedCards.map(card => adaptScaleCard(card, t));
  }, [t]);

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

    // Record answer and get response time
    const responseTime = recordAnswer(correct);

    // Add card to spaced repetition system
    addCard({
      id: q.id,
      type: 'scale',
      question: {
        scaleName: q.scaleName,
        positions: q.positions,
      } as any,
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
          levelNum: '3',
        },
      });
    });
    setSelected([]);
    setScore(null);
  };

  const buildHighlights = (): FretHighlight[] => {
    const highlights: FretHighlight[] = [];

    for (let s = 1; s <= 6; s++) {
      const str = s as StringNumber;
      for (let f = 0; f <= 4; f++) {
        const sel = isSelected(str, f);
        const isScale = isScalePos(str, f);

        if (state === 'question') {
          if (sel) {
            highlights.push({
              string: str,
              fret: f,
              color: COLORS.level3,
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
      <QuizHeader
        label={t('quiz.scale.title')}
        levelNum={3}
        color={COLORS.level3}
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
          {
            t('quiz.scale.questionMain', {
              scaleName: q.name,
              position: q.position,
            }).split(q.position)[0]
          }
          {q.name} <Text style={{ color: COLORS.level3 }}>{q.position}</Text>
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
              { backgroundColor: selected.length > 0 ? COLORS.level3 : `${COLORS.level3}40` },
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
  },
  quizBadge: {
    alignSelf: 'center',
    backgroundColor: `${COLORS.level3}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  quizBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.level3,
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
    backgroundColor: `${COLORS.level3}10`,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.level3}20`,
  },
  hintTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.level3,
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
