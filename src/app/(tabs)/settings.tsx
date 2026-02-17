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
import i18n from '@/i18n';
import { useAppStore } from '@/stores/useAppStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { TimePickerRow } from '@/components/settings/TimePickerRow';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';

// ─── User icon ───
function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLORS.level1}
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
      stroke={COLORS.level2}
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
      stroke={COLORS.level3}
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
      stroke={COLORS.level3}
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
      stroke={COLORS.level4}
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

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(settings.username);
  const { scheduleAllNotifications } = useNotifications();
  const { requestPermissions } = useNotificationPermissions();

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
          t('settings.notifications.permissionDeniedMessage')
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
                    settings.dailyGoal === goal && { borderColor: COLORS.level2 },
                  ]}
                  onPress={() => updateSettings({ dailyGoal: goal })}
                >
                  <Text
                    style={[
                      s.goalOptionText,
                      settings.dailyGoal === goal && { color: COLORS.level2 },
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
                trackColor={{ false: COLORS.border, true: `${COLORS.level3}80` }}
                thumbColor={settings.notifications.enabled ? COLORS.level3 : COLORS.textSecondary}
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
                  i18n.language === 'ko' && { borderColor: COLORS.level3 },
                ]}
                onPress={() => i18n.changeLanguage('ko')}
              >
                <Text
                  style={[s.languageOptionText, i18n.language === 'ko' && { color: COLORS.level3 }]}
                >
                  {t('common.korean')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  s.languageOption,
                  i18n.language === 'en' && s.languageOptionActive,
                  i18n.language === 'en' && { borderColor: COLORS.level3 },
                ]}
                onPress={() => i18n.changeLanguage('en')}
              >
                <Text
                  style={[s.languageOptionText, i18n.language === 'en' && { color: COLORS.level3 }]}
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
                trackColor={{ false: COLORS.border, true: `${COLORS.level3}80` }}
                thumbColor={settings.vibrationEnabled ? COLORS.level3 : COLORS.textSecondary}
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
    backgroundColor: `${COLORS.level1}20`,
    borderWidth: 2,
    borderColor: COLORS.level1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.level1,
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
    borderBottomColor: COLORS.level1,
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
    backgroundColor: `${COLORS.level1}20`,
  },
  editBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.level1,
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
    color: COLORS.level2,
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
    backgroundColor: `${COLORS.level2}15`,
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
    backgroundColor: `${COLORS.level3}15`,
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
    color: COLORS.level3,
  },

  // Footer
  footer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
