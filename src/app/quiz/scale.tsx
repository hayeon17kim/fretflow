import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import type { StringNumber } from '@/types/music';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

type QuizState = 'question' | 'correct' | 'wrong';
interface Pos {
  s: StringNumber;
  f: number;
}

// ─── Mock data ───
const MOCK_SCALE = {
  name: 'Am 펜타토닉',
  position: '1포지션',
  fretRange: [0, 4] as [number, number],
  positions: [
    { s: 1 as StringNumber, f: 0 },
    { s: 1 as StringNumber, f: 3 },
    { s: 2 as StringNumber, f: 0 },
    { s: 2 as StringNumber, f: 2 },
    { s: 3 as StringNumber, f: 0 },
    { s: 3 as StringNumber, f: 2 },
    { s: 4 as StringNumber, f: 0 },
    { s: 4 as StringNumber, f: 2 },
    { s: 5 as StringNumber, f: 0 },
    { s: 5 as StringNumber, f: 2 },
    { s: 6 as StringNumber, f: 0 },
    { s: 6 as StringNumber, f: 3 },
  ],
  notes: 'A, C, D, E, G',
  hint: 'Am 펜타토닉 1포지션은 0~3프렛 안에서 A, C, D, E, G 5개 음이 반복되는 "박스" 모양이에요.',
};

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
  const [state, setState] = useState<QuizState>('question');
  const [selected, setSelected] = useState<Pos[]>([]);
  const [score, setScore] = useState<Score | null>(null);

  const isSelected = (s: StringNumber, f: number) => selected.some((p) => p.s === s && p.f === f);
  const isScalePos = (s: StringNumber, f: number) =>
    MOCK_SCALE.positions.some((p) => p.s === s && p.f === f);

  const handleTap = (pos: { string: StringNumber; fret: number }) => {
    if (state !== 'question') return;
    if (isSelected(pos.string, pos.fret)) {
      setSelected((prev) => prev.filter((p) => !(p.s === pos.string && p.f === pos.fret)));
    } else {
      setSelected((prev) => [...prev, { s: pos.string, f: pos.fret }]);
    }
  };

  const checkAnswer = () => {
    const correctSelections = selected.filter((p) => isScalePos(p.s, p.f)).length;
    const wrongSelections = selected.filter((p) => !isScalePos(p.s, p.f)).length;
    const missedPositions = MOCK_SCALE.positions.filter((p) => !isSelected(p.s, p.f)).length;
    const totalScale = MOCK_SCALE.positions.length;
    const accuracy = Math.round((correctSelections / totalScale) * 100);

    setScore({
      correct: correctSelections,
      wrong: wrongSelections,
      missed: missedPositions,
      total: totalScale,
      accuracy,
    });
    setState(accuracy >= 80 && wrongSelections === 0 ? 'correct' : 'wrong');
  };

  const retry = () => {
    setState('question');
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
        progress={state !== 'question' ? 1 : 0}
        total={1}
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
          {t('quiz.scale.questionMain', {
            scaleName: MOCK_SCALE.name,
            position: MOCK_SCALE.position,
          }).split(MOCK_SCALE.position)[0]}
          {MOCK_SCALE.name} <Text style={{ color: COLORS.level3 }}>{MOCK_SCALE.position}</Text>
        </Text>
        <Text style={s.questionSub}>{t('quiz.scale.questionSub')}</Text>

        <Fretboard
          startFret={MOCK_SCALE.fretRange[0]}
          endFret={MOCK_SCALE.fretRange[1]}
          highlights={buildHighlights()}
          tappable={state === 'question'}
          onTap={handleTap}
        />

        {/* Pattern hint */}
        {state !== 'question' && (
          <View style={s.hintBox}>
            <Text style={s.hintTitle}>{t('quiz.scale.patternTip')}</Text>
            <Text style={s.hintText}>{MOCK_SCALE.hint}</Text>
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
                {score.missed > 0 ? ` · ${t('quiz.scale.missedCount', { count: score.missed })}` : ''}
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
          <NextButton onPress={retry} correct={state === 'correct'} />
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
