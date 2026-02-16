import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

type QuizState = 'question' | 'correct' | 'wrong';

// ─── Audio file mapping ───
// NOTE: 개방현 5음 (기초 모드)
// E2 = 6번줄, A2 = 5번줄, D3 = 4번줄, G3 = 3번줄, B3 = 2번줄
const BASIC_MODE_SOUNDS: Record<string, number | null> = {
  E: null,
  A: null,
  D: null,
  G: null,
  B: null,
};

// Try to load basic mode audio files
try {
  BASIC_MODE_SOUNDS.E = require('../../../assets/sounds/E2.wav');
  BASIC_MODE_SOUNDS.A = require('../../../assets/sounds/A2.wav');
  BASIC_MODE_SOUNDS.D = require('../../../assets/sounds/D3.wav');
  BASIC_MODE_SOUNDS.G = require('../../../assets/sounds/G3.wav');
  BASIC_MODE_SOUNDS.B = require('../../../assets/sounds/B3.wav');
} catch (_error) {
  console.warn('[QuizEar] Audio files not found in assets/sounds/');
}

// 현재 사용 중인 사운드 맵 (나중에 전체 모드로 확장 가능)
const SOUND_FILES = BASIC_MODE_SOUNDS;

// ─── Sound wave bars (playing indicator) ───
function WaveBars({ color }: { color: string }) {
  const heights = [12, 20, 28, 20, 12, 24, 16];
  return (
    <View style={s.waveBars}>
      {heights.map((h, i) => (
        <View key={`bar${i}`} style={[s.waveBar, { height: h, backgroundColor: color }]} />
      ))}
    </View>
  );
}

// ─── Play button ───
function PlayButton({ playing, onPress }: { playing: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.playBtn,
        playing ? s.playBtnPlaying : s.playBtnIdle,
        pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
      ]}
    >
      {playing ? (
        <WaveBars color={COLORS.level4} />
      ) : (
        <Svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Polygon points="5,3 19,12 5,21" fill="#fff" stroke="none" />
        </Svg>
      )}
    </Pressable>
  );
}

// ─── Mock data ───
const MOCK_QUESTIONS = [
  { answer: 'E', options: ['E', 'A', 'D', 'G'], answerIdx: 0 },
  { answer: 'A', options: ['D', 'A', 'G', 'B'], answerIdx: 1 },
  { answer: 'D', options: ['E', 'G', 'D', 'A'], answerIdx: 2 },
];

export default function QuizEarScreen() {
  const router = useRouter();
  const total = MOCK_QUESTIONS.length;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<QuizState>('question');
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const q = MOCK_QUESTIONS[currentIdx];

  // Setup audio
  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    })();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play sound
  const playSound = async () => {
    try {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setPlaying(true);

      // Load and play
      const soundFile = SOUND_FILES[q.answer];
      if (!soundFile) {
        console.warn(`[QuizEar] Sound file not found for: ${q.answer}`);
        setPlaying(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
      soundRef.current = sound;

      // Set callback when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (error) {
      console.error('[QuizEar] Failed to play sound:', error);
      setPlaying(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (state !== 'question') return;
    setState(q.options[index] === q.answer ? 'correct' : 'wrong');
    setPlaying(false);
  };

  const nextCard = async () => {
    // Stop current sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (currentIdx + 1 >= total) {
      router.back();
      return;
    }
    setCurrentIdx((prev) => prev + 1);
    setState('question');
    setPlaying(false);
  };

  return (
    <View style={s.container}>
      <QuizHeader
        label="귀 훈련"
        levelNum={4}
        color={COLORS.level4}
        progress={currentIdx + (state !== 'question' ? 1 : 0)}
        total={total}
        onBack={() => router.back()}
        badge="기초 모드"
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
          <Text style={s.quizBadgeText}>👂 귀 훈련 · 기초</Text>
        </View>
        <Text style={s.modeDesc}>개방현 5음 (E, A, D, G, B) 중 하나</Text>

        <PlayButton playing={playing} onPress={playSound} />

        <Text style={s.playLabel}>{playing ? '듣고 있어요...' : '탭하여 소리 듣기'}</Text>

        {/* Result */}
        {state !== 'question' && (
          <View style={s.resultRow}>
            <Text
              style={[
                s.soundTag,
                {
                  color: state === 'correct' ? COLORS.correct : COLORS.wrong,
                  backgroundColor:
                    state === 'correct' ? `${COLORS.correct}15` : `${COLORS.wrong}15`,
                },
              ]}
            >
              {state === 'correct' ? '🔊 정답음' : '🔇 오답음'}
            </Text>
            <Text
              style={[s.resultText, { color: state === 'correct' ? COLORS.correct : COLORS.wrong }]}
            >
              {state === 'correct' ? `정답! ${q.answer}음` : `정답은 ${q.answer}예요`}
            </Text>
          </View>
        )}

        <View style={s.unlockHint}>
          <Text style={s.unlockHintText}>Lv.1 음 위치 80% 달성 시 → 전체 음 모드 해금</Text>
        </View>
      </View>

      {/* Answer area */}
      <View style={s.answerArea}>
        {state === 'question' ? (
          <AnswerGrid options={q.options} onSelect={handleAnswer} />
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
    maxHeight: 360,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizBadge: {
    backgroundColor: `${COLORS.level4}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  quizBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.level4,
  },
  modeDesc: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  playBtnIdle: {
    backgroundColor: COLORS.level4,
  },
  playBtnPlaying: {
    backgroundColor: `${COLORS.level4}20`,
  },
  playLabel: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
  },
  soundTag: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  resultText: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: '700',
  },
  unlockHint: {
    marginTop: 'auto',
    paddingTop: SPACING.sm,
  },
  unlockHintText: {
    fontSize: 9,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  answerArea: {
    marginTop: SPACING.lg,
  },
});
