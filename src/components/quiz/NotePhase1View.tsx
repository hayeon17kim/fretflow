/**
 * Note Phase 1: Multiple Choice (Position → Note)
 *
 * Shows a position on the fretboard, user selects note from 4 options.
 * This is the current default behavior.
 */

import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Fretboard } from '@/components/Fretboard';
import { AnswerGrid } from '@/components/quiz/AnswerGrid';
import type { NoteQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import type { QuizState } from '@/types/quiz';

interface Props {
  card: NoteQuestionCard;
  state: QuizState;
  onAnswer: (correct: boolean) => void;
}

export function NotePhase1View({ card, state, onAnswer }: Props) {
  const { t } = useTranslation();

  if (!card.string || !card.fret || !card.answer || !card.options) {
    throw new Error('[NotePhase1View] Missing required fields');
  }

  const handleSelect = (index: number) => {
    if (state !== 'question') return;
    const correct = card.options![index] === card.answer;
    onAnswer(correct);
  };

  // Consistent fret window: always show FRET_WINDOW frets
  const FRET_WINDOW = 8;
  const MAX_FRET = 17;
  const idealStart = Math.max(0, card.fret - 2);
  const startFret = Math.min(idealStart, Math.max(0, MAX_FRET - FRET_WINDOW));
  const endFret = Math.min(startFret + FRET_WINDOW, MAX_FRET);

  return (
    <View style={s.container}>
      <Text style={s.positionLabel}>
        {t('quiz.note.position', { string: card.string, fret: card.fret })}
      </Text>
      <Fretboard
        startFret={startFret}
        endFret={endFret}
        highlights={[
          {
            string: card.string,
            fret: card.fret,
            color:
              state === 'correct'
                ? COLORS.correct
                : state === 'wrong'
                  ? COLORS.wrong
                  : COLORS.accent,
            label: state !== 'question' ? card.answer : '?',
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
            <Text style={s.resultWrong}>{t('quiz.note.wrongAnswer', { answer: card.answer })}</Text>
          </View>
        )}
        {state === 'question' && <Text style={s.questionText}>{t('quiz.note.question')}</Text>}
      </View>

      {/* Answer grid */}
      {state === 'question' && <AnswerGrid options={card.options} onSelect={handleSelect} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
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
});
