import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperBackground } from '../src/components/PaperBackground';
import { Stepper } from '../src/components/Stepper';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';

export default function AlternativesScreen() {
  const router = useRouter();
  const analysis = usePrescriptionStore((s) => s.analysis);
  const alts = analysis?.alternatives ?? [];

  const open = async (url?: string) => {
    if (!url) return;
    const can = await Linking.canOpenURL(url);
    if (can) await Linking.openURL(url);
  };

  return (
    <PaperBackground>
      <Stepper current="alternatives" />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h}>Suggested swaps</Text>
        <Text style={styles.hint}>
          Alternatives to reduce interactions or organ burden. Confirm with a clinician before switching.
        </Text>

        {alts.length === 0 ? (
          <Text style={styles.ok}>No swaps suggested for the current findings.</Text>
        ) : (
          alts.map((a, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.from}>{a.original}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.to}>{a.suggested}</Text>
              <Text style={styles.reason}>{a.reason}</Text>
              <View style={styles.links}>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => open(a.truemedsUrl)}
                >
                  <Text style={styles.linkText}>Truemeds</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => open(a.tata1mgUrl)}
                >
                  <Text style={styles.linkText}>Tata 1mg</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.cta} onPress={() => router.push('/report')}>
          <Text style={styles.ctaText}>Generate final report</Text>
        </TouchableOpacity>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg, paddingBottom: 48 },
  h: { ...typography.h1, color: colors.textPrimary },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  ok: { ...typography.body, color: colors.safe },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  from: { ...typography.body, color: colors.textSecondary },
  arrow: { color: colors.teal, marginVertical: 4 },
  to: { ...typography.h2, color: colors.teal },
  reason: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 8 },
  links: { flexDirection: 'row', gap: 10, marginTop: 12 },
  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.tealLight,
  },
  linkText: { ...typography.label, color: colors.teal, textTransform: 'none', letterSpacing: 0 },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { ...typography.h2, color: colors.white },
});
