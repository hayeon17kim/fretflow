import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { create, type StateCreator } from 'zustand';
import type { TrackId } from '@/config/tracks';
import type { BadgeLevel } from '@/utils/badges';
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
  // 현재 활성 트랙
  activeTrack: 1 | 2 | 3 | 4 | null;
  setActiveTrack: (track: 1 | 2 | 3 | 4 | null) => void;

  // 오늘의 학습 통계
  todayStats: {
    cardsReviewed: number;
    correctCount: number;
    streak: number;
    bestStreak: number;
    lastReviewDate: string | null; // ISO date (YYYY-MM-DD)
    goalAchievedToday: boolean;
    lastGoalAchievedDate: string | null; // ISO date (YYYY-MM-DD)
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
    notifications: {
      enabled: boolean;
      dailyReminderTime: string; // "HH:mm" format
      permissionGranted: boolean;
      lastPermissionRequest: string | null;
    };
  };
  updateSettings: (settings: Partial<AppState['settings']>) => void;

  // Badge tracking (for track-up detection) - Issue #22
  badgeLevels: {
    note: BadgeLevel;
    interval: BadgeLevel;
    scale: BadgeLevel;
    ear: BadgeLevel;
  };
  updateBadgeLevel: (trackId: TrackId, badge: BadgeLevel) => void;

  // First visit tracking for soft guide - Issue #22
  trackFirstVisit: {
    note: boolean;
    interval: boolean;
    scale: boolean;
    ear: boolean;
  };
  markTrackVisited: (trackId: TrackId) => void;
}

// Store implementation
const storeImpl: StateCreator<AppState> = (set, get) => ({
  activeTrack: null,
  setActiveTrack: (track) => set({ activeTrack: track }),

  todayStats: {
    cardsReviewed: 0,
    correctCount: 0,
    streak: 0,
    bestStreak: 0,
    lastReviewDate: null,
    goalAchievedToday: false,
    lastGoalAchievedDate: null,
  },
  incrementReview: (correct) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const state = get();
    const settings = state.settings;

    // If date changed, reset daily stats first
    if (state.todayStats.lastReviewDate !== today && state.todayStats.lastReviewDate !== null) {
      get().checkAndResetDailyStats();
    }

    const currentState = get(); // Get fresh state after potential reset
    const newCardsReviewed = currentState.todayStats.cardsReviewed + 1;
    const wasGoalAchieved = currentState.todayStats.goalAchievedToday;
    const isGoalAchieved = newCardsReviewed >= settings.dailyGoal;

    let newStreak = currentState.todayStats.streak;
    let newBestStreak = currentState.todayStats.bestStreak;
    let goalAchievedToday = wasGoalAchieved;
    let lastGoalAchievedDate = currentState.todayStats.lastGoalAchievedDate;

    // If goal is achieved for the first time today
    if (!wasGoalAchieved && isGoalAchieved) {
      newStreak = currentState.todayStats.streak + 1;
      newBestStreak = Math.max(newBestStreak, newStreak);
      goalAchievedToday = true;
      lastGoalAchievedDate = today;

      // Trigger haptic feedback if enabled
      if (settings.vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    set({
      todayStats: {
        cardsReviewed: newCardsReviewed,
        correctCount: currentState.todayStats.correctCount + (correct ? 1 : 0),
        streak: newStreak,
        bestStreak: newBestStreak,
        lastReviewDate: today,
        goalAchievedToday,
        lastGoalAchievedDate,
      },
    });
  },
  resetDailyStats: () =>
    set({
      todayStats: {
        cardsReviewed: 0,
        correctCount: 0,
        streak: 0,
        bestStreak: 0,
        lastReviewDate: null,
        goalAchievedToday: false,
        lastGoalAchievedDate: null,
      },
    }),
  checkAndResetDailyStats: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastReview = state.todayStats.lastReviewDate;
    const lastGoalAchieved = state.todayStats.lastGoalAchievedDate;

    // If no last review date or it's the same day, do nothing
    if (!lastReview || lastReview === today) {
      return;
    }

    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If yesterday's goal was not achieved, reset streak to 0
    let newStreak = state.todayStats.streak;
    if (lastGoalAchieved !== yesterdayStr) {
      newStreak = 0;
    }

    // Reset daily counters for the new day
    set({
      todayStats: {
        ...state.todayStats,
        cardsReviewed: 0,
        correctCount: 0,
        goalAchievedToday: false,
        streak: newStreak,
      },
    });
  },

  hasSeenOnboarding: false,
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

  settings: {
    username: '기타 학습자',
    dailyGoal: 20,
    vibrationEnabled: true,
    notifications: {
      enabled: true,
      dailyReminderTime: '19:00',
      permissionGranted: false,
      lastPermissionRequest: null,
    },
  },
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  // Badge tracking - Issue #22
  badgeLevels: {
    note: 'none',
    interval: 'none',
    scale: 'none',
    ear: 'none',
  },
  updateBadgeLevel: (trackId, badge) =>
    set((state) => ({
      badgeLevels: { ...state.badgeLevels, [trackId]: badge },
    })),

  // First visit tracking - Issue #22
  trackFirstVisit: {
    note: true, // Default tracks treated as visited
    interval: true,
    scale: false, // Will show soft guide
    ear: false,
  },
  markTrackVisited: (trackId) =>
    set((state) => ({
      trackFirstVisit: { ...state.trackFirstVisit, [trackId]: true },
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
