import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fretboard, type FretHighlight } from '@/components/Fretboard';
import { AnswerGrid, NextButton } from '@/components/quiz/AnswerGrid';
import { PlayButton } from '@/components/quiz/AudioControls';
import { GoalAchievedToast } from '@/components/quiz/GoalAchievedToast';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { TRACKS, type TrackId } from '@/config/tracks';
import { useEarTrainingAudio } from '@/hooks/useEarTrainingAudio';
import { useGoalAchievement } from '@/hooks/useGoalAchievement';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import type { FretPosition } from '@/types/music';
import {
  type EarQuestionCard,
  generateEarCard,
  generateIntervalCard,
  type IntervalQuestionCard,
  generateNoteCard,
  type NoteQuestionCard,
  generateScaleCard,
  type ScaleQuestionCard,
} from '@/utils/cardGenerator';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import { getNoteAtPosition } from '@/utils/music';
import { navigateToQuizCompletion, recordQuizAnswer } from '@/utils/quizHelpers';

// ─── Mixed card type ───
type MixedCard = (
  | NoteQuestionCard
  | IntervalQuestionCard
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

  // Get session size from params, default to 10
  const sessionSize = params.sessionSize ? parseInt(params.sessionSize as string, 10) : 10;

  // Generate mixed cards from all tracks
  const questions = useMemo(() => {
    const cards: MixedCard[] = [];

    // Distribute cards evenly across all tracks
    const perTrack = Math.floor(sessionSize / TRACKS.length);
    const remainder = sessionSize % TRACKS.length;

    TRACKS.forEach((track, index) => {
      const masteredCount = getMasteredCards(track.id).length;
      // Give remainder cards to first few tracks
      const trackCardCount = perTrack + (index < remainder ? 1 : 0);

      for (let i = 0; i < trackCardCount; i++) {
        let card: MixedCard;
        switch (track.id) {
          case 'note':
            card = {
              ...generateNoteCard(masteredCount),
              trackId: track.id,
              trackColor: track.color,
            };
            break;
          case 'interval':
            card = {
              ...generateIntervalCard(masteredCount),
              trackId: track.id,
              trackColor: track.color,
            };
            break;
          case 'scale':
            card = {
              ...generateScaleCard(masteredCount),
              trackId: track.id,
              trackColor: track.color,
            };
            break;
          case 'ear':
            card = {
              ...generateEarCard(masteredCount),
              trackId: track.id,
              trackColor: track.color,
            };
            break;
        }
        cards.push(card);
      }
    });

    // Shuffle to avoid 3+ consecutive same track
    return shuffleWithTrackSpread(cards);
  }, [sessionSize, getMasteredCards]);

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

  // ─── State for different quiz types ───
  const [tapped, setTapped] = useState<FretPosition | null>(null);
  const [selectedScale, setSelectedScale] = useState<FretPosition[]>([]);

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
  const handleAnswerGrid = (index: number) => {
    if (state !== 'question') return;
    if (q.type !== 'note' && q.type !== 'ear') return;

    const correct = q.options[index] === q.answer;
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

  const handleTapInterval = (pos: FretPosition) => {
    if (state !== 'question' || q.type !== 'interval') return;
    if (tapped?.string === pos.string && tapped?.fret === pos.fret) {
      setTapped(null);
    } else {
      setTapped(pos);
    }
  };

  const confirmInterval = () => {
    if (!tapped || q.type !== 'interval') return;
    const correct =
      tapped.string === q.targetPosition.string && tapped.fret === q.targetPosition.fret;

    recordQuizAnswer({
      cardId: q.id,
      trackId: 'interval',
      isCorrect: correct,
      questionData: { rootPosition: q.rootPosition, targetPosition: q.targetPosition } as any,
      recordAnswer,
      addCard,
      recordReview,
    });
  };

  const handleTapScale = (pos: FretPosition) => {
    if (state !== 'question' || q.type !== 'scale') return;
    const isSelected = selectedScale.some((p) => p.string === pos.string && p.fret === pos.fret);
    if (isSelected) {
      setSelectedScale((prev) =>
        prev.filter((p) => !(p.string === pos.string && p.fret === pos.fret)),
      );
    } else {
      setSelectedScale((prev) => [...prev, pos]);
    }
  };

  const confirmScale = () => {
    if (q.type !== 'scale') return;
    const correctSelections = selectedScale.filter((p) =>
      q.correctPositions.some((cp) => cp.string === p.string && cp.fret === p.fret),
    ).length;
    const wrongSelections = selectedScale.filter(
      (p) => !q.correctPositions.some((cp) => cp.string === p.string && cp.fret === p.fret),
    ).length;
    const accuracy = Math.round((correctSelections / q.correctPositions.length) * 100);
    const correct = accuracy >= 80 && wrongSelections === 0;

    recordQuizAnswer({
      cardId: q.id,
      trackId: 'scale',
      isCorrect: correct,
      questionData: { scaleName: q.scaleName, positions: q.correctPositions } as any,
      recordAnswer,
      addCard,
      recordReview,
    });
  };

  const handleNext = async () => {
    await stopSound();
    setTapped(null);
    setSelectedScale([]);

    nextCard(() => {
      navigateToQuizCompletion({
        router,
        correctCount,
        total,
        trackId: 'note', // Use 'note' as default for mix mode
      });
    });
  };

  // ─── Build highlights for fretboard ───
  const buildHighlights = (): FretHighlight[] => {
    if (q.type === 'note') {
      return [
        {
          string: q.string,
          fret: q.fret,
          color:
            state === 'correct' ? COLORS.correct : state === 'wrong' ? COLORS.wrong : COLORS.accent,
          label: state !== 'question' ? q.answer : '?',
        },
      ];
    }

    if (q.type === 'interval') {
      const highlights: FretHighlight[] = [
        {
          string: q.rootPosition.string,
          fret: q.rootPosition.fret,
          color: COLORS.correct,
          label: getNoteAtPosition(q.rootPosition),
        },
      ];

      if (state === 'question' && tapped) {
        highlights.push({
          string: tapped.string,
          fret: tapped.fret,
          color: q.trackColor,
          label: '?',
          textColor: '#fff',
        });
      }

      if (state !== 'question') {
        if (state === 'wrong' && tapped) {
          highlights.push({
            string: tapped.string,
            fret: tapped.fret,
            color: COLORS.wrong,
            label: '✕',
            textColor: '#fff',
          });
        }
        highlights.push({
          string: q.targetPosition.string,
          fret: q.targetPosition.fret,
          color: COLORS.correct,
          label: getNoteAtPosition(q.targetPosition),
          border: COLORS.correct,
        });
      }

      return highlights;
    }

    if (q.type === 'scale') {
      const highlights: FretHighlight[] = [];

      q.correctPositions.forEach((pos) => {
        const isSelected = selectedScale.some(
          (p) => p.string === pos.string && p.fret === pos.fret,
        );

        if (state === 'question') {
          if (isSelected) {
            highlights.push({
              string: pos.string,
              fret: pos.fret,
              color: q.trackColor,
              label: '●',
              textColor: '#fff',
            });
          }
        } else {
          if (isSelected) {
            highlights.push({
              string: pos.string,
              fret: pos.fret,
              color: COLORS.correct,
              label: '✓',
            });
          } else {
            highlights.push({
              string: pos.string,
              fret: pos.fret,
              color: `${COLORS.correct}40`,
              label: '○',
              textColor: COLORS.correct,
              border: COLORS.correct,
              opacity: 0.6,
            });
          }
        }
      });

      // Show wrong selections
      if (state !== 'question') {
        selectedScale.forEach((pos) => {
          const isCorrect = q.correctPositions.some(
            (cp) => cp.string === pos.string && cp.fret === pos.fret,
          );
          if (!isCorrect) {
            highlights.push({
              string: pos.string,
              fret: pos.fret,
              color: COLORS.wrong,
              label: '✕',
              textColor: '#fff',
            });
          }
        });
      }

      return highlights;
    }

    return [];
  };

  // Get fretboard range based on card type
  const getFretRange = (): [number, number] => {
    if (q.type === 'note') {
      return [Math.max(0, q.fret - 2), Math.max(0, q.fret - 2) + 4];
    }
    if (q.type === 'interval') {
      const minFret = Math.max(0, q.rootPosition.fret - 1);
      const maxFret = Math.min(q.targetPosition.fret + 2, 15);
      return [minFret, maxFret];
    }
    if (q.type === 'scale') {
      const frets = q.correctPositions.map((p) => p.fret);
      const minFret = Math.min(...frets);
      const maxFret = Math.min(Math.max(...frets) + 2, 15);
      return [minFret, maxFret];
    }
    return [0, 4];
  };

  const [startFret, endFret] = getFretRange();

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
        {q.type === 'note' && (
          <>
            <Text style={s.questionLabel}>
              {t('quiz.note.position', { string: q.string, fret: q.fret })}
            </Text>
            <Fretboard startFret={startFret} endFret={endFret} highlights={buildHighlights()} />
            {state === 'correct' && <Text style={s.resultCorrect}>{t('quiz.note.correct')}</Text>}
            {state === 'wrong' && (
              <Text style={s.resultWrong}>{t('quiz.note.wrongAnswer', { answer: q.answer })}</Text>
            )}
            {state === 'question' && <Text style={s.questionText}>{t('quiz.note.question')}</Text>}
          </>
        )}

        {q.type === 'interval' && (
          <>
            <Text style={s.questionMain}>
              {t('quiz.interval.questionMain', {
                rootNote: getNoteAtPosition(q.rootPosition),
                intervalName: t(`quiz.interval.intervalNames.${q.answer}`),
              })}
            </Text>
            <Text style={s.questionSub}>{t('quiz.interval.questionSub')}</Text>
            <Fretboard
              startFret={startFret}
              endFret={endFret}
              highlights={buildHighlights()}
              tappable={state === 'question'}
              onTap={handleTapInterval}
            />
          </>
        )}

        {q.type === 'scale' && (
          <>
            <Text style={s.questionMain}>
              {t('quiz.scale.questionMain', {
                scaleName: `${q.rootNote} ${t(`quiz.scale.scaleNames.${q.scaleName}`)}`,
                position: t('quiz.scale.position', { number: 1 }),
              })}
            </Text>
            <Text style={s.questionSub}>{t('quiz.scale.questionSub')}</Text>
            <Fretboard
              startFret={startFret}
              endFret={endFret}
              highlights={buildHighlights()}
              tappable={state === 'question'}
              onTap={handleTapScale}
            />
          </>
        )}

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
            {(q.type === 'note' || q.type === 'ear') && (
              <AnswerGrid options={q.options} onSelect={handleAnswerGrid} />
            )}
            {q.type === 'interval' && (
              <Pressable
                onPress={confirmInterval}
                disabled={!tapped}
                style={({ pressed }) => [
                  s.confirmBtn,
                  { backgroundColor: tapped ? q.trackColor : `${q.trackColor}30` },
                  pressed && tapped && { opacity: 0.8 },
                ]}
              >
                <Text style={[s.confirmText, { color: tapped ? '#fff' : COLORS.textTertiary }]}>
                  {tapped ? t('quiz.interval.confirmButton') : t('quiz.interval.selectPosition')}
                </Text>
              </Pressable>
            )}
            {q.type === 'scale' && (
              <Pressable
                onPress={confirmScale}
                disabled={selectedScale.length === 0}
                style={({ pressed }) => [
                  s.confirmBtn,
                  {
                    backgroundColor:
                      selectedScale.length > 0 ? q.trackColor : `${q.trackColor}40`,
                  },
                  pressed && selectedScale.length > 0 && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    s.confirmText,
                    { color: selectedScale.length > 0 ? '#fff' : COLORS.textTertiary },
                  ]}
                >
                  {t('quiz.scale.confirmButton', { count: selectedScale.length })}
                </Text>
              </Pressable>
            )}
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
