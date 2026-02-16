import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

interface TabIconProps {
  name: 'home' | 'practice' | 'mastery' | 'settings';
  color: string;
  focused: boolean;
}

export function TabIcon({ name, color, focused }: TabIconProps) {
  const size = 22;
  const strokeWidth = focused ? 2.2 : 1.8;

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {name === 'home' && (
          <>
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <Polyline points="9 22 9 12 15 12 15 22" />
          </>
        )}
        {name === 'practice' && <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />}
        {name === 'mastery' && (
          <>
            <Path d="M1 6l7-4 8 4 7-4v16l-7 4-8-4-7 4z" />
            <Line x1="8" y1="2" x2="8" y2="18" />
            <Line x1="16" y1="6" x2="16" y2="22" />
          </>
        )}
        {name === 'settings' && (
          <>
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </>
        )}
      </Svg>
    </View>
  );
}
