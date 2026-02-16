import { Platform } from 'react-native';
import { create, type StateCreator } from 'zustand';
import { appStorage } from '@/utils/storage';

// Only import persist on native platforms to avoid import.meta issues on web
let persist: any;
let createJSONStorage: any;
let StateStorage: any;

if (Platform.OS !== 'web') {
  const middleware = require('zustand/middleware');
  persist = middleware.persist;
  createJSONStorage = middleware.createJSONStorage;
  StateStorage = middleware.StateStorage;
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

interface AppState {
  // 현재 활성 레벨
  activeLevel: 1 | 2 | 3 | 4 | null;
  setActiveLevel: (level: 1 | 2 | 3 | 4 | null) => void;

  // 오늘의 학습 통계
  todayStats: {
    cardsReviewed: number;
    correctCount: number;
    streak: number;
    lastReviewDate: string | null; // ISO date (YYYY-MM-DD)
  };
  incrementReview: (correct: boolean) => void;
  resetDailyStats: () => void;
  checkAndResetDailyStats: () => void;

  // 온보딩 상태
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;

  // 사용자 설정
  settings: {
    username: string;
    dailyGoal: number; // 일일 목표 카드 수
    vibrationEnabled: boolean;
  };
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

// Store implementation
const storeImpl: StateCreator<AppState> = (set, get) => ({
      activeLevel: null,
      setActiveLevel: (level) => set({ activeLevel: level }),

      todayStats: {
        cardsReviewed: 0,
        correctCount: 0,
        streak: 0,
        lastReviewDate: null,
      },
      incrementReview: (correct) => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const state = get();
        const lastReview = state.todayStats.lastReviewDate;

        let newStreak = state.todayStats.streak;

        // If this is the first review of the day, handle streak logic
        if (lastReview !== today) {
          if (!lastReview) {
            // First time ever or after reset - start new streak
            newStreak = 1;
          } else {
            // Calculate days difference
            const lastDate = new Date(lastReview);
            const todayDate = new Date(today);
            const daysDiff = Math.floor(
              (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysDiff === 1) {
              // Consecutive day - increment streak
              newStreak = state.todayStats.streak + 1;
            } else if (daysDiff > 1) {
              // Missed days - reset to 1 (new streak starts today)
              newStreak = 1;
            }
          }
        }

        set((state) => ({
          todayStats: {
            cardsReviewed: state.todayStats.cardsReviewed + 1,
            correctCount: state.todayStats.correctCount + (correct ? 1 : 0),
            streak: newStreak,
            lastReviewDate: today,
          },
        }));
      },
      resetDailyStats: () =>
        set({
          todayStats: {
            cardsReviewed: 0,
            correctCount: 0,
            streak: 0,
            lastReviewDate: null,
          },
        }),
      checkAndResetDailyStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastReview = state.todayStats.lastReviewDate;

        // If no last review date or it's the same day, do nothing
        if (!lastReview || lastReview === today) {
          return;
        }

        // If it's a new day, reset daily counters
        // Note: Streak logic is handled in incrementReview on first review
        set({
          todayStats: {
            ...state.todayStats,
            cardsReviewed: 0,
            correctCount: 0,
          },
        });
      },

      hasSeenOnboarding: false,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

      settings: {
        username: '기타 학습자',
        dailyGoal: 20,
        vibrationEnabled: true,
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
});

// Conditionally apply persist middleware based on platform
export const useAppStore =
  Platform.OS !== 'web'
    ? create<AppState>()(
        persist(storeImpl, {
          name: 'app-store',
          storage: createJSONStorage(() => mmkvStorage),
          onRehydrateStorage: () => (state: AppState | undefined) => {
            // Check and reset daily stats after rehydration
            if (state) {
              state.checkAndResetDailyStats();
            }
          },
        }),
      )
    : create<AppState>()(storeImpl);
