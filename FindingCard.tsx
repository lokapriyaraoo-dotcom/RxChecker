import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius, severityColor, severityBg } from '../theme';
import type { Finding } from '../types';

export function FindingCard({ finding }: { finding: Finding }) {
  const stripe = severityColor(finding.severity);
  const bg = severityBg(finding.severity);
  return (
    <View style={[styles.card, { borderLeftColor: stripe, backgroundColor: bg }]}>
      <Text style={[styles.badge, { color: stripe }]}>{finding.severity.toUpperCase()}</Text>
      <Text style={styles.title}>{finding.title}</Text>
      <Text style={styles.detail}>{finding.detail}</Text>
      {finding.relatedDrugs?.length ? (
        <View style={styles.chips}>
          {finding.relatedDrugs.map((d) => (
            <View key={d} style={styles.chip}>
              <Text style={styles.chipText}>{d}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  badge: {
    ...typography.label,
    marginBottom: 4,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  detail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.mono,
    fontSize: 12,
    color: colors.teal,
  },
});
