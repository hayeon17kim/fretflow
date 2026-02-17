import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { PlayButton } from '@/components/quiz/AudioControls';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { NotePhase1View } from '@/components/quiz/NotePhase1View';
import { NotePhase2View } from '@/components/quiz/NotePhase2View';
import { NotePhase3View } from '@/components/quiz/NotePhase3View';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { ScalePhase1View } from '@/components/quiz/ScalePhase1View';
import { ScalePhase2View } from '@/components/quiz/ScalePhase2View';
import { ScalePhase3View } from '@/components/quiz/ScalePhase3View';
import { TRACKS, type TrackId } from '@/config/tracks';
import { useEarTrainingAudio } from '@/hooks/useEarTrainingAudio';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { usePhaseStore } from '@/stores/usePhaseStore';
import {
  type EarQuestionCard,
  type NoteQuestionCard,
  type ScaleQuestionCard,
  generateCardBatch,
} from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import { navigateToQuizCompletion, recordQuizAnswer } from '@/utils/quizHelpers';

// ─── Mixed card type ───
type MixedCard = (
  | NoteQuestionCard
  | ScaleQuestionCard
  | EarQuestionCard
) & {
  trackId: TrackId;
  trackColor: string;
};

// ─── Shuffle cards to avoid 3+ consecutive same track ───
function shuffleWithTrackSpread<T extends { trackId: string }>(cards: T[]): T[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  const result: T[] = [];

  // Try to avoid 3+ consecutive same track
  for (const card of shuffled) {
    // Find best insertion point (where it won't create 3 consecutive)
    let inserted = false;
    for (let i = 0; i <= result.length; i++) {
      const prev1 = result[i - 1];
      const prev2 = result[i - 2];
      const next1 = result[i];
      const next2 = result[i + 1];

      // Check if inserting here creates 3 consecutive
      const creates3Before = prev1?.trackId === card.trackId && prev2?.trackId === card.trackId;
      const creates3After = next1?.trackId === card.trackId && next2?.trackId === card.trackId;
      const creates3Middle = prev1?.trackId === card.trackId && next1?.trackId === card.trackId;

      if (!creates3Before && !creates3After && !creates3Middle) {
        result.splice(i, 0, card);
        inserted = true;
        break;
      }
    }

    // If no good spot found, just append
    if (!inserted) {
      result.push(card);
    }
  }

  return result;
}

