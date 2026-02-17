/**
 * Note Phase 3: Free Tap (Note → Find on Fretboard)
 *
 * Shows a note name, user taps anywhere on fretboard to find it.
 * No hints, no candidates - pure recall.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import type { FretPosition } from '@/types/music';
import type { NoteQuestionCard } from '@/utils/cardGenerator';
import { getNoteAtPosition } from '@/utils/music';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import type { QuizState } from '@/types/quiz';

interface Props {
  card: NoteQuestionCard;
  state: QuizState;
  onAnswer: (correct: boolean) => void;
}

export function NotePhase3View({ card, state, onAnswer }: Props) {
  const { t } = useTranslation();
  const [tappedPosition, setTappedPosition] = useState<FretPosition | null>(null);

  if (!card.targetNote || !card.correctPosition || !card.fretRange) {
    throw new Error('[NotePhase3View] Missing required fields');
  }

  const handleTap = (pos: FretPosition) => {
    if (state !== 'question') return;

    setTappedPosition(pos);

    // Check if the tapped position has the target note
    const tappedNote = getNoteAtPosition(pos);
    const correct = tappedNote === card.targetNote;
    onAnswer(correct);
  };

  const { min: startFret, max: endFret } = card.fretRange;

  const buildHighlights = (): FretHighlight[] => {
    const highlights: FretHighlight[] = [];

    if (state === 'question') {
      // During question: only show tapped position (if any)
      if (tappedPosition) {
        highlights.push({
          string: tappedPosition.string,
          fret: tappedPosition.fret,
          color: COLORS.track1,
          label: '●',
          textColor: '#fff',
        });
      }
    } else {
      // After answer: show correct position and wrong position (if tapped wrong)
      if (card.correctPosition) {
        highlights.push({
          string: card.correctPosition.string,
          fret: card.correctPosition.fret,
          color: COLORS.correct,
          label: state === 'correct' ? '✓' : card.targetNote,
          textColor: '#fff',
        });
      }

      // Show wrong tap if incorrect
      if (
        state === 'wrong' &&
        tappedPosition &&
        (tappedPosition.string !== card.correctPosition.string ||
          tappedPosition.fret !== card.correctPosition.fret)
      ) {
        highlights.push({
          string: tappedPosition.string,
          fret: tappedPosition.fret,
          color: COLORS.wrong,
          label: '✕',
          textColor: '#fff',
        });
      }
    }

    return highlights;
  };

  return (
    <View style={s.container}>
      <View style={s.questionArea}>
        <Text style={s.questionText}>{t('quiz.note.phase3.question')}</Text>
        <Text style={s.targetNote}>{card.targetNote}</Text>
      </View>

      <Fretboard
        startFret={startFret}
        endFret={endFret}
        highlights={buildHighlights()}
        tappable={state === 'question'}
        onTap={handleTap}
      />

      <View style={s.resultArea}>
        {state === 'correct' && (
          <View style={s.resultRow}>
            <Text style={s.soundTag}>{t('quiz.note.soundPlay')}</Text>
            <Text style={s.resultCorrect}>{t('quiz.note.phase3.correctAnswer')}</Text>
          </View>
        )}
        {state === 'wrong' && (
          <View>
            <View style={s.resultRow}>
              <Text
                style={[s.soundTag, { color: COLORS.wrong, backgroundColor: `${COLORS.wrong}15` }]}
              >
                {t('quiz.note.wrongSound')}
              </Text>
              <Text style={s.resultWrong}>
                {t('quiz.note.phase3.wrongAnswer', {
                  string: card.correctPosition!.string,
                  fret: card.correctPosition!.fret,
                })}
              </Text>
            </View>
            <Text style={s.explanation}>
              {t('quiz.note.position', {
                string: card.correctPosition!.string,
                fret: card.correctPosition!.fret,
              })}
            </Text>
          </View>
        )}
        {state === 'question' && <Text style={s.hint}>{t('quiz.note.phase3.hint')}</Text>}
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
  explanation: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
