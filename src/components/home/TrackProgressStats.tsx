import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import type { TrackId } from '@/config/tracks';
import { getTrackLabel, TRACKS } from '@/config/tracks';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface TrackProgressStatsProps {
  trackProgress: Record<TrackId, number>;
}

export function TrackProgressStats({ trackProgress }: TrackProgressStatsProps) {
  const { t } = useTranslation();

  return (
    <View style={s.statsRow}>
      {TRACKS.map((track) => (
        <View key={track.id} style={[s.statBox, { borderColor: `${track.color}15` }]}>
          <Text style={[s.statValue, { color: track.color }]}>{trackProgress[track.id]}%</Text>
          <Text style={s.statLabel}>{getTrackLabel(track.id, t)}</Text>
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
