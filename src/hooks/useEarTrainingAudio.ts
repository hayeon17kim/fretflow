import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NoteWithOctave } from '@/config/earTrainingTiers';
import type { EarQuestionCard } from '@/utils/cardGenerator';
import { getSoundFile } from '@/utils/earTrainingSounds';

interface UseEarTrainingAudioOptions {
  questions: EarQuestionCard[];
  currentAnswer?: NoteWithOctave;
  autoPlay?: boolean;
  questionId?: string;
  questionState?: 'question' | 'correct' | 'wrong';
}

export function useEarTrainingAudio({
  questions,
  currentAnswer,
  autoPlay = true,
  questionId,
  questionState = 'question',
}: UseEarTrainingAudioOptions) {
  const [playing, setPlaying] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [preloadedSounds, setPreloadedSounds] = useState<Map<NoteWithOctave, Audio.Sound>>(
    new Map(),
  );

  // Setup audio and preload session sounds
  useEffect(() => {
    if (questions.length === 0) return;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.error('[useEarTrainingAudio] Failed to set audio mode:', error);
        setLoadingError('Failed to initialize audio');
      }
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
          console.warn(`[useEarTrainingAudio] Sound file not found: ${note}`);
          return;
        }

        try {
          const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: false });
          loadedMap.set(note, sound);
        } catch (error) {
          console.error(`[useEarTrainingAudio] Failed to preload sound ${note}:`, error);
          setLoadingError(`Failed to load sound: ${note}`);
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
  const playSound = useCallback(async () => {
    if (!currentAnswer) return;

    try {
      // Stop previous sound
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }

      setPlaying(true);

      // Try to use preloaded sound first
      const preloaded = preloadedSounds.get(currentAnswer);
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
        const soundFile = getSoundFile(currentAnswer);
        if (!soundFile) {
          console.warn(`[useEarTrainingAudio] Sound file not found: ${currentAnswer}`);
          setPlaying(false);
          setLoadingError(`Sound file not found: ${currentAnswer}`);
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
      console.error('[useEarTrainingAudio] Failed to play sound:', error);
      setPlaying(false);
      setLoadingError('Failed to play sound');
    }
  }, [currentAnswer, preloadedSounds]);

  // Auto-play sound when new question appears
  useEffect(() => {
    if (autoPlay && questionState === 'question' && preloadedSounds.size > 0 && currentAnswer) {
      playSound();
    }
  }, [questionId, questionState, preloadedSounds.size, playSound, autoPlay, currentAnswer]);

  // Stop sound
  const stopSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaying(false);
  }, []);

  return {
    playing,
    playSound,
    stopSound,
    loadingError,
    isReady: preloadedSounds.size > 0,
  };
}
