import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { PHASES, PHASE_LABELS, WizardPhase } from '../types';

const FLOW: WizardPhase[] = ['patient', 'prescription', 'analysis', 'results', 'alternatives', 'report'];

export function Stepper({ current }: { current: WizardPhase }) {
  const idx = FLOW.indexOf(current);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FLOW.map((p, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <View key={p} style={styles.item}>
            <View
              style={[
                styles.dot,
                done && styles.dotDone,
                active && styles.dotActive,
              ]}
            >
              <Text style={[styles.dotText, (done || active) && styles.dotTextOn]}>
                {done ? '✓' : i + 1}
              </Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {PHASE_LABELS[p]}
            </Text>
            {i < FLOW.length - 1 && <View style={[styles.line, done && styles.lineDone]} />}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    marginRight: spacing.sm,
    position: 'relative',
    minWidth: 56,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.teal },
  dotActive: {
    backgroundColor: colors.teal,
    borderWidth: 2,
    borderColor: colors.tealLight,
  },
  dotText: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  dotTextOn: { color: colors.white },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  labelActive: {
    color: colors.teal,
    fontWeight: '600',
  },
  line: {
    position: 'absolute',
    top: 13,
    left: 42,
    width: 28,
    height: 2,
    backgroundColor: colors.border,
  },
  lineDone: { backgroundColor: colors.teal },
});
