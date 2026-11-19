import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type Props = {
  size?: number;
};

/** Inline crest matching the web brand mark (gold / black / red). */
export function Crest({ size = 48 }: Props) {
  const h = size * (72 / 64);
  return (
    <View style={{ width: size, height: h }}>
      <Svg width={size} height={h} viewBox="0 0 64 72">
        <Defs>
          <LinearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD54F" />
            <Stop offset="55%" stopColor="#FFB800" />
            <Stop offset="100%" stopColor="#E09A00" />
          </LinearGradient>
          <LinearGradient id="crestRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#E53935" />
            <Stop offset="100%" stopColor="#8B1A1A" />
          </LinearGradient>
        </Defs>
        <Path
          d="M32 2 L58 14 L58 38 C58 54 45 66 32 70 C19 66 6 54 6 38 L6 14 Z"
          fill="url(#crestGold)"
          stroke="#FFB800"
          strokeWidth={1.2}
        />
        <Path
          d="M32 8 L52 17 L52 37 C52 50 42 60 32 63.5 C22 60 12 50 12 37 L12 17 Z"
          fill="#0A0A0C"
        />
        <Path
          d="M32 14 L46 21 L46 36 C46 45 39 52 32 55 C25 52 18 45 18 36 L18 21 Z"
          fill="url(#crestRed)"
          opacity={0.95}
        />
        <Path d="M26 30 L32 24 L38 30 L32 36 Z" fill="#FFD54F" />
        <Circle cx={32} cy={42} r={3.2} fill="#FFD54F" />
      </Svg>
    </View>
  );
}
