import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography } from '../theme';

/** Semicircle risk score gauge 0–100 */
export function ScoreGauge({ score, riskLevel }: { score: number; riskLevel: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = 70;
  const cx = 90;
  const cy = 88;
  // Semicircle from 180° to 0°
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + (endAngle - startAngle) * (clamped / 100);

  const polar = (a: number) => ({
    x: cx + r * Math.cos(a),
    y: cy - r * Math.sin(a),
  });
  const start = polar(startAngle);
  const end = polar(angle);
  const large = clamped > 50 ? 1 : 0;
  const arc = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;

  const color =
    riskLevel === 'HIGH' ? colors.error : riskLevel === 'MODERATE' ? colors.warning : colors.safe;

  return (
    <View style={styles.wrap}>
      <Svg width={180} height={110}>
        {/* Track */}
        <Path
          d={`M ${polar(Math.PI).x} ${polar(Math.PI).y} A ${r} ${r} 0 0 1 ${polar(0).x} ${polar(0).y}`}
          stroke={colors.border}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />
        {/* Value */}
        <Path d={arc} stroke={color} strokeWidth={12} fill="none" strokeLinecap="round" />
        <Circle cx={end.x} cy={end.y} r={5} fill={color} />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { color }]}>{clamped}</Text>
        <Text style={styles.risk}>{riskLevel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'IBMPlexSans-SemiBold',
  },
  risk: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: -2,
  },
});
