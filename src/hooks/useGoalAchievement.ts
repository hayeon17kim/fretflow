import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Hook to detect when daily goal is achieved and show toast
 * @returns showGoalToast - whether to show the goal achievement toast
 */
export function useGoalAchievement() {
  const [showToast, setShowToast] = useState(false);
  const prevGoalAchieved = useRef(false);
  const goalAchievedToday = useAppStore((s) => s.todayStats.goalAchievedToday);

  useEffect(() => {
    // Detect the moment when goal is achieved for the first time
    if (!prevGoalAchieved.current && goalAchievedToday) {
      setShowToast(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    }
    prevGoalAchieved.current = goalAchievedToday;
  }, [goalAchievedToday]);

  return { showGoalToast: showToast };
}
