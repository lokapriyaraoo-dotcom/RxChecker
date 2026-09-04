import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../theme';
import type { WizardPhase } from '../types';

/** Matches Lovable: HOME · PATIENT · RX · SCAN · RESULT · REPORT */
const FLOW: { key: WizardPhase | 'scan'; label: string }[] = [
  { key: 'home', label: 'HOME' },
  { key: 'patient', label: 'PATIENT' },
  { key: 'prescription', label: 'RX' },
  { key: 'analysis', label: 'SCAN' },
  { key: 'results', label: 'RESULT' },
  { key: 'report', label: 'REPORT' },
];

export function Stepper({ current }: { current: WizardPhase }) {
  const map: Record<string, number> = {
    home: 0,
    patient: 1,
    prescription: 2,
    analysis: 3,
    results: 4,
    alternatives: 4,
    report: 5,
  };
  const idx = map[current] ?? 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {FLOW.map((p, i) => {
          const active = i === idx;
          const done = i < idx;
          return (
            <View key={p.label} style={styles.seg}>
              <View
                style={[
                  styles.bar,
                  done && styles.barDone,
                  active && styles.barActive,
                ]}
              />
              <Text
                style={[
                  styles.label,
                  (active || done) && styles.labelOn,
                  active && styles.labelActive,
                ]}
                numberOfLines={1}
              >
                {p.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  track: {
    flexDirection: 'row',
    gap: 6,
  },
  seg: { flex: 1 },
  bar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  barDone: { backgroundColor: colors.teal },
  barActive: { backgroundColor: colors.teal },
  label: {
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.textMuted,
    fontWeight: '500',
  },
  labelOn: { color: colors.tealMuted },
  labelActive: { color: colors.teal, fontWeight: '700' },
});
