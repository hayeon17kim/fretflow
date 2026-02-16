import Svg, { Path } from 'react-native-svg';

interface FireIconProps {
  color: string;
  size?: number;
}

export function FireIcon({ color, size = 16 }: FireIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 23c-4.97 0-8-3.03-8-7 0-2.66 1.34-5.36 4-8 0 3 2 5 4 5s3-1 3-3c1.33 1.33 3 4.33 3 6 0 4.97-2.03 8-6 8z" />
    </Svg>
  );
}
