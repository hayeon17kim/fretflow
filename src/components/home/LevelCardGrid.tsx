import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircularProgress } from '@/components/progress/CircularProgress';
import type { LevelId } from '@/config/levels';
import { getLevelDesc, getLevelLabel, LEVELS } from '@/config/levels';
import { BADGES, getBadgeForProgress } from '@/utils/badges';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface LevelCardGridProps {
  levelProgress: Record<LevelId, number>;
  onLevelPress: (levelId: LevelId) => void;
}

export function LevelCardGrid({ levelProgress, onLevelPress }: LevelCardGridProps) {
  const { t } = useTranslation();

  return (
    <>
      <Text style={s.sectionTitle}>{t('home.levelPractice')}</Text>
      {LEVELS.map((lv) => {
        const progress = levelProgress[lv.id];
        const badgeLevel = getBadgeForProgress(progress); // Issue #22
        const badge = BADGES[badgeLevel];

        return (
          <Pressable
            key={lv.id}
            style={({ pressed }) => [
              s.levelCard,
              { borderColor: `${lv.color}25` },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => onLevelPress(lv.id)}
            accessibilityRole="button"
            accessibilityLabel={getLevelLabel(lv.id, t)}
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
                  <Text style={s.levelName}>
                    {getLevelLabel(lv.id, t)}
                  </Text>
                  {badge.emoji && (
                    <View style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                      <Text style={s.chipText}>{badge.emoji}</Text>
                      <Text style={[s.chipText, { color: lv.color }]}>
                        {t(`badges.${badgeLevel}`)}
                      </Text>
                    </View>
                  )}
                  {'basic' in lv && lv.basic && (
                    <View style={[s.chip, { backgroundColor: `${lv.color}15` }]}>
                      <Text style={[s.chipText, { color: lv.color }]}>{t('home.basicMode')}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.levelDesc}>
                  {getLevelDesc(lv.id, t)}
                </Text>
              </View>

              {/* Progress number */}
              <Text style={[s.levelProgress, { color: lv.color }]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
