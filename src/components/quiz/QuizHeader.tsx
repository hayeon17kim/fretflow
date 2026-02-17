import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface QuizHeaderProps {
  label: string;
  color: string;
  progress: number;
  total: number;
  onBack: () => void;
  badge?: string;
}

export function QuizHeader({ label, color, progress, total, onBack, badge }: QuizHeaderProps) {
  const { t } = useTranslation();
  const pct = total > 0 ? (progress / total) * 100 : 0;

  return (
    <View style={s.wrapper}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={s.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('accessibility.back')}
          accessibilityHint={t('accessibility.backTo', { screen: label })}
        >
          <Svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.textSecondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
          <Text style={s.backLabel}>{label}</Text>
        </Pressable>

        <View style={s.rightGroup}>
          {badge ? (
            <View style={[s.modeBadge, { backgroundColor: `${color}20` }]}>
              <Text style={[s.modeBadgeText, { color }]}>{badge}</Text>
            </View>
          ) : null}
          <Text style={[s.counter, { color }]}>
            {progress}/{total}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View
        style={s.barTrack}
        accessibilityRole="progressbar"
        accessibilityLabel={t('accessibility.quizProgress')}
        accessibilityValue={{ min: 0, max: total, now: progress, text: `${progress}/${total}` }}
      >
        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  counter: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: '600',
  },
  barTrack: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
