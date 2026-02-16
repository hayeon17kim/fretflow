import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CircularProgress } from '@/components/progress/CircularProgress';
import { LEVELS, TARGET_CARDS_PER_LEVEL } from '@/config/levels';
import { QUIZ_ROUTES } from '@/config/routes';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

// ─── Session duration options ───
const SESSION_OPTIONS = [
  { label: '퀵 3분', cards: 10 },
  { label: '포커스 10분', cards: 25 },
  { label: '딥 20분', cards: 50 },
] as const;

// ─── Lock icon ───
function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

export default function PracticeScreen() {
  const router = useRouter();
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const { getCardCount, isLevelLocked, getLevelProgress } = useSpacedRepetition();

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
          const progress = Math.min(100, Math.round((cardCount / TARGET_CARDS_PER_LEVEL) * 100));
          const isExpanded = expandedLevel === lv.id;
          const locked = isLevelLocked(lv.num as 1 | 2 | 3 | 4);

          return (
            <Pressable
              key={lv.id}
              onPress={() => {
                if (locked) {
                  // 잠금 해제 조건 알림
                  const prevLevel = lv.num - 1;
                  const prevLevelProgress = getLevelProgress(
                    LEVELS[prevLevel - 1].id as 'note' | 'interval' | 'scale',
                  );
                  Alert.alert(
                    '🔒 잠긴 레벨',
                    `Lv.${prevLevel} ${LEVELS[prevLevel - 1].label}을(를) 80% 이상 달성하면 해금됩니다.\n\n현재 진행도: ${prevLevelProgress}%`,
                    [{ text: '확인', style: 'default' }],
                  );
                } else {
                  toggleExpand(lv.id);
                }
              }}
              style={[s.levelCard, { borderColor: `${lv.color}25` }, locked && { opacity: 0.5 }]}
              accessibilityRole="button"
              accessibilityLabel={`${lv.label} 레벨`}
              accessibilityHint={
                locked
                  ? '잠긴 레벨입니다. 이전 레벨을 80퍼센트 이상 달성해야 합니다'
                  : isExpanded
                    ? '세션 옵션을 숨기려면 탭하세요'
                    : `세션 옵션을 보려면 탭하세요. 진행도는 ${progress}퍼센트입니다`
              }
              accessibilityState={{ expanded: isExpanded }}
            >
              {/* Main row */}
              <View style={s.levelRow}>
                {/* Icon + circular progress */}
                <View style={s.levelIcon}>
                  <CircularProgress progress={progress} color={lv.color} />
                  {locked ? <LockIcon size={18} /> : <Text style={s.levelEmoji}>{lv.emoji}</Text>}
                </View>

                {/* Info */}
                <View style={s.levelInfo}>
                  <View style={s.levelNameRow}>
                    <Text style={[s.levelName, locked && { color: COLORS.textSecondary }]}>
                      {lv.label}
                    </Text>
                    {locked && (
                      <View style={[s.chip, { backgroundColor: `${COLORS.textSecondary}15` }]}>
                        <Text style={[s.chipText, { color: COLORS.textSecondary }]}>잠김</Text>
                      </View>
                    )}
                    {'basic' in lv && lv.basic && !locked && (
                      <View style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                        <Text style={[s.chipText, { color: lv.color }]}>기초 모드</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.levelDesc, locked && { color: COLORS.textTertiary }]}>
                    {lv.desc}
                  </Text>
                </View>

                {/* Progress % */}
                <Text
                  style={[s.levelProgress, { color: locked ? COLORS.textSecondary : lv.color }]}
                >
                  {progress}%
                </Text>
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
                        accessibilityRole="button"
                        accessibilityLabel={`${opt.label} 세션`}
                        accessibilityHint={`${opt.cards}장의 카드로 ${lv.label} 연습을 시작합니다`}
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
          accessibilityRole="button"
          accessibilityLabel="전체 레벨 믹스 연습"
          accessibilityHint="모든 레벨의 카드를 섞어서 연습합니다"
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
