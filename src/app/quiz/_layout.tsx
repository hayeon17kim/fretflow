import { Stack } from 'expo-router';
import { COLORS } from '@/utils/constants';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation: 'slide_from_bottom',
      }}
    />
  );
}
