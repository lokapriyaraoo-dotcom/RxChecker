import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperBackground } from '../src/components/PaperBackground';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';

export default function HistoryScreen() {
  const router = useRouter();
  const history = usePrescriptionStore((s) => s.history);
  const setAnalysis = usePrescriptionStore((s) => s.setAnalysis);

  return (
    <PaperBackground>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h}>Past reports</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>No saved analyses yet.</Text>
        ) : (
          history.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => {
                setAnalysis(r);
                router.push('/report');
              }}
            >
              <Text style={styles.name}>{r.patientSnapshot.name || 'Unnamed patient'}</Text>
              <Text style={styles.meta}>
                Score {r.score} · {r.riskLevel} · {new Date(r.generatedAt).toLocaleString()}
              </Text>
              <Text style={styles.meds}>
                {r.medicines.map((m) => m.name).join(', ')}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg },
  h: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  empty: { ...typography.body, color: colors.textMuted },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { ...typography.h2, color: colors.textPrimary },
  meta: { ...typography.label, color: colors.teal, marginTop: 4 },
  meds: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 6 },
});
