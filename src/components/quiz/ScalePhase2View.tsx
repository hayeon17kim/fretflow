/**
 * Scale Phase 2: Fill in the Blanks
 *
 * Shows 60-70% of scale notes pre-revealed (gray/faded), user taps to fill remaining 30-40%.
 * Always shows root, octave, and 5th (skeleton notes).
 */

import { useState } from 'react';
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

interface Score {
  correct: number;
  wrong: number;
  missed: number;
  total: number;
  accuracy: number;
}

export function ScalePhase2View({ card, state, onAnswer }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<FretPosition[]>([]);
  const [score, setScore] = useState<Score | null>(null);

  if (
    !card.preRevealedPositions ||
    !card.hiddenPositions ||
    !card.correctPositions ||
    !card.allPositions
  ) {
    throw new Error('[ScalePhase2View] Missing required positions');
  }

  const scaleNameKo = t(`quiz.scale.scaleNames.${card.scaleName}`);
  const hint = t(`quiz.scale.patternHints.${card.scaleName}`);

  // Calculate fret range
  const MAX_FRET = 17;
  const MIN_WINDOW = 8;
  const MAX_WINDOW = 10;
  const frets = card.correctPositions.map((p) => p.fret);
  const naturalMin = Math.max(0, Math.min(...frets) - 1);
  const naturalMax = Math.min(Math.max(...frets) + 2, MAX_FRET);
  const span = naturalMax - naturalMin;
  const window = Math.max(MIN_WINDOW, Math.min(MAX_WINDOW, span));
  const idealStart = Math.max(0, naturalMin - Math.floor((window - span) / 2));
  const startFret = Math.min(idealStart, Math.max(0, MAX_FRET - window));
  const endFret = Math.min(startFret + window, MAX_FRET);

  const isSelected = (s: StringNumber, f: number) =>
    selected.some((p) => p.string === s && p.fret === f);

  const isPreRevealed = (s: StringNumber, f: number) =>
    card.preRevealedPositions!.some((p) => p.string === s && p.fret === f);

  const isHidden = (s: StringNumber, f: number) =>
    card.hiddenPositions!.some((p) => p.string === s && p.fret === f);

  const isInScale = (s: StringNumber, f: number) =>
    card.correctPositions!.some((p) => p.string === s && p.fret === f);

  const handleTap = (pos: FretPosition) => {
    if (state !== 'question') return;
    if (isPreRevealed(pos.string, pos.fret)) return; // Can't tap pre-revealed notes

    if (isSelected(pos.string, pos.fret)) {
      setSelected((prev) => prev.filter((p) => !(p.string === pos.string && p.fret === pos.fret)));
    } else {
      setSelected((prev) => [...prev, pos]);
    }
  };

  const checkAnswer = () => {
    const correctSelections = selected.filter((p) => isHidden(p.string, p.fret)).length;
    const wrongSelections = selected.filter((p) => !isHidden(p.string, p.fret)).length;
    const missedPositions = card.hiddenPositions!.filter((p) => !isSelected(p.string, p.fret))
      .length;
    const totalHidden = card.hiddenPositions!.length;
    const accuracy = Math.round((correctSelections / totalHidden) * 100);

    setScore({
      correct: correctSelections,
      wrong: wrongSelections,
      missed: missedPositions,
      total: totalHidden,
      accuracy,
    });

    const correct = accuracy >= 80 && wrongSelections === 0;
    onAnswer(correct);
  };

  const buildHighlights = (): FretHighlight[] => {
    const highlights: FretHighlight[] = [];

    for (let s = 1; s <= 6; s++) {
      const str = s as StringNumber;
      for (let f = startFret; f <= endFret; f++) {
        const preRevealed = isPreRevealed(str, f);
        const hidden = isHidden(str, f);
        const sel = isSelected(str, f);
        const inScale = isInScale(str, f);

        if (state === 'question') {
          if (preRevealed) {
            // Pre-revealed notes (faded/gray)
            highlights.push({
              string: str,
              fret: f,
              color: `${COLORS.track3}30`,
              label: '●',
              textColor: COLORS.textTertiary,
              opacity: 0.5,
            });
          } else if (sel) {
            // User selected positions
            highlights.push({
              string: str,
              fret: f,
              color: COLORS.track3,
              label: '●',
              textColor: '#fff',
            });
          }
        } else {
          // After answer - show results
          if (preRevealed) {
            // Pre-revealed notes (keep faded)
            highlights.push({
              string: str,
              fret: f,
              color: `${COLORS.track3}30`,
              label: '●',
              textColor: COLORS.textTertiary,
              opacity: 0.5,
            });
          } else if (hidden && sel) {
            // Correctly filled blank
            highlights.push({ string: str, fret: f, color: COLORS.correct, label: '✓' });
          } else if (hidden && !sel) {
            // Missed blank
            highlights.push({
              string: str,
              fret: f,
              color: `${COLORS.correct}40`,
              label: '○',
              textColor: COLORS.correct,
              border: COLORS.correct,
              opacity: 0.6,
            });
          } else if (!inScale && sel) {
            // Wrong selection
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
      <View style={s.quizBadge}>
        <Text style={s.quizBadgeText}>{t('quiz.scale.badge')}</Text>
      </View>

      <Text style={s.questionMain}>
        {card.rootNote} {scaleNameKo}{' '}
        <Text style={{ color: COLORS.track3 }}>{t('quiz.scale.position', { number: 1 })}</Text>
      </Text>
      <Text style={s.questionSub}>{t('quiz.scale.phase2.question')}</Text>

      <Fretboard
        startFret={startFret}
        endFret={endFret}
        highlights={buildHighlights()}
        tappable={state === 'question'}
        onTap={handleTap}
      />

      {/* Pattern hint (shown after answer) */}
      {state !== 'question' && (
        <View style={s.hintBox}>
          <Text style={s.hintTitle}>{t('quiz.scale.patternTip')}</Text>
          <Text style={s.hintText}>{hint}</Text>
        </View>
      )}

      {/* Score area */}
      <View style={s.scoreArea}>
        {state === 'correct' && score && (
          <Text style={s.resultCorrect}>
            {t('quiz.scale.phase2.correctAnswer', {
              correct: score.correct,
              total: score.total,
              accuracy: score.accuracy,
            })}
          </Text>
        )}
        {state === 'wrong' && score && (
          <View style={{ alignItems: 'center' }}>
            <Text style={s.resultWrong}>
              {t('quiz.scale.phase2.wrongAnswer', { correct: score.correct, total: score.total })}
              {score.wrong > 0 ? ` · ${t('quiz.scale.phase2.wrongCount', { count: score.wrong })}` : ''}
              {score.missed > 0
                ? ` · ${t('quiz.scale.phase2.missedCount', { count: score.missed })}`
                : ''}
            </Text>
            <Text style={s.scoreSub}>{t('quiz.scale.phase2.scoreSub')}</Text>
          </View>
        )}
      </View>

      {/* Confirm button */}
      {state === 'question' && (
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
            {t('quiz.scale.phase2.confirmButton', { count: selected.length })}
          </Text>
        </Pressable>
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
  confirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  confirmText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
