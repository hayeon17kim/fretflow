/**
 * Scale Phase 1: O/X Judgment
 *
 * Shows one note position and asks if it's in the scale.
 * User answers with O (in scale) or X (not in scale) buttons.
 */

import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import type { FretPosition, StringNumber } from '@/types/music';
import type { ScaleQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import type { QuizState } from '@/types/quiz';

interface Props {
  card: ScaleQuestionCard;
  state: QuizState;
  onAnswer: (correct: boolean) => void;
}

export function ScalePhase1View({ card, state, onAnswer }: Props) {
  const { t } = useTranslation();

  if (!card.checkPosition || card.isInScale === undefined) {
    throw new Error('[ScalePhase1View] Missing checkPosition or isInScale');
  }

  const scaleNameKo = t(`quiz.scale.scaleNames.${card.scaleName}`);
  const checkPos = card.checkPosition;

  // Calculate fret range to display (show context around check position)
  const startFret = Math.max(0, checkPos.fret - 2);
  const endFret = Math.min(17, checkPos.fret + 2);

  const handleAnswer = (userSaysInScale: boolean) => {
    if (state !== 'question') return;
    const correct = userSaysInScale === card.isInScale;
    onAnswer(correct);
  };

  const buildHighlights = (): FretHighlight[] => {
    const highlights: FretHighlight[] = [];

    // Show root position always (reference point)
    highlights.push({
      string: card.rootPosition.string,
      fret: card.rootPosition.fret,
      color: `${COLORS.track3}40`,
      label: '●',
      textColor: COLORS.track3,
      border: COLORS.track3,
    });

    // Show check position
    if (state === 'question') {
      // During question: highlight in neutral color
      highlights.push({
        string: checkPos.string,
        fret: checkPos.fret,
        color: COLORS.track3,
        label: '?',
        textColor: '#fff',
      });
    } else {
      // After answer: show correct/wrong
      const correct = state === 'correct';
      highlights.push({
        string: checkPos.string,
        fret: checkPos.fret,
        color: correct ? COLORS.correct : COLORS.wrong,
        label: correct ? '✓' : '✕',
        textColor: '#fff',
      });
    }

    return highlights;
  };

  return (
    <View style={s.container}>
      <View style={s.quizBadge}>
        <Text style={s.quizBadgeText}>{t('quiz.scale.badge')}</Text>
      </View>

      <Text style={s.questionMain}>
        {card.rootNote} {scaleNameKo}
      </Text>
      <Text style={s.questionSub}>{t('quiz.scale.phase1.question')}</Text>

      <Fretboard
        startFret={startFret}
        endFret={endFret}
        highlights={buildHighlights()}
        tappable={false}
      />

      {/* O/X Buttons */}
      {state === 'question' && (
        <View style={s.buttonRow}>
          <Pressable
            onPress={() => handleAnswer(false)}
            style={({ pressed }) => [s.button, s.buttonX, pressed && { opacity: 0.8 }]}
          >
            <Text style={s.buttonText}>✕</Text>
            <Text style={s.buttonLabel}>{t('quiz.scale.phase1.notInScale')}</Text>
          </Pressable>

          <Pressable
            onPress={() => handleAnswer(true)}
            style={({ pressed }) => [s.button, s.buttonO, pressed && { opacity: 0.8 }]}
          >
            <Text style={s.buttonText}>○</Text>
            <Text style={s.buttonLabel}>{t('quiz.scale.phase1.inScale')}</Text>
          </Pressable>
        </View>
      )}

      {/* Result feedback */}
      {state !== 'question' && (
        <View style={s.resultArea}>
          {state === 'correct' && (
            <Text style={s.resultCorrect}>{t('quiz.scale.phase1.correctAnswer')}</Text>
          )}
          {state === 'wrong' && (
            <View>
              <Text style={s.resultWrong}>{t('quiz.scale.phase1.wrongAnswer')}</Text>
              <Text style={s.resultExplanation}>
                {card.isInScale
                  ? t('quiz.scale.phase1.wasInScale')
                  : t('quiz.scale.phase1.wasNotInScale')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
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
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  buttonX: {
    backgroundColor: `${COLORS.wrong}15`,
    borderWidth: 2,
    borderColor: `${COLORS.wrong}40`,
  },
  buttonO: {
    backgroundColor: `${COLORS.correct}15`,
    borderWidth: 2,
    borderColor: `${COLORS.correct}40`,
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  resultArea: {
    marginTop: 'auto',
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  resultCorrect: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.correct,
  },
  resultWrong: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.wrong,
    textAlign: 'center',
  },
  resultExplanation: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
