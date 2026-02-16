import { SM2_DEFAULTS } from './constants';

// SM-2 알고리즘 구현
// quality: 0~5 (0=완전 틀림, 3=맞았지만 어려움, 5=완벽)

interface SM2Input {
  quality: number; // 0-5
  repetitions: number;
  easeFactor: number;
  interval: number;
}

interface SM2Output {
  repetitions: number;
  easeFactor: number;
  interval: number; // 일 단위
}

export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, repetitions, easeFactor, interval } = input;

  // quality < 3이면 리셋
  if (quality < 3) {
    return {
      repetitions: 0,
      easeFactor: easeFactor,
      interval: SM2_DEFAULTS.initialInterval,
    };
  }

  // 새 EF 계산
  const newEF = Math.max(
    SM2_DEFAULTS.minEaseFactor,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  // 새 interval 계산
  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEF);
  }

  return {
    repetitions: repetitions + 1,
    easeFactor: newEF,
    interval: newInterval,
  };
}

// quality 매핑: 퀴즈 결과 → SM-2 quality
export function mapResultToQuality(correct: boolean, responseTimeMs: number): number {
  if (!correct) return 1; // 틀림
  if (responseTimeMs < 3000) return 5; // 빠르게 맞춤
  if (responseTimeMs < 6000) return 4; // 적당히 맞춤
  return 3; // 느리게 맞춤
}
