/**
 * Phase Store
 *
 * Manages quiz format phase progression for Note and Scale tracks.
 *
 * Phase system controls HOW questions are asked (format difficulty),
 * independent of Tier system which controls WHAT content is shown.
 *
 * Phase unlocking: 5 consecutive correct answers unlock next phase
 */

import { Platform } from 'react-native';
import { create, type StateCreator } from 'zustand';
import { appStorage } from '@/utils/storage';

// Only import persist on native platforms to avoid import.meta issues on web
let persist: any;
let createJSONStorage: any;

if (Platform.OS !== 'web') {
  const middleware = require('zustand/middleware');
  persist = middleware.persist;
  createJSONStorage = middleware.createJSONStorage;
}

// MMKV storage adapter for Zustand persist (native only)
const mmkvStorage = {
  getItem: (name: string) => {
    const value = appStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    appStorage.set(name, value);
  },
  removeItem: (name: string) => {
    appStorage.delete(name);
  },
};

export type TrackWithPhase = 'note' | 'scale';
export type Phase = 1 | 2 | 3;

interface PhaseState {
  // 트랙별 해금된 최고 Phase
  unlockedPhases: {
    note: Phase;
    scale: Phase;
  };

  // 트랙별 연속 정답 카운트 (Phase 해금용)
  consecutiveCorrect: {
    note: number;
    scale: number;
  };

  // Actions
  getCurrentPhase: (trackId: TrackWithPhase) => Phase;
  recordPhaseAnswer: (trackId: TrackWithPhase, correct: boolean) => void;
  unlockNextPhase: (trackId: TrackWithPhase) => void;
  resetConsecutiveCount: (trackId: TrackWithPhase) => void;
}

// Store implementation
const storeImpl: StateCreator<PhaseState> = (set, get) => ({
  // Default: all tracks start at Phase 1
  unlockedPhases: {
    note: 1,
    scale: 1,
  },

  // Consecutive correct count for phase unlocking
  consecutiveCorrect: {
    note: 0,
    scale: 0,
  },

  // Get current unlocked phase for a track
  getCurrentPhase: (trackId) => {
    return get().unlockedPhases[trackId];
  },

  // Record answer and potentially unlock next phase
  recordPhaseAnswer: (trackId, correct) => {
    const state = get();
    const currentPhase = state.unlockedPhases[trackId];
    const currentCount = state.consecutiveCorrect[trackId];

    if (correct) {
      const newCount = currentCount + 1;

      // Update consecutive count
      set((state) => ({
        consecutiveCorrect: {
          ...state.consecutiveCorrect,
          [trackId]: newCount,
        },
      }));

      // Check if we should unlock next phase (5 consecutive correct)
      if (newCount >= 5 && currentPhase < 3) {
        get().unlockNextPhase(trackId);
      }
    } else {
      // Reset consecutive count on wrong answer
      get().resetConsecutiveCount(trackId);
    }
  },

  // Unlock next phase (called when 5 consecutive correct)
  unlockNextPhase: (trackId) => {
    const state = get();
    const currentPhase = state.unlockedPhases[trackId];

    if (currentPhase < 3) {
      const newPhase = (currentPhase + 1) as Phase;

      set((state) => ({
        unlockedPhases: {
          ...state.unlockedPhases,
          [trackId]: newPhase,
        },
        // Reset consecutive count after unlocking
        consecutiveCorrect: {
          ...state.consecutiveCorrect,
          [trackId]: 0,
        },
      }));
    }
  },

  // Reset consecutive count (on wrong answer)
  resetConsecutiveCount: (trackId) => {
    set((state) => ({
      consecutiveCorrect: {
        ...state.consecutiveCorrect,
        [trackId]: 0,
      },
    }));
  },
});

// Conditionally apply persist middleware based on platform
export const usePhaseStore =
  Platform.OS !== 'web'
    ? create<PhaseState>()(
        persist(storeImpl, {
          name: 'phase-store',
          storage: createJSONStorage(() => mmkvStorage),
        }),
      )
    : create<PhaseState>()(storeImpl);
