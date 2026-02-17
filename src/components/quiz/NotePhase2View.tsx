/**
 * Note Phase 2: Reverse Multiple Choice (Note → Position)
 *
 * Shows a note name, user selects correct position from 4 highlighted candidates on fretboard.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import type { FretPosition } from '@/types/music';
import type { NoteQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import type { QuizState } from '@/types/quiz';

interface Props {
  card: NoteQuestionCard;
  state: QuizState;
  onAnswer: (correct: boolean) => void;
}

export function NotePhase2View({ card, state, onAnswer }: Props) {
  const { t } = useTranslation();
  const [selectedPosition, setSelectedPosition] = useState<FretPosition | null>(null);

  if (!card.targetNote || !card.correctPosition || !card.candidatePositions) {
    throw new Error('[NotePhase2View] Missing required fields');
  }

  const handleTap = (pos: FretPosition) => {
    if (state !== 'question') return;

    // Check if tapped position is one of the candidates
    const candidate = card.candidatePositions!.find(
      (c) => c.string === pos.string && c.fret === pos.fret,
    );
    if (!candidate) return; // Ignore taps outside candidates

    setSelectedPosition(pos);

    // Check if correct
    const correct =
      pos.string === card.correctPosition!.string && pos.fret === card.correctPosition!.fret;
    onAnswer(correct);
  };

  // Calculate fret range to show all candidates
  const allFrets = card.candidatePositions.map((p) => p.fret);
  const minFret = Math.max(0, Math.min(...allFrets) - 1);
  const maxFret = Math.min(17, Math.max(...allFrets) + 1);

  const buildHighlights = (): FretHighlight[] => {
    const highlights: FretHighlight[] = [];

    for (const candidate of card.candidatePositions!) {
      const isCorrect =
        candidate.string === card.correctPosition!.string &&
        candidate.fret === card.correctPosition!.fret;
      const isSelected =
        selectedPosition &&
        selectedPosition.string === candidate.string &&
        selectedPosition.fret === candidate.fret;

      if (state === 'question') {
        // During question: highlight all candidates in neutral color
        highlights.push({
          string: candidate.string,
          fret: candidate.fret,
          color: isSelected ? COLORS.track1 : `${COLORS.track1}40`,
          label: isSelected ? '●' : '○',
          textColor: isSelected ? '#fff' : COLORS.track1,
        });
      } else {
        // After answer: show correct/wrong
        if (isCorrect) {
          highlights.push({
            string: candidate.string,
            fret: candidate.fret,
            color: COLORS.correct,
            label: '✓',
            textColor: '#fff',
          });
        } else if (isSelected && !isCorrect) {
          highlights.push({
            string: candidate.string,
            fret: candidate.fret,
            color: COLORS.wrong,
            label: '✕',
            textColor: '#fff',
          });
        } else {
          // Other candidates (not selected, not correct)
          highlights.push({
            string: candidate.string,
            fret: candidate.fret,
            color: `${COLORS.textTertiary}20`,
            label: '○',
            textColor: COLORS.textTertiary,
            opacity: 0.3,
          });
        }
      }
    }

    return highlights;
  };

  return (
    <View style={s.container}>
      <View style={s.questionArea}>
        <Text style={s.questionText}>{t('quiz.note.phase2.question')}</Text>
        <Text style={s.targetNote}>{card.targetNote}</Text>
      </View>

      <Fretboard
        startFret={minFret}
        endFret={maxFret}
        highlights={buildHighlights()}
        tappable={state === 'question'}
        onTap={handleTap}
      />

      <View style={s.resultArea}>
        {state === 'correct' && (
          <View style={s.resultRow}>
            <Text style={s.soundTag}>{t('quiz.note.soundPlay')}</Text>
            <Text style={s.resultCorrect}>{t('quiz.note.phase2.correctAnswer')}</Text>
          </View>
        )}
        {state === 'wrong' && (
          <View style={s.resultRow}>
            <Text
              style={[s.soundTag, { color: COLORS.wrong, backgroundColor: `${COLORS.wrong}15` }]}
            >
              {t('quiz.note.wrongSound')}
            </Text>
            <Text style={s.resultWrong}>
              {t('quiz.note.phase2.wrongAnswer', {
                string: card.correctPosition!.string,
                fret: card.correctPosition!.fret,
              })}
            </Text>
          </View>
        )}
        {state === 'question' && <Text style={s.hint}>{t('quiz.note.phase2.hint')}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionArea: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  questionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  targetNote: {
    fontSize: FONT_SIZE.xxxl + 4,
    fontWeight: '800',
    color: COLORS.track1,
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
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
});
