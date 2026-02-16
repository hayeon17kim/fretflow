import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

// ─── Level config ───
const LEVELS = [
  {
    id: 'note' as const,
    num: 1,
    emoji: '🎵',
    label: '음 위치',
    labelEn: 'Note Position',
    color: COLORS.level1,
    desc: '프렛보드의 음 이름 외우기',
    example: '"5번줄 7프렛의 음은?" → 4지선다',
  },
  {
    id: 'interval' as const,
    num: 2,
    emoji: '📏',
    label: '인터벌',
    labelEn: 'Intervals',
    color: COLORS.level2,
    desc: '프렛보드 위에서 음정 거리 찾기',
    example: '"A에서 완전5도" → 프렛보드에서 탭',
  },
  {
    id: 'scale' as const,
    num: 3,
    emoji: '🎼',
    label: '스케일 패턴',
    labelEn: 'Scale Patterns',
    color: COLORS.level3,
    desc: '프렛보드에서 스케일 음 짚기',
    example: '"Am 펜타토닉 1포지션" → 프렛보드에서 음 짚기',
  },
  {
    id: 'ear' as const,
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

// ─── Session duration options ───
const SESSION_OPTIONS = [
  { label: '퀵 3분', cards: 10 },
  { label: '포커스 10분', cards: 25 },
  { label: '딥 20분', cards: 50 },
] as const;

// ─── Target cards per level for progress calc ───
const TARGET_PER_LEVEL = 60;

// ─── Circular progress ───
function CircularProgress({
  progress,
  color,
  size = 44,
  strokeWidth = 2.5,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress / 100);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`${color}20`}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

// ─── Quiz route map ───
const QUIZ_ROUTES = {
  note: '/quiz/note',
  interval: '/quiz/interval',
  scale: '/quiz/scale',
  ear: '/quiz/ear',
} as const;

export default function PracticeScreen() {
  const router = useRouter();
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const { getCardCount } = useSpacedRepetition();

  const toggleExpand = (id: string) => {
    setExpandedLevel((prev) => (prev === id ? null : id));
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.title}>연습하기</Text>
        <Text style={s.subtitle}>레벨을 선택하고 연습을 시작하세요</Text>

        {/* Level cards */}
        {LEVELS.map((lv) => {
          const cardCount = getCardCount(lv.id);
          const progress = Math.min(100, Math.round((cardCount / TARGET_PER_LEVEL) * 100));
          const isExpanded = expandedLevel === lv.id;

          return (
            <Pressable
              key={lv.id}
              onPress={() => toggleExpand(lv.id)}
              style={[s.levelCard, { borderColor: `${lv.color}25` }]}
            >
              {/* Main row */}
              <View style={s.levelRow}>
                {/* Icon + circular progress */}
                <View style={s.levelIcon}>
                  <CircularProgress progress={progress} color={lv.color} />
                  <Text style={s.levelEmoji}>{lv.emoji}</Text>
                </View>

                {/* Info */}
                <View style={s.levelInfo}>
                  <View style={s.levelNameRow}>
                    <Text style={s.levelName}>{lv.label}</Text>
                    {'basic' in lv && lv.basic && (
                      <View style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                        <Text style={[s.chipText, { color: lv.color }]}>기초 모드</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.levelDesc}>{lv.desc}</Text>
                </View>

                {/* Progress % */}
                <Text style={[s.levelProgress, { color: lv.color }]}>{progress}%</Text>
              </View>

              {/* Expanded: example + session options */}
              {isExpanded && (
                <View style={s.expandedSection}>
                  {/* Example */}
                  <View style={s.exampleBox}>
                    <Text style={s.exampleLabel}>예시 문제</Text>
                    <Text style={s.exampleText}>{lv.example}</Text>
                  </View>

                  {/* Session option buttons */}
                  <View style={s.sessionRow}>
                    {SESSION_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.label}
                        style={({ pressed }) => [
                          s.sessionBtn,
                          pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                        ]}
                        onPress={() => {
                          router.push(QUIZ_ROUTES[lv.id]);
                        }}
                      >
                        <Text style={[s.sessionBtnLabel, { color: lv.color }]}>{opt.label}</Text>
                        <Text style={s.sessionBtnCards}>{opt.cards}장</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Mix mode button */}
        <Pressable
          style={({ pressed }) => [s.mixBtn, pressed && { opacity: 0.7 }]}
          onPress={() => {
            // Mix mode — default to note quiz for now
            router.push('/quiz/note');
          }}
        >
          <Text style={s.mixBtnText}>🎲 전체 레벨 믹스 연습</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 100,
  },

  // Header
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },

  // Level card
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelEmoji: {
    fontSize: 20,
    position: 'absolute',
  },
  levelInfo: {
    flex: 1,
  },
  levelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '600',
  },
  levelDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  levelProgress: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '700',
  },

  // Expanded section
  expandedSection: {
    marginTop: SPACING.md,
  },
  exampleBox: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 2,
  },
  exampleLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  sessionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sessionBtn: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sessionBtnLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  sessionBtnCards: {
    fontSize: 9,
    color: COLORS.textTertiary,
    marginTop: 2,
  },

  // Mix button
  mixBtn: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.level1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  mixBtnText: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '600',
    color: COLORS.level1,
  },
});
