import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAppStore } from '@/stores/useAppStore';
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
  const { settings, updateSettings } = useAppStore();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(settings.username);

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

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Header ─── */}
        <View style={s.header}>
          <Text style={s.title}>설정</Text>
          <Text style={s.subtitle}>앱 환경을 맞춤 설정하세요</Text>
        </View>

        {/* ─── Profile section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <UserIcon size={20} />
            <Text style={s.sectionTitle}>프로필</Text>
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
                <Text style={s.profileLabel}>사용자 이름</Text>
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
                <Text style={s.editBtnText}>{isEditingUsername ? '저장' : '수정'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── Learning goals section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <TargetIcon size={20} />
            <Text style={s.sectionTitle}>학습 목표</Text>
          </View>

          <View style={s.card}>
            {/* Daily goal */}
            <View style={s.settingRow}>
              <View>
                <Text style={s.settingLabel}>일일 목표</Text>
                <Text style={s.settingDesc}>하루에 복습할 카드 수</Text>
              </View>
              <Text style={s.settingValue}>{settings.dailyGoal}장</Text>
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
                    {goal}장
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ─── Accessibility section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <AccessibilityIcon size={20} />
            <Text style={s.sectionTitle}>접근성</Text>
          </View>

          <View style={s.card}>
            {/* Vibration */}
            <View style={s.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.settingLabel}>진동 피드백</Text>
                <Text style={s.settingDesc}>정답/오답 시 진동으로 알림</Text>
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
            <Text style={s.sectionTitle}>앱 정보</Text>
          </View>

          <View style={s.card}>
            {/* Version */}
            <Pressable
              style={({ pressed }) => [s.infoRow, pressed && { opacity: 0.7 }]}
              onPress={() => {
                Alert.alert('버전 정보', 'FretFlow v1.0.0\n\n기타 프렛보드 마스터하기');
              }}
            >
              <Text style={s.infoLabel}>버전</Text>
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
                  '라이선스',
                  'MIT License\n\nCopyright (c) 2026 FretFlow\n\n오픈소스 라이브러리:\n- React Native\n- Expo\n- Zustand\n- React Query',
                );
              }}
            >
              <Text style={s.infoLabel}>라이선스</Text>
              <View style={s.infoRight}>
                <Text style={s.infoValue}>MIT</Text>
                <ChevronRightIcon />
              </View>
            </Pressable>

            <View style={s.divider} />

            {/* Developer */}
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>개발자</Text>
              <Text style={s.infoValue}>FretFlow Team</Text>
            </View>
          </View>
        </View>

        {/* ─── Footer ─── */}
        <Text style={s.footer}>Made with 💚 for guitar learners</Text>
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

  // Footer
  footer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
