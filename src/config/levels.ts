import { COLORS } from '@/utils/constants';

export type LevelId = 'note' | 'interval' | 'scale' | 'ear';

export interface LevelConfig {
  id: LevelId;
  num: 1 | 2 | 3 | 4;
  emoji: string;
  label: string;
  labelEn: string;
  color: string;
  desc: string;
  example?: string;
  basic?: boolean;
}

export const LEVELS: readonly LevelConfig[] = [
  {
    id: 'note',
    num: 1,
    emoji: '🎵',
    label: '음 위치',
    labelEn: 'Note Position',
    color: COLORS.level1,
    desc: '프렛보드의 음 이름 외우기',
    example: '"5번줄 7프렛의 음은?" → 4지선다',
  },
  {
    id: 'interval',
    num: 2,
    emoji: '📏',
    label: '인터벌',
    labelEn: 'Intervals',
    color: COLORS.level2,
    desc: '프렛보드 위에서 음정 거리 찾기',
    example: '"A에서 완전5도" → 프렛보드에서 탭',
  },
  {
    id: 'scale',
    num: 3,
    emoji: '🎼',
    label: '스케일 패턴',
    labelEn: 'Scale Patterns',
    color: COLORS.level3,
    desc: '프렛보드에서 스케일 음 짚기',
    example: '"Am 펜타토닉 1포지션" → 프렛보드에서 음 짚기',
  },
  {
    id: 'ear',
    num: 4,
    emoji: '👂',
    label: '귀 훈련',
    labelEn: 'Ear Training',
    color: COLORS.level4,
    desc: '소리를 듣고 음 맞추기',
    example: '"이 소리는?" → 개방현 5음 중 선택',
    basic: true,
  },
] as const;

export const TARGET_CARDS_PER_LEVEL = 60;
