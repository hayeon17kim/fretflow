import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CircularProgress } from '@/components/progress/CircularProgress';
import type { LevelId } from '@/config/levels';
import { LEVELS } from '@/config/levels';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

// ─── Internal Lock Icon ───
function LockIcon({ size = 20 }: { size?: number }) {
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

interface LevelCardGridProps {
  levelProgress: Record<LevelId, number>;
  onLevelPress: (levelId: LevelId) => void;
}

export function LevelCardGrid({ levelProgress, onLevelPress }: LevelCardGridProps) {
  const { t } = useTranslation();
  const { isLevelLocked, getLevelProgress } = useSpacedRepetition();

  const handleLevelPress = useCallback(
    (lv: (typeof LEVELS)[number]) => {
      const locked = isLevelLocked(lv.num as 1 | 2 | 3 | 4);

      if (locked) {
        // Show unlock requirement alert
        const prevLevel = lv.num - 1;
        const prevLevelProgress = getLevelProgress(
          LEVELS[prevLevel - 1].id as 'note' | 'interval' | 'scale',
        );
        Alert.alert(
          t('home.lockedAlert'),
          t('home.lockedMessage', {
            level: prevLevel,
            name: LEVELS[prevLevel - 1].label,
            progress: prevLevelProgress,
          }),
          [{ text: t('home.confirm'), style: 'default' }],
        );
      } else {
        onLevelPress(lv.id);
      }
    },
    [isLevelLocked, getLevelProgress, onLevelPress, t],
  );

  return (
    <>
      <Text style={s.sectionTitle}>{t('home.levelPractice')}</Text>
      {LEVELS.map((lv) => {
        const progress = levelProgress[lv.id];
        const locked = isLevelLocked(lv.num as 1 | 2 | 3 | 4);

        return (
          <Pressable
            key={lv.id}
            style={({ pressed }) => [
              s.levelCard,
              { borderColor: `${lv.color}25` },
              pressed && !locked && { opacity: 0.85 },
              locked && { opacity: 0.5 },
            ]}
            onPress={() => handleLevelPress(lv)}
            accessibilityRole="button"
            accessibilityLabel={lv.label}
          >
            <View style={s.levelCardInner}>
              {/* Icon with circular progress */}
              <View style={s.levelIcon}>
                <CircularProgress progress={progress} color={lv.color} />
                {locked ? <LockIcon size={20} /> : <Text style={s.levelEmoji}>{lv.emoji}</Text>}
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
                        {t('home.locked')}
                      </Text>
                    </View>
                  )}
                  {'basic' in lv && lv.basic && !locked && (
                    <View style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                      <Text style={[s.chipText, { color: lv.color }]}>{t('home.basicMode')}</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.levelDesc, locked && { color: COLORS.textTertiary }]}>
                  {lv.desc}
                </Text>
              </View>

              {/* Progress number */}
              <Text style={[s.levelProgress, { color: locked ? COLORS.textSecondary : lv.color }]}>
                {progress}%
              </Text>
            </View>
          </Pressable>
        );
      })}
    </>
  );
}

const s = StyleSheet.create({
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
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
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
