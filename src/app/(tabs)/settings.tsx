import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { TimePickerRow } from '@/components/settings/TimePickerRow';
import { getCurrentTier as getCurrentEarTrainingTier } from '@/config/earTrainingTiers';
import { getCurrentIntervalTier } from '@/config/intervalTiers';
import { getCurrentNotePositionTier } from '@/config/notePositionTiers';
import { getCurrentScaleTier } from '@/config/scaleTiers';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { useNotifications } from '@/hooks/useNotifications';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import i18n from '@/i18n';
import { useAppStore } from '@/stores/useAppStore';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import {
  getMasteredCounts,
  resetAllCards,
  resetDevCards,
  setMasteredCount,
} from '@/utils/devTools';

// ─── User icon ───
function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.track1}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </Svg>
  );
}

// ─── Target icon ───
function TargetIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.track2}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx={12} cy={12} r={10} />
      <Circle cx={12} cy={12} r={6} />
      <Circle cx={12} cy={12} r={2} />
    </Svg>
  );
}

// ─── Bell icon ───
function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.track3}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

// ─── Accessibility icon ───
function AccessibilityIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.track3}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx={12} cy={4} r={2} />
      <Path d="M10 10h4" />
      <Path d="m8 14 2-2 2 2" />
      <Path d="m16 14-2-2-2 2" />
      <Path d="M12 8v2" />
      <Path d="M12 18v-4" />
    </Svg>
  );
}

// ─── Info icon ───
function InfoIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.track4}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx={12} cy={12} r={10} />
      <Path d="M12 16v-4" />
      <Path d="M12 8h.01" />
    </Svg>
  );
}

