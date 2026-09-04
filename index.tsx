import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperBackground } from '../src/components/PaperBackground';
import { PulseECG } from '../src/components/PulseECG';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';

export default function HomeScreen() {
  const router = useRouter();
  const resetFlow = usePrescriptionStore((s) => s.resetFlow);
  const history = usePrescriptionStore((s) => s.history);

  const startManual = () => {
    resetFlow();
    router.push('/patient');
  };

  const startCamera = () => {
    resetFlow();
    router.push('/camera');
  };

  return (
    <PaperBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>Rx/Check</Text>
        <Text style={styles.tagline}>AI Prescription Error Detector</Text>
        <PulseECG />
        <Text style={styles.lead}>
          Clinical safety scan for drug interactions, dosage, allergies, pregnancy, and organ function — before the first dose.
        </Text>

        <TouchableOpacity style={styles.primary} onPress={startCamera} activeOpacity={0.9}>
          <Text style={styles.primaryText}>Scan prescription</Text>
          <Text style={styles.primarySub}>Camera or gallery · multi-photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={startManual} activeOpacity={0.9}>
          <Text style={styles.secondaryText}>Enter manually</Text>
        </TouchableOpacity>

        {history.length > 0 && (
          <TouchableOpacity style={styles.link} onPress={() => router.push('/history')}>
            <Text style={styles.linkText}>View past reports ({history.length})</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.disclaimer}>
          Decision support only. Always verify with a licensed clinician or pharmacist.
        </Text>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingTop: 72,
    alignItems: 'center',
  },
  brand: {
    ...typography.hero,
    color: colors.teal,
  },
  tagline: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  primary: {
    width: '100%',
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryText: {
    ...typography.h2,
    color: colors.white,
  },
  primarySub: {
    ...typography.caption,
    color: colors.tealLight,
    marginTop: 4,
  },
  secondary: {
    width: '100%',
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryText: {
    ...typography.h2,
    color: colors.teal,
  },
  link: { marginTop: spacing.xl },
  linkText: { ...typography.bodySmall, color: colors.teal },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