export default function QuizMixScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addCard, recordReview, getMasteredCards, getDueCards } = useSpacedRepetition();
  const params = useLocalSearchParams();
  const { showGoalToast } = useGoalAchievement();
  const getCurrentPhase = usePhaseStore((state) => state.getCurrentPhase);

  // Get session size from params, default to 10
  const sessionSize = params.sessionSize ? parseInt(params.sessionSize as string, 10) : 10;

  // Generate mixed cards from all tracks with phase support
  const questions = useMemo(() => {
    const cards: MixedCard[] = [];

    // Distribute cards evenly across all tracks
    const perTrack = Math.floor(sessionSize / TRACKS.length);
    const remainder = sessionSize % TRACKS.length;

    TRACKS.forEach((track, index) => {
      const masteredCount = getMasteredCards(track.id).length;
      // Give remainder cards to first few tracks
      const trackCardCount = perTrack + (index < remainder ? 1 : 0);

      // Get current phase for this track
      const currentPhase =
        track.id === 'note' || track.id === 'scale' ? getCurrentPhase(track.id) : 1;

      // Generate batch of cards with phase distribution
      const batchCards = generateCardBatch(track.id, trackCardCount, masteredCount, currentPhase);

      batchCards.forEach((card) => {
        cards.push({
          ...card,
          trackId: track.id,
          trackColor: track.color,
        } as MixedCard);
      });
    });

    // Shuffle to avoid 3+ consecutive same track
    return shuffleWithTrackSpread(cards);
  }, [sessionSize, getMasteredCards, getCurrentPhase]);

  const {
    currentCard: q,
    state,
    total,
    progress,
    correctCount,
    recordAnswer,
    nextCard,
  } = useQuizSession({
    cards: questions,
  });

  // Audio hook for ear training cards
  const earCards = useMemo(
    () => questions.filter((c) => c.type === 'ear') as EarQuestionCard[],
    [questions],
  );
  const { playing, playSound, stopSound } = useEarTrainingAudio({
    questions: earCards,
    currentAnswer: q.type === 'ear' ? q.answer : undefined,
    autoPlay: true,
    questionId: q.id,
    questionState: state,
  });


  // ─── Answer handlers ───
  const handleNoteAnswer = useCallback(
    (correct: boolean) => {
      if (q.type !== 'note') return;
      recordQuizAnswer({
        cardId: q.id,
        trackId: 'note',
        isCorrect: correct,
        questionData: { phase: q.phase, targetNote: q.targetNote || q.answer },
        recordAnswer,
        addCard,
        recordReview,
      });
    },
    [q, recordAnswer, addCard, recordReview],
  );

  const handleScaleAnswer = useCallback(
    (correct: boolean) => {
      if (q.type !== 'scale') return;
      recordQuizAnswer({
        cardId: q.id,
        trackId: 'scale',
        isCorrect: correct,
        questionData: { scaleName: q.scaleName, phase: q.phase },
        recordAnswer,
        addCard,
        recordReview,
      });
    },
    [q, recordAnswer, addCard, recordReview],
  );

  const handleAnswerGrid = (index: number) => {
    if (state !== 'question') return;
    if (q.type !== 'note' && q.type !== 'ear') return;

    const correct = q.options && q.options[index] === q.answer;
    if (q.type === 'ear') stopSound();

    recordQuizAnswer({
      cardId: q.id,
      trackId: q.type,
      isCorrect: correct,
      questionData: q.type === 'note' ? { string: q.string, fret: q.fret } : { note: q.answer },
      recordAnswer,
      addCard,
      recordReview,
    });
  };

  const handleNext = async () => {
    await stopSound();

    nextCard(() => {
      navigateToQuizCompletion({
        router,
        correctCount,
        total,
        trackId: 'note', // Use 'note' as default for mix mode
      });
    });
  };

  // Render phase-specific view for Note and Scale tracks
  const renderPhaseView = () => {
    if (q.type === 'note') {
      switch (q.phase) {
        case 1:
          return <NotePhase1View card={q} state={state} onAnswer={handleNoteAnswer} />;
        case 2:
          return <NotePhase2View card={q} state={state} onAnswer={handleNoteAnswer} />;
        case 3:
          return <NotePhase3View card={q} state={state} onAnswer={handleNoteAnswer} />;
        default:
          return null;
      }
    }

    if (q.type === 'scale') {
      switch (q.phase) {
        case 1:
          return <ScalePhase1View card={q} state={state} onAnswer={handleScaleAnswer} />;
        case 2:
          return <ScalePhase2View card={q} state={state} onAnswer={handleScaleAnswer} />;
        case 3:
          return <ScalePhase3View card={q} state={state} onAnswer={handleScaleAnswer} />;
        default:
          return null;
      }
    }

    return null;
  };


  return (
    <View style={s.container}>
      <GoalAchievedToast visible={showGoalToast} />
      <QuizHeader
        label={t('practice.mixMode')}
        color={q.trackColor}
        progress={progress}
        total={total}
        onBack={() => router.back()}
        badge={`${TRACKS.find((t) => t.id === q.trackId)?.emoji} ${t(`tracks.${q.trackId}.label`)}`}
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
        {/* Track badge */}
        <View style={[s.trackBadge, { backgroundColor: `${q.trackColor}20` }]}>
          <Text style={[s.trackBadgeText, { color: q.trackColor }]}>
            {TRACKS.find((t) => t.id === q.trackId)?.emoji} {t(`tracks.${q.trackId}.label`)}
          </Text>
        </View>

        {/* Question content based on type */}
        {(q.type === 'note' || q.type === 'scale') && renderPhaseView()}

        {q.type === 'ear' && (
          <>
            <Text style={s.modeDesc}>{t('quiz.ear.modeDesc')}</Text>
            <PlayButton playing={playing} onPress={playSound} />
            <Text style={s.playLabel}>
              {playing ? t('quiz.ear.playing') : t('quiz.ear.playSound')}
            </Text>
            {state !== 'question' && (
              <Text
                style={[
                  s.resultText,
                  { color: state === 'correct' ? COLORS.correct : COLORS.wrong },
                ]}
              >
                {state === 'correct'
                  ? t('quiz.ear.correctAnswer', { answer: q.answer })
                  : t('quiz.ear.wrongAnswer', { answer: q.answer })}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Answer area */}
      <View style={s.answerArea}>
        {state === 'question' ? (
          <>
            {q.type === 'ear' && q.options && (
              <AnswerGrid options={q.options} onSelect={handleAnswerGrid} />
            )}
            {/* Note and Scale phase views handle their own answer inputs */}
          </>
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
    padding: SPACING.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  trackBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  questionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
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
  questionText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  resultCorrect: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: '700',
    color: COLORS.correct,
    marginTop: SPACING.md,
  },
  resultWrong: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: '700',
    color: COLORS.wrong,
    marginTop: SPACING.md,
  },
  resultText: {
    fontSize: FONT_SIZE.lg + 1,
    fontWeight: '700',
    marginTop: SPACING.md,
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
  answerArea: {
    marginTop: SPACING.lg,
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
