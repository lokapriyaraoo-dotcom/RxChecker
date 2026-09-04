import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PaperBackground } from '../src/components/PaperBackground';
import { Stepper } from '../src/components/Stepper';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';
import { runAnalysis } from '../src/services/analysisService';
import type { AnalysisCheck } from '../src/types';

export default function AnalysisScreen() {
  const router = useRouter();
  const { patient, medicines, setAnalysis, pushHistory, setAnalyzing } = usePrescriptionStore();
  const [checks, setChecks] = useState<AnalysisCheck[]>([]);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.15, { duration: 600 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAnalyzing(true);
      const result = await runAnalysis(patient, medicines, (c) => {
        if (!cancelled) setChecks(c);
      });
      if (cancelled) return;
      setAnalysis(result);
      pushHistory(result);
      setAnalyzing(false);
      router.replace('/results');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PaperBackground>
      <Stepper current="analysis" />
      <View style={styles.center}>
        <Animated.View style={[styles.orb, pulseStyle]} />
        <Text style={styles.title}>Scanning prescription safety</Text>
        <Text style={styles.sub}>Drug interaction · dosage · allergy · organ function…</Text>
        <View style={styles.list}>
          {checks.map((c) => (
            <View key={c.id} style={styles.row}>
              <Text style={styles.icon}>
                {c.status === 'pass'
                  ? '✓'
                  : c.status === 'fail'
                    ? '!'
                    : c.status === 'warn'
                      ? '⚠'
                      : c.status === 'running'
                        ? '◉'
                        : '○'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{c.label}</Text>
                {c.message ? <Text style={styles.msg}>{c.message}</Text> : null}
              </View>
              <Text style={[styles.status, statusColor(c.status)]}>{c.status}</Text>
            </View>
          ))}
        </View>
      </View>
    </PaperBackground>
  );
}

function statusColor(s: AnalysisCheck['status']) {
  if (s === 'pass') return { color: colors.safe };
  if (s === 'fail') return { color: colors.error };
  if (s === 'warn') return { color: colors.warning };
  if (s === 'running') return { color: colors.teal };
  return { color: colors.textMuted };
}

const styles = StyleSheet.create({
  center: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teal,
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  sub: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xl },
  list: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { width: 28, fontSize: 16, color: colors.teal },
  label: { ...typography.body, color: colors.textPrimary },
  msg: { ...typography.caption, color: colors.textSecondary },
  status: { ...typography.label, fontSize: 10 },
});
