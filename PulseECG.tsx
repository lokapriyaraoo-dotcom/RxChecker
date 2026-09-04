import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

/** ECG-line pulse animation for hero */
export function PulseECG({ width = 280, height = 48 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1,
      false
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * (width * 0.5) }],
  }));

  const path =
    'M0 24 L40 24 L48 8 L56 40 L64 24 L100 24 L108 12 L116 36 L124 24 L160 24 L168 4 L176 44 L184 24 L220 24 L228 16 L236 32 L244 24 L280 24 L288 8 L296 40 L304 24 L340 24 L348 12 L356 36 L364 24 L400 24';

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Animated.View style={[{ width: width * 1.5 }, animatedStyle]}>
        <Svg width={width * 1.5} height={height} viewBox={`0 0 ${width * 1.5} ${height}`}>
          <Path d={path} stroke={colors.teal} strokeWidth={2} fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    opacity: 0.85,
  },
});
