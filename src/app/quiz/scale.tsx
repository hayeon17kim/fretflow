import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Circle as SvgCircle } from 'react-native-svg';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

type QuizState = 'question' | 'correct' | 'wrong';
interface Pos {
  s: number;
  f: number;
}

// ─── Multi-select tappable fretboard ───
function ScaleFretboard({
  startFret,
  endFret,
  selected,
  scalePositions,
  state,
  onTap,
}: {
  startFret: number;
  endFret: number;
  selected: Pos[];
  scalePositions: Pos[];
  state: QuizState;
  onTap: (s: number, f: number) => void;
}) {
  const strings = 6;
  const fretCount = endFret - startFret + 1;
  const w = 280;
  const h = 160;
  const padX = 24;
  const padY = 16;
  const fretW = (w - padX * 2) / Math.max(1, fretCount - 1);
  const stringH = (h - padY * 2) / (strings - 1);

  const isScale = (s: number, f: number) => scalePositions.some((p) => p.s === s && p.f === f);
  const isSelected = (s: number, f: number) => selected.some((p) => p.s === s && p.f === f);

  const dots: Array<{ cx: number; cy: number; color: string; r: number; dashed?: boolean }> = [];

  for (let si = 0; si < strings; si++) {
    for (let fi = startFret; fi <= endFret; fi++) {
      const cx = padX + (fi - startFret) * fretW;
      const cy = padY + si * stringH;
      const sel = isSelected(si, fi);
      const scale = isScale(si, fi);

      if (state === 'question') {
        if (sel) dots.push({ cx, cy, color: COLORS.level3, r: 10 });
      } else {
        if (scale && sel) dots.push({ cx, cy, color: COLORS.correct, r: 10 });
        else if (scale && !sel)
          dots.push({ cx, cy, color: `${COLORS.correct}40`, r: 10, dashed: true });
        else if (!scale && sel) dots.push({ cx, cy, color: COLORS.wrong, r: 10 });
      }
    }
  }

  return (
    <View>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Fret lines */}
        {Array.from({ length: fretCount }, (_, i) => (
          <Line
            key={`f${i}`}
            x1={padX + i * fretW}
            y1={padY}
            x2={padX + i * fretW}
            y2={h - padY}
            stroke={COLORS.fretLine}
            strokeWidth={i === 0 && startFret === 0 ? 3 : 1}
          />
        ))}
        {/* String lines */}
        {Array.from({ length: strings }, (_, i) => (
          <Line
            key={`s${i}`}
            x1={padX}
            y1={padY + i * stringH}
            x2={w - padX}
            y2={padY + i * stringH}
            stroke={COLORS.fretLine}
            strokeWidth={1}
          />
        ))}
        {/* Dots */}
        {dots.map((d, i) => (
          <SvgCircle
            key={`d${i}`}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.dashed ? 'none' : d.color}
            stroke={d.dashed ? COLORS.correct : 'none'}
            strokeWidth={d.dashed ? 2 : 0}
            strokeDasharray={d.dashed ? '4 3' : undefined}
          />
        ))}
      </Svg>

      {/* Tap overlay */}
      {state === 'question' && (
        <View style={[StyleSheet.absoluteFill, { flexDirection: 'column' }]}>
          {Array.from({ length: strings }, (_, si) => (
            <View key={`row${si}`} style={{ flex: 1, flexDirection: 'row' }}>
              {Array.from({ length: fretCount }, (_, fi) => (
                <Pressable
                  key={`cell${fi}`}
                  style={{ flex: 1 }}
                  onPress={() => onTap(si, startFret + fi)}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Mock data ───
const MOCK_SCALE = {
  name: 'Am 펜타토닉',
  position: '1포지션',
  fretRange: [0, 4] as [number, number],
  positions: [
    { s: 0, f: 0 },
    { s: 0, f: 3 },
    { s: 1, f: 0 },
    { s: 1, f: 2 },
    { s: 2, f: 0 },
    { s: 2, f: 2 },
    { s: 3, f: 0 },
    { s: 3, f: 2 },
    { s: 4, f: 0 },
    { s: 4, f: 2 },
    { s: 5, f: 0 },
    { s: 5, f: 3 },
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
  const [state, setState] = useState<QuizState>('question');
  const [selected, setSelected] = useState<Pos[]>([]);
  const [score, setScore] = useState<Score | null>(null);

  const isSelected = (s: number, f: number) => selected.some((p) => p.s === s && p.f === f);
  const isScalePos = (s: number, f: number) =>
    MOCK_SCALE.positions.some((p) => p.s === s && p.f === f);

  const handleTap = (s: number, f: number) => {
    if (state !== 'question') return;
    if (isSelected(s, f)) {
      setSelected((prev) => prev.filter((p) => !(p.s === s && p.f === f)));
    } else {
      setSelected((prev) => [...prev, { s, f }]);
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

  return (
    <View style={s.container}>
      <QuizHeader
        label="스케일 패턴"
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
          <Text style={s.quizBadgeText}>🎼 스케일 퀴즈</Text>
        </View>

        <Text style={s.questionMain}>
          {MOCK_SCALE.name} <Text style={{ color: COLORS.level3 }}>{MOCK_SCALE.position}</Text>
        </Text>
        <Text style={s.questionSub}>스케일에 속하는 음을 모두 탭하세요</Text>

        <ScaleFretboard
          startFret={MOCK_SCALE.fretRange[0]}
          endFret={MOCK_SCALE.fretRange[1]}
          selected={selected}
          scalePositions={MOCK_SCALE.positions}
          state={state}
          onTap={handleTap}
        />

        {/* Pattern hint */}
        {state !== 'question' && (
          <View style={s.hintBox}>
            <Text style={s.hintTitle}>💡 패턴 팁</Text>
            <Text style={s.hintText}>{MOCK_SCALE.hint}</Text>
          </View>
        )}

        {/* Score */}
        <View style={s.scoreArea}>
          {state === 'correct' && score && (
            <Text style={s.resultCorrect}>
              정답! {score.correct}/{score.total}개 맞음 ({score.accuracy}%)
            </Text>
          )}
          {state === 'wrong' && score && (
            <View style={{ alignItems: 'center' }}>
              <Text style={s.resultWrong}>
                {score.correct}/{score.total}개 맞음
                {score.wrong > 0 ? ` · ${score.wrong}개 오답` : ''}
                {score.missed > 0 ? ` · ${score.missed}개 누락` : ''}
              </Text>
              <Text style={s.scoreSub}>점선 원(○) = 놓친 음 · 80% 이상이면 통과</Text>
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
              확인 ({selected.length}개 선택)
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
