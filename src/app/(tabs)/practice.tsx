import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LockIcon } from '@/components/icons/LockIcon';
import { CircularProgress } from '@/components/progress/CircularProgress';
import { LEVELS, TARGET_CARDS_PER_LEVEL } from '@/config/levels';
import { QUIZ_ROUTES } from '@/config/routes';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

// ─── Session duration options ───
const SESSION_OPTIONS = [
  { key: 'quick', cards: 10 },
  { key: 'focus', cards: 25 },
  { key: 'deep', cards: 50 },
] as const;

export default function PracticeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [_refreshKey, setRefreshKey] = useState(0);
  const { getCardCount, isLevelLocked, getLevelProgress } = useSpacedRepetition();

  // 화면 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []),
  );

  const toggleExpand = (id: string) => {
    setExpandedLevel((prev) => (prev === id ? null : id));
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.title}>{t('practice.title')}</Text>
        <Text style={s.subtitle}>{t('practice.subtitle')}</Text>

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
                    t('practice.lockedAlert'),
                    t('practice.lockedMessage', {
                      level: prevLevel,
                      name: LEVELS[prevLevel - 1].label,
                      progress: prevLevelProgress,
                    }),
                    [{ text: t('practice.confirm'), style: 'default' }],
                  );
                } else {
                  toggleExpand(lv.id);
                }
              }}
              style={[s.levelCard, { borderColor: `${lv.color}25` }, locked && { opacity: 0.5 }]}
              accessibilityRole="button"
              accessibilityLabel={`${lv.label}`}
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
                        <Text style={[s.chipText, { color: COLORS.textSecondary }]}>
                          {t('practice.locked')}
                        </Text>
                      </View>
                    )}
                    {'basic' in lv && lv.basic && !locked && (
                      <View style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                        <Text style={[s.chipText, { color: lv.color }]}>
                          {t('practice.basicMode')}
                        </Text>
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
                    <Text style={s.exampleLabel}>{t('practice.exampleProblem')}</Text>
                    <Text style={s.exampleText}>{lv.example}</Text>
                  </View>

                  {/* Session option buttons */}
                  <View style={s.sessionRow}>
                    {SESSION_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.key}
                        style={({ pressed }) => [
                          s.sessionBtn,
                          pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                        ]}
                        onPress={() => {
                          router.push(QUIZ_ROUTES[lv.id]);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t(`practice.sessions.${opt.key}`)}
                      >
                        <Text style={[s.sessionBtnLabel, { color: lv.color }]}>
                          {t(`practice.sessions.${opt.key}`)}
                        </Text>
                        <Text style={s.sessionBtnCards}>
                          {t('practice.sessions.cardsCount', { count: opt.cards })}
                        </Text>
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
          accessibilityLabel={t('practice.mixMode')}
        >
          <Text style={s.mixBtnText}>{t('practice.mixMode')}</Text>
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
