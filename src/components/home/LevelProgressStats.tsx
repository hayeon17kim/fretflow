import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import type { LevelId } from '@/config/levels';
import { LEVELS } from '@/config/levels';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface LevelProgressStatsProps {
  levelProgress: Record<LevelId, number>;
}

export function LevelProgressStats({ levelProgress }: LevelProgressStatsProps) {
  const { t } = useTranslation();

  return (
    <View style={s.statsRow}>
      {LEVELS.map((lv) => (
        <View key={lv.id} style={[s.statBox, { borderColor: `${lv.color}15` }]}>
          <Text style={[s.statValue, { color: lv.color }]}>{levelProgress[lv.id]}%</Text>
          <Text style={s.statLabel}>
            {t('common.levelShort', { num: lv.num })} {lv.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
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
});
