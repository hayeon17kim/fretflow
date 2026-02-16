import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useQuizSession } from '@/hooks/useQuizSession';
import type { FretPosition, StringNumber } from '@/types/music';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

// ─── Mock data ───
const MOCK_QUESTIONS = [
  {
    id: 'interval-1',
    root: { string: 5 as StringNumber, fret: 0 },
    correct: { string: 5 as StringNumber, fret: 7 },
    rootNote: 'A',
    answerNote: 'E',
    intervalName: '완전5도 ↑',
    patternHint:
      '같은 줄에서 7프렛 위 = 항상 완전5도! 이 모양을 기억하면 어떤 음에서든 5도를 찾을 수 있어요.',
    fretRange: [0, 9] as [number, number],
  },
  {
    id: 'interval-2',
    root: { string: 4 as StringNumber, fret: 2 },
    correct: { string: 4 as StringNumber, fret: 7 },
    rootNote: 'E',
    answerNote: 'B',
    intervalName: '완전5도 ↑',
    patternHint: '같은 줄에서 7프렛 위 = 항상 완전5도!',
    fretRange: [0, 9] as [number, number],
  },
];

export default function QuizIntervalScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { currentCard: q, state, total, progress, recordAnswer, nextCard } = useQuizSession({
    cards: MOCK_QUESTIONS,
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
    recordAnswer(correct);
  };

  const handleNext = () => {
    nextCard(() => router.back());
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