// ─── ChevronRight icon ───
function ChevronRightIcon({ size = 18 }: { size?: number }) {
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
      <Path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

// ─── Code icon (for developer mode) ───
function CodeIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF6B6B"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m18 16 4-4-4-4" />
      <Path d="m6 8-4 4 4 4" />
      <Path d="m14.5 4-5 16" />
    </Svg>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(settings.username);
  const { scheduleAllNotifications } = useNotifications();
  const { requestPermissions } = useNotificationPermissions();

  // Developer mode state
  const [devCounts, setDevCounts] = useState(getMasteredCounts());
  const [_forceRefresh, setForceRefresh] = useState(0);

  const refreshDevCounts = () => {
    setDevCounts(getMasteredCounts());
    setForceRefresh((prev) => prev + 1);
  };

  const handleDevCountChange = (type: 'note' | 'interval' | 'scale' | 'ear', value: number) => {
    setMasteredCount(type, Math.round(value));
    refreshDevCounts();
  };

  const handleResetAllCards = () => {
    Alert.alert(
      '⚠️ Reset All Cards',
      'This will delete ALL cards (including real progress). Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAllCards();
            refreshDevCounts();
            Alert.alert('✅ Done', 'All cards have been deleted.');
          },
        },
      ],
    );
  };

  const handleResetDevCards = () => {
    resetDevCards();
    refreshDevCounts();
    Alert.alert('✅ Done', 'Dev cards have been removed.');
  };

  // Save username
  const saveUsername = () => {
    if (tempUsername.trim()) {
      updateSettings({ username: tempUsername.trim() });
    } else {
      setTempUsername(settings.username);
    }
    setIsEditingUsername(false);
  };

  // Daily goal options
  const dailyGoalOptions = [10, 20, 30, 50];

  // Notification handlers
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && !settings.notifications.permissionGranted) {
      // Request permission if not granted
      const { status } = await requestPermissions();
      if (status !== 'granted') {
        Alert.alert(
          t('settings.notifications.permissionDenied'),
          t('settings.notifications.permissionDeniedMessage'),
        );
        return;
      }

      updateSettings({
        notifications: {
          ...settings.notifications,
          enabled: true,
          permissionGranted: true,
        },
      });
    } else {
      updateSettings({
        notifications: {
          ...settings.notifications,
          enabled,
        },
      });
    }

    await scheduleAllNotifications();
  };

  const handleTimeChange = async (newTime: string) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        dailyReminderTime: newTime,
      },
    });

    await scheduleAllNotifications();
  };

  const handleOpenSystemSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Header ─── */}
        <View style={s.header}>
          <Text style={s.title}>{t('settings.title')}</Text>
          <Text style={s.subtitle}>{t('settings.subtitle')}</Text>
        </View>

        {/* ─── Profile section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <UserIcon size={20} />
            <Text style={s.sectionTitle}>{t('settings.profile.title')}</Text>
          </View>

          <View style={s.card}>
            {/* Avatar */}
            <View style={s.profileRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{settings.username.charAt(0)}</Text>
              </View>
              <View style={s.profileInfo}>
                {isEditingUsername ? (
                  <TextInput
                    style={s.usernameInput}
                    value={tempUsername}
                    onChangeText={setTempUsername}
                    onBlur={saveUsername}
                    onSubmitEditing={saveUsername}
                    autoFocus
                    maxLength={20}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                ) : (
                  <Pressable onPress={() => setIsEditingUsername(true)}>
                    <Text style={s.username}>{settings.username}</Text>
                  </Pressable>
                )}
                <Text style={s.profileLabel}>{t('settings.profile.username')}</Text>
              </View>
              <Pressable
                onPress={() => {
                  if (isEditingUsername) {
                    saveUsername();
                  } else {
                    setIsEditingUsername(true);
                  }
                }}
                style={s.editBtn}
              >
                <Text style={s.editBtnText}>
                  {isEditingUsername ? t('settings.profile.save') : t('settings.profile.edit')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── Learning goals section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <TargetIcon size={20} />
            <Text style={s.sectionTitle}>{t('settings.goals.title')}</Text>
          </View>

          <View style={s.card}>
            {/* Daily goal */}
            <View style={s.settingRow}>
              <View>
                <Text style={s.settingLabel}>{t('settings.goals.daily')}</Text>
                <Text style={s.settingDesc}>{t('settings.goals.dailyDesc')}</Text>
              </View>
              <Text style={s.settingValue}>
                {t('settings.goals.cards', { count: settings.dailyGoal })}
              </Text>
            </View>

            {/* Goal options */}
            <View style={s.goalOptions}>
              {dailyGoalOptions.map((goal) => (
                <Pressable
                  key={goal}
                  style={[
                    s.goalOption,
                    settings.dailyGoal === goal && s.goalOptionActive,
                    settings.dailyGoal === goal && { borderColor: COLORS.track2 },
                  ]}
                  onPress={() => updateSettings({ dailyGoal: goal })}
                >
                  <Text
                    style={[
                      s.goalOptionText,
                      settings.dailyGoal === goal && { color: COLORS.track2 },
                    ]}
                  >
                    {t('settings.goals.cards', { count: goal })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ─── Notifications section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <BellIcon size={20} />
            <Text style={s.sectionTitle}>{t('settings.notifications.title')}</Text>
          </View>

          <View style={s.card}>
            <View style={s.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.settingLabel}>{t('settings.notifications.dailyReminder')}</Text>
                <Text style={s.settingDesc}>{t('settings.notifications.dailyReminderDesc')}</Text>
              </View>
              <Switch
                value={settings.notifications.enabled}
                onValueChange={handleToggleNotifications}
                disabled={!settings.notifications.permissionGranted}
                trackColor={{ false: COLORS.border, true: `${COLORS.track3}80` }}
                thumbColor={settings.notifications.enabled ? COLORS.track3 : COLORS.textSecondary}
              />
            </View>

            {!settings.notifications.permissionGranted && (
              <Pressable style={s.permissionHint} onPress={handleOpenSystemSettings}>
                <Text style={s.permissionHintText}>
                  {t('settings.notifications.enableInSettings')}
                </Text>
              </Pressable>
            )}

            {settings.notifications.enabled && settings.notifications.permissionGranted && (
              <>
                <View style={s.divider} />
                <TimePickerRow
                  label={t('settings.notifications.reminderTime')}
                  value={settings.notifications.dailyReminderTime}
                  onChange={handleTimeChange}
                />
              </>
            )}
          </View>
        </View>

        {/* ─── Accessibility section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <AccessibilityIcon size={20} />
            <Text style={s.sectionTitle}>{t('settings.accessibility.title')}</Text>
          </View>

          <View style={s.card}>
            {/* Language */}
            <View style={s.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.settingLabel}>{t('settings.accessibility.language')}</Text>
                <Text style={s.settingDesc}>{t('settings.accessibility.languageDesc')}</Text>
              </View>
            </View>

            {/* Language options */}
            <View style={s.languageOptions}>
              <Pressable
                style={[
                  s.languageOption,
                  i18n.language === 'ko' && s.languageOptionActive,
                  i18n.language === 'ko' && { borderColor: COLORS.track3 },
                ]}
                onPress={() => i18n.changeLanguage('ko')}
              >
                <Text
                  style={[s.languageOptionText, i18n.language === 'ko' && { color: COLORS.track3 }]}
                >
                  {t('common.korean')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  s.languageOption,
                  i18n.language === 'en' && s.languageOptionActive,
                  i18n.language === 'en' && { borderColor: COLORS.track3 },
                ]}
                onPress={() => i18n.changeLanguage('en')}
              >
                <Text
                  style={[s.languageOptionText, i18n.language === 'en' && { color: COLORS.track3 }]}
                >
                  {t('common.english')}
                </Text>
              </Pressable>
            </View>

            <View style={s.divider} />

            {/* Vibration */}
            <View style={s.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.settingLabel}>{t('settings.accessibility.vibration')}</Text>
                <Text style={s.settingDesc}>{t('settings.accessibility.vibrationDesc')}</Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
                trackColor={{ false: COLORS.border, true: `${COLORS.track3}80` }}
                thumbColor={settings.vibrationEnabled ? COLORS.track3 : COLORS.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* ─── App info section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <InfoIcon size={20} />
            <Text style={s.sectionTitle}>{t('settings.appInfo.title')}</Text>
          </View>

          <View style={s.card}>
            {/* Version */}
            <Pressable
              style={({ pressed }) => [s.infoRow, pressed && { opacity: 0.7 }]}
              onPress={() => {
                Alert.alert(
                  t('settings.appInfo.versionAlert'),
                  t('settings.appInfo.versionMessage'),
                );
              }}
            >
              <Text style={s.infoLabel}>{t('settings.appInfo.version')}</Text>
              <View style={s.infoRight}>
                <Text style={s.infoValue}>1.0.0</Text>
                <ChevronRightIcon />
              </View>
            </Pressable>

            <View style={s.divider} />

            {/* License */}
            <Pressable
              style={({ pressed }) => [s.infoRow, pressed && { opacity: 0.7 }]}
              onPress={() => {
                Alert.alert(
                  t('settings.appInfo.licenseAlert'),
                  t('settings.appInfo.licenseMessage'),
                );
              }}
            >
              <Text style={s.infoLabel}>{t('settings.appInfo.license')}</Text>
              <View style={s.infoRight}>
                <Text style={s.infoValue}>MIT</Text>
                <ChevronRightIcon />
              </View>
            </Pressable>

            <View style={s.divider} />

            {/* Developer */}
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>{t('settings.appInfo.developer')}</Text>
              <Text style={s.infoValue}>{t('settings.appInfo.developerName')}</Text>
            </View>
          </View>
        </View>

        {/* ─── Developer Mode section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <CodeIcon size={20} />
            <Text style={[s.sectionTitle, { color: '#FF6B6B' }]}>Developer Mode</Text>
          </View>

          <View style={s.card}>
            <Text style={[s.settingDesc, { marginBottom: SPACING.lg }]}>
              Simulate mastered cards to test tier unlocking
            </Text>

            {/* Note Position */}
            <View style={s.devRow}>
              <View style={s.devHeader}>
                <Text style={s.devTrackLabel}>🎵 Note Position</Text>
                <Text style={s.devCount}>{Math.round(devCounts.note)} cards</Text>
              </View>
              <Text style={s.devTierInfo}>
                Tier: {getCurrentNotePositionTier(devCounts.note).name} (
                {getCurrentNotePositionTier(devCounts.note).description})
              </Text>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={60}
                step={1}
                value={devCounts.note}
                onValueChange={(value) => setDevCounts({ ...devCounts, note: value })}
                onSlidingComplete={(value) => handleDevCountChange('note', value)}
                minimumTrackTintColor={COLORS.track1}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.track1}
              />
            </View>

            <View style={s.divider} />

            {/* Intervals */}
            <View style={s.devRow}>
              <View style={s.devHeader}>
                <Text style={s.devTrackLabel}>📏 Intervals</Text>
                <Text style={s.devCount}>{Math.round(devCounts.interval)} cards</Text>
              </View>
              <Text style={s.devTierInfo}>
                Tier: {getCurrentIntervalTier(devCounts.interval).name} (
                {getCurrentIntervalTier(devCounts.interval).description})
              </Text>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={60}
                step={1}
                value={devCounts.interval}
                onValueChange={(value) => setDevCounts({ ...devCounts, interval: value })}
                onSlidingComplete={(value) => handleDevCountChange('interval', value)}
                minimumTrackTintColor={COLORS.track2}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.track2}
              />
            </View>

            <View style={s.divider} />

            {/* Scales */}
            <View style={s.devRow}>
              <View style={s.devHeader}>
                <Text style={s.devTrackLabel}>🎼 Scales</Text>
                <Text style={s.devCount}>{Math.round(devCounts.scale)} cards</Text>
              </View>
              <Text style={s.devTierInfo}>
                Tier: {getCurrentScaleTier(devCounts.scale).name} (
                {getCurrentScaleTier(devCounts.scale).description})
              </Text>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={60}
                step={1}
                value={devCounts.scale}
                onValueChange={(value) => setDevCounts({ ...devCounts, scale: value })}
                onSlidingComplete={(value) => handleDevCountChange('scale', value)}
                minimumTrackTintColor={COLORS.track3}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.track3}
              />
            </View>

            <View style={s.divider} />

            {/* Ear Training */}
            <View style={s.devRow}>
              <View style={s.devHeader}>
                <Text style={s.devTrackLabel}>👂 Ear Training</Text>
                <Text style={s.devCount}>{Math.round(devCounts.ear)} cards</Text>
              </View>
              <Text style={s.devTierInfo}>
                Tier: {getCurrentEarTrainingTier(devCounts.ear).name} (
                {getCurrentEarTrainingTier(devCounts.ear).description})
              </Text>
              <Slider
                style={s.slider}
                minimumValue={0}
                maximumValue={60}
                step={1}
                value={devCounts.ear}
                onValueChange={(value) => setDevCounts({ ...devCounts, ear: value })}
                onSlidingComplete={(value) => handleDevCountChange('ear', value)}
                minimumTrackTintColor={COLORS.track4}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.track4}
              />
            </View>

            <View style={s.divider} />

            {/* Action buttons */}
            <View style={s.devActions}>
              <Pressable style={s.devButton} onPress={handleResetDevCards}>
                <Text style={s.devButtonText}>Reset Dev Cards Only</Text>
              </Pressable>
              <Pressable
                style={[s.devButton, { backgroundColor: '#FF6B6B' }]}
                onPress={handleResetAllCards}
              >
                <Text style={s.devButtonText}>⚠️ Reset All Cards</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── Footer ─── */}
        <Text style={s.footer}>{t('settings.footer')}</Text>
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
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.track1}20`,
    borderWidth: 2,
    borderColor: COLORS.track1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.track1,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  usernameInput: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.track1,
  },
  profileLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    backgroundColor: `${COLORS.track1}20`,
  },
  editBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.track1,
  },

  // Settings row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  settingValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.track2,
  },

  // Goal options
  goalOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  goalOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  goalOptionActive: {
    backgroundColor: `${COLORS.track2}15`,
  },
  goalOptionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Language options
  languageOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  languageOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  languageOptionActive: {
    backgroundColor: `${COLORS.track3}15`,
  },
  languageOptionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },

  // Notifications
  permissionHint: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  permissionHintText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.track3,
  },

  // Footer
  footer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },

  // Developer Mode
  devRow: {
    paddingVertical: SPACING.md,
  },
  devHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  devTrackLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  devCount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  devTierInfo: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  devActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  devButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    backgroundColor: COLORS.track3,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
