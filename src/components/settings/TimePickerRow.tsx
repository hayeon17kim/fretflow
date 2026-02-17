import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '@/utils/constants';
import { formatTime, parseTime } from '@/utils/notifications';

interface TimePickerRowProps {
  label: string;
  value: string; // "HH:mm" format
  onChange: (time: string) => void;
}

export function TimePickerRow({ label, value, onChange }: TimePickerRowProps) {
  const { i18n } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  const { hours, minutes } = parseTime(value);
  const dateValue = new Date();
  dateValue.setHours(hours, minutes, 0, 0);

  const handleChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      onChange(`${h}:${m}`);
    }
  };

  return (
    <>
      <Pressable style={s.row} onPress={() => setShowPicker(true)}>
        <Text style={s.label}>{label}</Text>
        <View style={s.valueContainer}>
          <Text style={s.value}>{formatTime(value, i18n.language)}</Text>
          <Text style={s.chevron}>›</Text>
        </View>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          is24Hour={i18n.language !== 'en'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  value: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
});
