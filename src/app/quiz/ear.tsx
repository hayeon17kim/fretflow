import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { SoftGuideModal } from '@/components/SoftGuideModal';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import { QUIZ_ROUTES } from '@/config/levels';
import { type EarQuestionCard, generateEarCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import type { NoteWithOctave } from '@/config/earTrainingTiers';
import { getCurrentTier, getAvailableSounds } from '@/config/earTrainingTiers';
import { getSoundFile } from '@/utils/earTrainingSounds';

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

export default function QuizEarScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview, getMasteredCards } = useSpacedRepetition();
  const params = useLocalSearchParams();
  const { showGoalToast } = useGoalAchievement();

  // Get session size from params, default to 10
  const sessionSize = params.sessionSize ? parseInt(params.sessionSize as string, 10) : 10;

  // Get mastered count for tier calculation
  const masteredEarCards = getMasteredCards('ear');
  const masteredCount = masteredEarCards.length;

  // Calculate current tier
  const currentTier = getCurrentTier(masteredCount);
  const availableSounds = getAvailableSounds(masteredCount);

  // Generate cards with mastery-based progression
  const questions = useMemo(() => {
    const batch: EarQuestionCard[] = [];
    for (let i = 0; i < sessionSize; i++) {
      batch.push(generateEarCard(masteredCount));
    }
    return batch;
  }, [sessionSize, masteredCount]);

  const {
    currentCard: q,
    state,
    total,
    progress,
    correctCount,
    wrongCount,
    recordAnswer,
    nextCard,
  } = useQuizSession({
    cards: questions,
  });
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [preloadedSounds, setPreloadedSounds] = useState<Map<NoteWithOctave, Audio.Sound>>(
    new Map(),
  );

  // Soft guide for first visit (Issue #22)
  const levelFirstVisit = useAppStore((s) => s.levelFirstVisit);
  const markLevelVisited = useAppStore((s) => s.markLevelVisited);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!levelFirstVisit.ear) {
      setShowGuide(true);
    }
  }, [levelFirstVisit.ear]);

  const handleContinue = () => {
    markLevelVisited('ear');
    setShowGuide(false);
  };

  const handleGoToLevel1 = () => {
    markLevelVisited('ear');
    setShowGuide(false);
    router.replace(QUIZ_ROUTES.note);
  };

  // Setup audio and preload session sounds
  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    })();

    // Collect all unique sounds in this session
    const sessionSounds = new Set<NoteWithOctave>();
    questions.forEach((question) => {
      sessionSounds.add(question.answer);
      question.options.forEach((opt) => sessionSounds.add(opt));
    });

    // Preload all session sounds
    const preloadAllSounds = async () => {
      const loadedMap = new Map<NoteWithOctave, Audio.Sound>();

      const loadPromises = Array.from(sessionSounds).map(async (note) => {
        const soundFile = getSoundFile(note);
        if (!soundFile) {
          console.warn(`[QuizEar] Sound file not found: ${note}`);
          return;
        }

        try {
          const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: false });
          loadedMap.set(note, sound);
        } catch (error) {
          console.error(`[QuizEar] Failed to preload sound ${note}:`, error);
        }
      });

      await Promise.all(loadPromises);
      setPreloadedSounds(loadedMap);
    };

    preloadAllSounds();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      preloadedSounds.forEach((sound) => sound.unloadAsync());
    };
  }, [questions]);

  // Play sound
  const playSound = async () => {
    try {
      // Stop previous sound
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }

      setPlaying(true);

      // Try to use preloaded sound first
      const preloaded = preloadedSounds.get(q.answer);
      if (preloaded) {
        await preloaded.setPositionAsync(0); // Reset to start
        await preloaded.playAsync();
        soundRef.current = preloaded;

        // Set callback
        preloaded.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlaying(false);
          }
        });
      } else {
        // Fallback to on-demand loading
        const soundFile = getSoundFile(q.answer);
        if (!soundFile) {
          console.warn(`[QuizEar] Sound file not found: ${q.answer}`);
          setPlaying(false);
          return;
        }

        const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('[QuizEar] Failed to play sound:', error);
      setPlaying(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (state !== 'question') return;
    const correct = q.options[index] === q.answer;
    setPlaying(false);

    // 응답 시간 기록
    const responseTime = recordAnswer(correct);

    // 카드 추가 & 리뷰 기록
    addCard({
      id: q.id,
      type: 'ear',
      question: { note: q.answer } as any,
    });
    recordReview(q.id, correct, responseTime);

    // 일일 통계 업데이트
    useAppStore.getState().incrementReview(correct);
  };

  const handleNext = async () => {
    // Stop current sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setPlaying(false);
    nextCard(() => {
      router.push({
        pathname: '/quiz/completion',
        params: {
          correct: correctCount.toString(),
          total: total.toString(),
          levelNum: '4',
        },
      });
    });
  };

  return (
    <View style={s.container}>
      <GoalAchievedToast visible={showGoalToast} />
      <QuizHeader
        label={t('quiz.ear.title')}
        levelNum={4}
        color={COLORS.level4}
        progress={progress}
        total={total}
        onBack={() => router.back()}
        badge={`Tier ${currentTier.id}/5 • ${availableSounds.length} sounds`}
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
          <Text style={s.quizBadgeText}>{t('quiz.ear.badge')}</Text>
        </View>
        <Text style={s.modeDesc}>{t('quiz.ear.modeDesc')}</Text>

        <PlayButton playing={playing} onPress={playSound} />

        <Text style={s.playLabel}>{playing ? t('quiz.ear.playing') : t('quiz.ear.playSound')}</Text>

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
              {state === 'correct' ? t('quiz.ear.correctSound') : t('quiz.ear.wrongSound')}
            </Text>
            <Text
              style={[s.resultText, { color: state === 'correct' ? COLORS.correct : COLORS.wrong }]}
            >
              {state === 'correct'
                ? t('quiz.ear.correctAnswer', { answer: q.answer })
                : t('quiz.ear.wrongAnswer', { answer: q.answer })}
            </Text>
          </View>
        )}

        <View style={s.unlockHint}>
          <Text style={s.unlockHintText}>{t('quiz.ear.unlockHint')}</Text>
        </View>
      </View>

      {/* Answer area */}
      <View style={s.answerArea}>
        {state === 'question' ? (
          <AnswerGrid options={q.options} onSelect={handleAnswer} />
        ) : (
          <NextButton onPress={handleNext} correct={state === 'correct'} />
        )}
      </View>

      {/* Soft guide modal for first visit (Issue #22) */}
      <SoftGuideModal
        visible={showGuide}
        levelId="ear"
        onContinue={handleContinue}
        onGoToLevel1={handleGoToLevel1}
      />
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
