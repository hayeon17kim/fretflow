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

// ─── Tappable fretboard ───
function TappableFretboard({
  startFret,
  endFret,
  rootPos,
  tapped,
  correctPos,
  state,
  onTap,
}: {
  startFret: number;
  endFret: number;
  rootPos: Pos;
  tapped: Pos | null;
  correctPos: Pos;
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

  const dots: Array<{ cx: number; cy: number; color: string; label: string }> = [];

  // Root dot
  const rootCx = padX + (rootPos.f - startFret) * fretW;
  const rootCy = padY + rootPos.s * stringH;
  dots.push({ cx: rootCx, cy: rootCy, color: COLORS.correct, label: '' });

  // User selection (question state) or answer result
  if (state === 'question' && tapped) {
    const cx = padX + (tapped.f - startFret) * fretW;
    const cy = padY + tapped.s * stringH;
    dots.push({ cx, cy, color: COLORS.accent, label: '?' });
  }
  if (state === 'correct') {
    const cx = padX + (correctPos.f - startFret) * fretW;
    const cy = padY + correctPos.s * stringH;
    dots.push({ cx, cy, color: COLORS.correct, label: '' });
  }
  if (state === 'wrong') {
    if (tapped) {
      const cx = padX + (tapped.f - startFret) * fretW;
      const cy = padY + tapped.s * stringH;
      dots.push({ cx, cy, color: COLORS.wrong, label: '✕' });
    }
    const cx = padX + (correctPos.f - startFret) * fretW;
    const cy = padY + correctPos.s * stringH;
    dots.push({ cx, cy, color: COLORS.correct, label: '' });
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
          <SvgCircle key={`d${i}`} cx={d.cx} cy={d.cy} r={12} fill={d.color} />
        ))}
      </Svg>

      {/* Tap overlay — invisible pressable grid */}
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
const MOCK_QUESTIONS = [
  {
    root: { s: 4, f: 0 },
    correct: { s: 4, f: 7 },
    rootNote: 'A',
    answerNote: 'E',
    intervalName: '완전5도 ↑',
    patternHint:
      '같은 줄에서 7프렛 위 = 항상 완전5도! 이 모양을 기억하면 어떤 음에서든 5도를 찾을 수 있어요.',
    fretRange: [0, 9] as [number, number],
  },
  {
    root: { s: 3, f: 2 },
    correct: { s: 3, f: 7 },
    rootNote: 'E',
    answerNote: 'B',
    intervalName: '완전5도 ↑',
    patternHint: '같은 줄에서 7프렛 위 = 항상 완전5도!',
    fretRange: [0, 9] as [number, number],
  },
];

export default function QuizIntervalScreen() {
  const router = useRouter();
  const total = MOCK_QUESTIONS.length;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<QuizState>('question');
  const [tapped, setTapped] = useState<Pos | null>(null);

  const q = MOCK_QUESTIONS[currentIdx];

  const handleTap = (s: number, f: number) => {
    if (state !== 'question') return;
    if (tapped?.s === s && tapped?.f === f) {
      setTapped(null);
    } else {
      setTapped({ s, f });
    }
  };

  const confirmAnswer = () => {
    if (!tapped) return;
    if (tapped.s === q.correct.s && tapped.f === q.correct.f) {
      setState('correct');
    } else {
      setState('wrong');
    }
  };

  const nextCard = () => {
    if (currentIdx + 1 >= total) {
      router.back();
      return;
    }
    setCurrentIdx((prev) => prev + 1);
    setState('question');
    setTapped(null);
  };

  return (
    <View style={s.container}>
      <QuizHeader
        label="인터벌"
        levelNum={2}
        color={COLORS.level2}
        progress={currentIdx + (state !== 'question' ? 1 : 0)}
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
          <Text style={s.quizBadgeText}>📏 인터벌 퀴즈</Text>
        </View>

        <Text style={s.questionMain}>
          {q.rootNote}에서 <Text style={{ color: COLORS.level2 }}>{q.intervalName}</Text>
        </Text>
        <Text style={s.questionSub}>프렛보드에서 해당 음의 위치를 탭하세요</Text>

        <TappableFretboard
          startFret={q.fretRange[0]}
          endFret={q.fretRange[1]}
          rootPos={q.root}
          tapped={tapped}
          correctPos={q.correct}
          state={state}
          onTap={handleTap}
        />

        {/* Pattern hint — after answer */}
        {state !== 'question' && (
          <View style={s.hintBox}>
            <Text style={s.hintTitle}>💡 패턴 규칙</Text>
            <Text style={s.hintText}>{q.patternHint}</Text>
          </View>
        )}

        <View style={s.resultArea}>
          {state === 'correct' && (
            <Text style={s.resultCorrect}>
              🔊 정답! {q.rootNote} → {q.answerNote} ({q.intervalName.replace(' ↑', '')})
            </Text>
          )}
          {state === 'wrong' && (
            <Text style={s.resultWrong}>
              정답은 {q.correct.s + 1}번줄 {q.correct.f}프렛 ({q.answerNote})예요
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
              {tapped ? '이 위치로 확인 →' : '프렛보드에서 위치를 선택하세요'}
            </Text>
          </Pressable>
        ) : (
          <NextButton onPress={nextCard} correct={state === 'correct'} />
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
