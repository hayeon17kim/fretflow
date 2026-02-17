import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CircularProgress } from '@/components/progress/CircularProgress';
import { QUIZ_ROUTES } from '@/config/routes';
import {
  getTrackDesc,
  getTrackExample,
  getTrackLabel,
  TARGET_CARDS_PER_TRACK,
  TRACKS,
} from '@/config/tracks';
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
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const { getTrackProgress } = useSpacedRepetition();

  const toggleExpand = (id: string) => {
    setExpandedTrack((prev) => (prev === id ? null : id));
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.title}>{t('practice.title')}</Text>
        <Text style={s.subtitle}>{t('practice.subtitle')}</Text>

        {/* Track cards */}
        {TRACKS.map((track) => {
          const progress = getTrackProgress(track.id);
          const isExpanded = expandedTrack === track.id;

          return (
            <Pressable
              key={track.id}
              onPress={() => toggleExpand(track.id)}
              style={[s.trackCard, { borderColor: `${track.color}25` }]}
              accessibilityRole="button"
              accessibilityLabel={getTrackLabel(track.id, t)}
              accessibilityState={{ expanded: isExpanded }}
            >
              {/* Main row */}
              <View style={s.trackRow}>
                {/* Icon + circular progress */}
                <View style={s.trackIcon}>
                  <CircularProgress progress={progress} color={track.color} />
                  <Text style={s.trackEmoji}>{track.emoji}</Text>
                </View>

                {/* Info */}
                <View style={s.trackInfo}>
                  <View style={s.trackNameRow}>
                    <Text style={s.trackName}>{getTrackLabel(track.id, t)}</Text>
                    {'basic' in track && track.basic && (
                      <View style={[s.chip, { backgroundColor: `${track.color}15` }]}>
                        <Text style={[s.chipText, { color: track.color }]}>
                          {t('practice.basicMode')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.trackDesc}>{getTrackDesc(track.id, t)}</Text>
                </View>

                {/* Progress % */}
                <Text style={[s.trackProgress, { color: track.color }]}>{progress}%</Text>
              </View>

              {/* Expanded: example + session options */}
              {isExpanded && (
                <View style={s.expandedSection}>
                  {/* Example */}
                  <View style={s.exampleBox}>
                    <Text style={s.exampleLabel}>{t('practice.exampleProblem')}</Text>
                    <Text style={s.exampleText}>{getTrackExample(track.id, t)}</Text>
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
                          router.push({
                            pathname: QUIZ_ROUTES[track.id],
                            params: { sessionSize: opt.cards.toString() },
                          });
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t(`practice.sessions.${opt.key}`)}
                      >
                        <Text style={[s.sessionBtnLabel, { color: track.color }]}>
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

  // Track card
  trackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
  },
  trackRow: {
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
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '600',
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
    borderColor: COLORS.track1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  mixBtnText: {
    fontSize: FONT_SIZE.sm + 1,
    fontWeight: '600',
    color: COLORS.track1,
  },
});
