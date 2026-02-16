import { create } from 'zustand';

interface AppState {
  // 현재 활성 레벨
  activeLevel: 1 | 2 | 3 | 4 | null;
  setActiveLevel: (level: 1 | 2 | 3 | 4 | null) => void;

  // 오늘의 학습 통계
  todayStats: {
    cardsReviewed: number;
    correctCount: number;
    streak: number;
  };
  incrementReview: (correct: boolean) => void;
  resetDailyStats: () => void;

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

export const useAppStore = create<AppState>((set) => ({
  activeLevel: null,
  setActiveLevel: (level) => set({ activeLevel: level }),

  todayStats: {
    cardsReviewed: 0,
    correctCount: 0,
    streak: 0,
  },
  incrementReview: (correct) =>
    set((state) => ({
      todayStats: {
        cardsReviewed: state.todayStats.cardsReviewed + 1,
        correctCount: state.todayStats.correctCount + (correct ? 1 : 0),
        streak: correct ? state.todayStats.streak + 1 : 0,
      },
    })),
  resetDailyStats: () => set({ todayStats: { cardsReviewed: 0, correctCount: 0, streak: 0 } }),

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
}));
