import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { PlayButton } from '@/components/quiz/AudioControls';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { SoftGuideModal } from '@/components/SoftGuideModal';
import { getAvailableSounds, getCurrentTier } from '@/config/earTrainingTiers';
import { QUIZ_ROUTES } from '@/config/routes';
import { useEarTrainingAudio } from '@/hooks/useEarTrainingAudio';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizInit } from '@/hooks/useQuizInit';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import type { EarQuestionCard } from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import { navigateToQuizCompletion, recordQuizAnswer } from '@/utils/quizHelpers';

export default function QuizEarScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview } = useSpacedRepetition();
  const { showGoalToast } = useGoalAchievement();

  // Initialize quiz with tier-based progression
  const { questions, masteredCount } = useQuizInit<EarQuestionCard>({ trackId: 'ear' });

  // Calculate current tier
  const currentTier = getCurrentTier(masteredCount);
  const availableSounds = getAvailableSounds(masteredCount);

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

  // Audio hook for ear training
  const { playing, playSound, stopSound } = useEarTrainingAudio({
    questions,
    currentAnswer: q.answer,
    autoPlay: true,
    questionId: q.id,
    questionState: state,
  });

  // Soft guide for first visit (Issue #22)
  const trackFirstVisit = useAppStore((s) => s.trackFirstVisit);
  const markTrackVisited = useAppStore((s) => s.markTrackVisited);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!trackFirstVisit.ear) {
      setShowGuide(true);
    }
  }, [trackFirstVisit.ear]);

  const handleContinue = () => {
    markTrackVisited('ear');
    setShowGuide(false);
  };

  const handleGoToLevel1 = () => {
    markTrackVisited('ear');
    setShowGuide(false);
    router.replace(QUIZ_ROUTES.note);
  };


  const handleAnswer = (index: number) => {
    if (state !== 'question') return;
    const correct = q.options[index] === q.answer;
    stopSound();

    recordQuizAnswer({
      cardId: q.id,
      trackId: 'ear',
      isCorrect: correct,
      questionData: { note: q.answer } as any,
      recordAnswer,
      addCard,
      recordReview,
    });
  };

  const handleNext = async () => {
    await stopSound();
    nextCard(() => {
      navigateToQuizCompletion({ router, correctCount, total, trackId: 'ear' });
    });
  };

  return (
    <View style={s.container}>
      <GoalAchievedToast visible={showGoalToast} />
      <QuizHeader
        label={t('quiz.ear.title')}
        color={COLORS.track4}
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
        trackId="ear"
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
    backgroundColor: `${COLORS.track4}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  quizBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.track4,
  },
  modeDesc: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
  },
  playLabel: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
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
