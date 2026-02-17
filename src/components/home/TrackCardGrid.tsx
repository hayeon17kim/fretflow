import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CircularProgress } from '@/components/progress/CircularProgress';
import type { TrackId } from '@/config/tracks';
import { getTrackDesc, getTrackLabel, TRACKS } from '@/config/tracks';
import { BADGES, getBadgeForProgress } from '@/utils/badges';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface TrackCardGridProps {
  trackProgress: Record<TrackId, number>;
  onTrackPress: (trackId: TrackId) => void;
}

export function TrackCardGrid({ trackProgress, onTrackPress }: TrackCardGridProps) {
  const { t } = useTranslation();

  return (
    <>
      <Text style={s.sectionTitle}>{t('home.trackPractice')}</Text>
      {TRACKS.map((track) => {
        const progress = trackProgress[track.id];
        const badgeLevel = getBadgeForProgress(progress); // Issue #22
        const badge = BADGES[badgeLevel];

        return (
          <Pressable
            key={track.id}
            style={({ pressed }) => [
              s.trackCard,
              { borderColor: `${track.color}25` },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => onTrackPress(track.id)}
            accessibilityRole="button"
            accessibilityLabel={getTrackLabel(track.id, t)}
          >
            <View style={s.trackCardInner}>
              {/* Icon with circular progress */}
              <View style={s.trackIcon}>
                <CircularProgress progress={progress} color={track.color} />
                <Text style={s.trackEmoji}>{track.emoji}</Text>
              </View>

              {/* Info */}
              <View style={s.trackInfo}>
                <View style={s.trackNameRow}>
                  <Text style={s.trackName}>
                    {getTrackLabel(track.id, t)}
                  </Text>
                  {badge.emoji && (
                    <View style={[s.chip, { backgroundColor: `${track.color}15` }]}>
                      <Text style={s.chipText}>{badge.emoji}</Text>
                      <Text style={[s.chipText, { color: track.color }]}>
                        {t(`badges.${badgeLevel}`)}
                      </Text>
                    </View>
                  )}
                  {'basic' in track && track.basic && (
                    <View style={[s.chip, { backgroundColor: `${track.color}15` }]}>
                      <Text style={[s.chipText, { color: track.color }]}>{t('home.basicMode')}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.trackDesc}>
                  {getTrackDesc(track.id, t)}
                </Text>
              </View>

              {/* Progress number */}
              <Text style={[s.trackProgress, { color: track.color }]}>
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
  trackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
  },
  trackCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  trackIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackEmoji: {
    fontSize: 20,
    position: 'absolute',
  },
  trackInfo: {
    flex: 1,
  },
  trackNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trackDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  trackProgress: {
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
