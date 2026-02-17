import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { NextButton } from '@/components/quiz/AnswerGrid';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { PhaseUnlockToast } from '@/components/quiz/PhaseUnlockToast';
import { NotePhase1View } from '@/components/quiz/NotePhase1View';
import { NotePhase2View } from '@/components/quiz/NotePhase2View';
import { NotePhase3View } from '@/components/quiz/NotePhase3View';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizInit } from '@/hooks/useQuizInit';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { usePhaseStore } from '@/stores/usePhaseStore';
import type { Phase } from '@/stores/usePhaseStore';
import type { NoteQuestionCard } from '@/utils/cardGenerator';
import { COLORS, SPACING } from '@/utils/constants';
import { navigateToQuizCompletion, recordQuizAnswer } from '@/utils/quizHelpers';

export default function QuizNoteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview } = useSpacedRepetition();
  const { showGoalToast } = useGoalAchievement();

  // Initialize quiz with tier-based progression
  const { questions } = useQuizInit<NoteQuestionCard>({ trackId: 'note' });

  const {
    currentCard: card,
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

  // Phase unlock tracking
  const currentPhase = usePhaseStore((s) => s.unlockedPhases.note);
  const [showPhaseUnlock, setShowPhaseUnlock] = useState(false);
  const [unlockedPhase, setUnlockedPhase] = useState<Phase>(1);
  const previousPhaseRef = useRef<Phase>(currentPhase);

  // Watch for phase unlocks
  useEffect(() => {
    if (currentPhase > previousPhaseRef.current) {
      setUnlockedPhase(currentPhase);
      setShowPhaseUnlock(true);
      previousPhaseRef.current = currentPhase;

      // Hide toast after 3.5 seconds
      setTimeout(() => setShowPhaseUnlock(false), 3500);
    }
  }, [currentPhase]);

  // Handle answer from phase views
  const handleAnswer = useCallback(
    (correct: boolean) => {
      recordQuizAnswer({
        cardId: card.id,
        trackId: 'note',
        isCorrect: correct,
        questionData: {
          phase: card.phase,
          targetNote: card.targetNote || card.answer,
        } as any,
        recordAnswer,
        addCard,
        recordReview,
      });
    },
    [card, recordAnswer, addCard, recordReview],
  );

  const handleNext = () => {
    nextCard(() => {
      navigateToQuizCompletion({ router, correctCount, total, trackId: 'note' });
    });
  };

  // Render appropriate phase view
  const renderPhaseView = () => {
    switch (card.phase) {
      case 1:
        return <NotePhase1View card={card} state={state} onAnswer={handleAnswer} />;
      case 2:
        return <NotePhase2View card={card} state={state} onAnswer={handleAnswer} />;
      case 3:
        return <NotePhase3View card={card} state={state} onAnswer={handleAnswer} />;
      default:
        throw new Error(`[QuizNoteScreen] Unknown phase: ${card.phase}`);
    }
  };

  return (
    <View style={s.container}>
      <GoalAchievedToast visible={showGoalToast} />
      <PhaseUnlockToast visible={showPhaseUnlock} trackId="note" newPhase={unlockedPhase} />
      <QuizHeader
        label={t('quiz.note.title')}
        color={COLORS.track1}
        progress={progress}
        total={total}
        onBack={() => router.back()}
      />

      {/* Card */}
      <QuizCard state={state}>{renderPhaseView()}</QuizCard>

      {/* Answer area (Next button shown after answer) */}
      {state !== 'question' && (
        <View style={s.answerArea}>
          <NextButton onPress={handleNext} correct={state === 'correct'} />
        </View>
      )}
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
  answerArea: {
    marginTop: SPACING.lg,
  },
});
