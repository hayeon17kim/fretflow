/**
 * Step 2: 온보딩 미니퀴즈 (3문제)
 * 쉬운 → 보통 난이도로 진행, 즉각 피드백
 * 완료 후 결과 화면으로 이동, SM-2 카드로 등록
 */
import { useRouter } from 'expo-router';
import { useMemo, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fretboard } from '@/components/Fretboard';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { generateNoteCard, type NoteQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

const TOTAL_QUESTIONS = 3;

/** 온보딩용 카드 생성: 쉬운 포지션 (0~5프렛, 자연음) */
function generateOnboardingCards(): NoteQuestionCard[] {
  const cards: NoteQuestionCard[] = [];
  const usedIds = new Set<string>();

  while (cards.length < TOTAL_QUESTIONS) {
    const card = generateNoteCard();
    // 온보딩용: 0~7프렛으로 제한하여 쉬운 문제
    if (card.fret <= 7 && !usedIds.has(card.id)) {
      usedIds.add(card.id);
      cards.push(card);
    }
  }
  return cards;
}

export default function OnboardingMiniQuizScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { addCard, recordReview } = useSpacedRepetition();

  const questions = useMemo(() => generateOnboardingCards(), []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<'question' | 'correct' | 'wrong'>('question');
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const q = questions[currentIdx];
  const progress = currentIdx + (state !== 'question' ? 1 : 0);

  const handleAnswer = useCallback(
    (index: number) => {
      if (state !== 'question') return;
      const correct = q.options[index] === q.answer;
      const responseTime = Date.now() - startTime;

      setState(correct ? 'correct' : 'wrong');
      if (correct) setCorrectCount((prev) => prev + 1);

      // SM-2 카드로 등록 및 리뷰 기록
      addCard({
        id: q.id,
        type: 'note',
        question: { string: q.string, fret: q.fret } as any,
      });
      recordReview(q.id, correct, responseTime);
    },
    [state, q, startTime, addCard, recordReview],
  );

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= TOTAL_QUESTIONS) {
      // 미니퀴즈 완료 → 결과 화면
      router.push({
        pathname: '/onboarding/result',
        params: {
          correct: correctCount.toString(),
          total: TOTAL_QUESTIONS.toString(),
        },
      });
      return;
    }

    // 다음 문제로 전환 (fade animation)
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentIdx((prev) => prev + 1);
    setState('question');
    setStartTime(Date.now());
  }, [currentIdx, correctCount, fadeAnim, router]);

  const handleSkip = () => {
    router.push('/onboarding/goal');
  };

  return (
    <View style={[s.container, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.progressBarBg}>
          <View
            style={[
              s.progressBarFill,
              { width: `${(progress / TOTAL_QUESTIONS) * 100}%` },
            ]}
          />
        </View>
        <Pressable onPress={handleSkip}>
          <Text style={s.skipText}>{t('onboardingFlow.skip')}</Text>
        </Pressable>
      </View>

      {/* Quiz Card */}
      <Animated.View style={[s.cardArea, { opacity: fadeAnim }]}>
        <Text style={s.stepIndicator}>
          {t('common.progress', { current: currentIdx + 1, total: TOTAL_QUESTIONS })}
        </Text>

        {/* Position label */}
        <Text style={s.positionLabel}>
          {t('quiz.note.position', { string: q.string, fret: q.fret })}
        </Text>

        {/* Fretboard */}
        <View style={s.fretboardWrap}>
          <Fretboard
            startFret={Math.max(0, q.fret - 2)}
            endFret={Math.max(0, q.fret - 2) + 4}
            highlights={[
              {
                string: q.string,
                fret: q.fret,
                color:
                  state === 'correct'
                    ? COLORS.correct
                    : state === 'wrong'
                      ? COLORS.wrong
                      : COLORS.accent,
                label: state !== 'question' ? q.answer : '?',
              },
            ]}
          />
        </View>

        {/* Feedback */}
        <View style={s.feedbackArea}>
          {state === 'correct' && (
            <Text style={s.feedbackCorrect}>{t('onboardingFlow.miniQuiz.correct')}</Text>
          )}
          {state === 'wrong' && (
            <Text style={s.feedbackWrong}>
              {t('onboardingFlow.miniQuiz.wrongFeedback', { answer: q.answer })}
            </Text>
          )}
          {state === 'question' && (
            <Text style={s.questionText}>{t('quiz.note.question')}</Text>
          )}
        </View>
      </Animated.View>

      {/* Answer buttons / Next */}
      <View style={[s.answerArea, { paddingBottom: insets.bottom + 20 }]}>
        {state === 'question' ? (
          <View style={s.optionsGrid}>
            {q.options.map((opt, i) => (
              <Pressable
                key={`${opt}-${i}`}
                style={s.optionButton}
                onPress={() => handleAnswer(i)}
              >
                <Text style={s.optionText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            style={[s.nextButton, state === 'correct' ? s.nextCorrect : s.nextWrong]}
            onPress={handleNext}
          >
            <Text style={s.nextButtonText}>
              {currentIdx + 1 >= TOTAL_QUESTIONS
                ? t('onboardingFlow.miniQuiz.seeResult')
                : t('common.next')}
            </Text>
          </Pressable>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.track1,
    borderRadius: 2,
  },
  skipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
    letterSpacing: 1,
  },
  positionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  fretboardWrap: {
    width: '100%',
    marginVertical: SPACING.lg,
  },
  feedbackArea: {
    marginTop: SPACING.md,
    alignItems: 'center',
    minHeight: 48,
  },
  feedbackCorrect: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.correct,
  },
  feedbackWrong: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.wrong,
    textAlign: 'center',
    lineHeight: 22,
  },
  questionText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  answerArea: {
    paddingTop: SPACING.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  optionText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nextButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextCorrect: {
    backgroundColor: COLORS.correct,
  },
  nextWrong: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
