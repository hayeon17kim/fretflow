import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

// ─── Level config (V5.2) ───
const LEVELS = [
  {
    id: 'notes' as const,
    num: 1,
    emoji: '🎵',
    label: '음 위치',
    labelEn: 'Note Position',
    color: COLORS.level1,
    desc: '프렛보드의 음 이름 외우기',
  },
  {
    id: 'intervals' as const,
    num: 2,
    emoji: '📏',
    label: '인터벌',
    labelEn: 'Intervals',
    color: COLORS.level2,
    desc: '프렛보드 위에서 음정 거리 찾기',
  },
  {
    id: 'scales' as const,
    num: 3,
    emoji: '🎼',
    label: '스케일 패턴',
    labelEn: 'Scale Patterns',
    color: COLORS.level3,
    desc: '프렛보드에서 스케일 음 짚기',
  },
  {
    id: 'ear' as const,
    num: 4,
    emoji: '👂',
    label: '귀 훈련',
    labelEn: 'Ear Training',
    color: COLORS.level4,
    desc: '소리를 듣고 음 맞추기',
    basic: true,
  },
] as const;

// ─── Fire icon ───
function FireIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 23c-4.97 0-8-3.03-8-7 0-2.66 1.34-5.36 4-8 0 3 2 5 4 5s3-1 3-3c1.33 1.33 3 4.33 3 6 0 4.97-2.03 8-6 8z" />
    </Svg>
  );
}

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

export default function HomeScreen() {
  const router = useRouter();
  const todayStats = useAppStore((s) => s.todayStats);
  const { getDueCards, getCardCount } = useSpacedRepetition();

  const dueCards = getDueCards();
  const _totalCards = getCardCount();
  const dueCount = dueCards.length;
  const estimatedMinutes = Math.max(1, Math.ceil(dueCount * 0.35));

  // Per-level due card count
  const levelDueCounts = {
    notes: dueCards.filter((c) => c.type === 'note').length,
    intervals: dueCards.filter((c) => c.type === 'interval').length,
    scales: dueCards.filter((c) => c.type === 'scale').length,
    ear: dueCards.filter((c) => c.type === 'ear').length,
  };

  // Per-level progress (mastered cards / total target per level)
  const TARGET_PER_LEVEL = 60;
  const levelProgress = {
    notes: Math.min(100, Math.round((getCardCount('note') / TARGET_PER_LEVEL) * 100)),
    intervals: Math.min(100, Math.round((getCardCount('interval') / TARGET_PER_LEVEL) * 100)),
    scales: Math.min(100, Math.round((getCardCount('scale') / TARGET_PER_LEVEL) * 100)),
    ear: Math.min(100, Math.round((getCardCount('ear') / TARGET_PER_LEVEL) * 100)),
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Top row ─── */}
        <View style={s.topRow}>
          <View>
            <Text style={s.greeting}>좋은 하루에요 👋</Text>
            <Text style={s.title}>기타 사고력 키우기</Text>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/settings')} style={s.profileBtn}>
            <Svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.level1}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx={12} cy={7} r={4} />
            </Svg>
          </Pressable>
        </View>

        {/* ─── Main CTA card (V5.2) ─── */}
        <View style={s.ctaCard}>
          {/* Streak + count */}
          <View style={s.ctaTopRow}>
            <View style={s.streakRow}>
              <FireIcon color={COLORS.level1} />
              <Text style={[s.streakText, { color: COLORS.level1 }]}>
                {todayStats.streak}일 연속
              </Text>
            </View>
            <Text style={s.dueInfo}>
              {dueCount}장 · 약 {estimatedMinutes}분
            </Text>
          </View>

          {/* Title */}
          <Text style={s.ctaTitle}>오늘의 복습 믹스</Text>

          {/* Level composition chips */}
          <View style={s.chipRow}>
            {LEVELS.map((lv) => {
              const count = levelDueCounts[lv.id];
              if (count === 0) return null;
              return (
                <View key={lv.id} style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                  <Text style={[s.chipText, { color: lv.color }]}>
                    {lv.label} ×{count}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* CTA button */}
          <Pressable
            style={({ pressed }) => [s.ctaBtn, pressed && s.ctaBtnPressed]}
            onPress={() => {
              // Start review — route to note quiz as default mix
              router.push('/quiz/note');
            }}
          >
            <Text style={s.ctaBtnText}>{dueCount > 0 ? '복습 시작 →' : '새 카드 추가하기 →'}</Text>
          </Pressable>
        </View>

        {/* ─── Quick stats row ─── */}
        <View style={s.statsRow}>
          {LEVELS.map((lv) => (
            <View key={lv.id} style={[s.statBox, { borderColor: `${lv.color}15` }]}>
              <Text style={[s.statValue, { color: lv.color }]}>{levelProgress[lv.id]}%</Text>
              <Text style={s.statLabel}>
                Lv.{lv.num} {lv.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ─── Level cards ─── */}
        <Text style={s.sectionTitle}>레벨별 연습</Text>
        {LEVELS.map((lv) => {
          const progress = levelProgress[lv.id];
          return (
            <Pressable
              key={lv.id}
              style={({ pressed }) => [
                s.levelCard,
                { borderColor: `${lv.color}25` },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                const routeMap: Record<string, string> = {
                  notes: '/quiz/note',
                  intervals: '/quiz/interval',
                  scales: '/quiz/scale',
                  ear: '/quiz/ear',
                };
                router.push(routeMap[lv.id] ?? '/quiz/note');
              }}
            >
              <View style={s.levelCardInner}>
                {/* Icon with circular progress */}
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

                {/* Progress number */}
                <Text style={[s.levelProgress, { color: lv.color }]}>{progress}%</Text>
              </View>
            </Pressable>
          );
        })}

        {/* ─── Practice shortcut ─── */}
        <Pressable
          style={({ pressed }) => [s.practiceBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/(tabs)/practice')}
        >
          <Text style={s.practiceBtnText}>특정 레벨만 연습하기 →</Text>
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

  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CTA card
  ctaCard: {
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.level1}30`,
    backgroundColor: COLORS.surface,
  },
  ctaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  dueInfo: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.lg,
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
  ctaBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.level1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.bg,
  },

  // Quick stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Level cards
  levelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
  },
  levelCardInner: {
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
  levelDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  levelProgress: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '700',
  },

  // Practice shortcut button
  practiceBtn: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  practiceBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});
