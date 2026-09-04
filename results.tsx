import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperBackground } from '../src/components/PaperBackground';
import { Stepper } from '../src/components/Stepper';
import { FindingCard } from '../src/components/FindingCard';
import { ScoreGauge } from '../src/components/ScoreGauge';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';

export default function ResultsScreen() {
  const router = useRouter();
  const analysis = usePrescriptionStore((s) => s.analysis);

  if (!analysis) {
    return (
      <PaperBackground>
        <View style={styles.empty}>
          <Text style={styles.h}>No analysis yet</Text>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.link}>Go home</Text>
          </TouchableOpacity>
        </View>
      </PaperBackground>
    );
  }

  return (
    <PaperBackground>
      <Stepper current="results" />
      <ScrollView contentContainerStyle={styles.pad}>
        <ScoreGauge score={analysis.score} riskLevel={analysis.riskLevel} />
        <Text style={styles.h}>Findings</Text>
        {analysis.findings.length === 0 ? (
          <Text style={styles.ok}>No critical issues flagged for this regimen.</Text>
        ) : (
          analysis.findings.map((f) => <FindingCard key={f.id} finding={f} />)
        )}
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/alternatives')}>
          <Text style={styles.ctaText}>View alternatives</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => router.push('/report')}>
          <Text style={styles.secondaryText}>Final report</Text>
        </TouchableOpacity>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg, paddingBottom: 48, alignItems: 'stretch' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  h: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.md },
  ok: { ...typography.body, color: colors.safe },
  link: { color: colors.teal, marginTop: 12 },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { ...typography.h2, color: colors.white },
  secondary: {
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { ...typography.h2, color: colors.teal },
});
