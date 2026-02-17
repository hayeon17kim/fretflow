// Soft guide modal for Scale/Ear tracks first visit (Issue #22)
// Non-blocking guidance to help users understand prerequisites

import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TrackId } from '@/config/tracks';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

interface SoftGuideModalProps {
  visible: boolean;
  trackId: TrackId;
  onContinue: () => void;
  onGoToLevel1: () => void;
}

export function SoftGuideModal({
  visible,
  trackId,
  onContinue,
  onGoToLevel1,
}: SoftGuideModalProps) {
  const { t } = useTranslation();

  // Only show for Scale Pattern or Ear Training tracks
  if (trackId !== 'scale' && trackId !== 'ear') return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.modal}>
          <Text style={s.emoji}>💡</Text>
          <Text style={s.title}>{t('softGuide.title')}</Text>
          <Text style={s.message}>{t('softGuide.message')}</Text>

          <View style={s.buttons}>
            <Pressable
              style={({ pressed }) => [
                s.button,
                s.buttonSecondary,
                pressed && s.buttonPressed,
              ]}
              onPress={onGoToLevel1}
            >
              <Text style={s.buttonSecondaryText}>{t('softGuide.goToLevel1')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                s.button,
                s.buttonPrimary,
                pressed && s.buttonPressed,
              ]}
              onPress={onContinue}
            >
              <Text style={s.buttonPrimaryText}>{t('softGuide.continue')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.track1,
  },
  buttonPrimaryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.bg,
  },
  buttonSecondary: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonSecondaryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
