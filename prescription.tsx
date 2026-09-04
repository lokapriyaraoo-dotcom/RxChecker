import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PaperBackground } from '../src/components/PaperBackground';
import { Stepper } from '../src/components/Stepper';
import { MedicineRow } from '../src/components/MedicineRow';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';

export default function PrescriptionScreen() {
  const router = useRouter();
  const { medicines, addMedicine, updateMedicine, removeMedicine, ocrConfidence } =
    usePrescriptionStore();

  const valid =
    medicines.length > 0 &&
    medicines.every(
      (m) => m.name.trim() && m.doseMg && parseFloat(m.doseMg) > 0 && m.frequency.trim()
    );

  return (
    <PaperBackground>
      <Stepper current="prescription" />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h}>Medicines</Text>
        {ocrConfidence != null && (
          <Text style={styles.conf}>OCR confidence · {(ocrConfidence * 100).toFixed(0)}%</Text>
        )}
        <Text style={styles.hint}>Validate dose & unit. Add or edit rows before AI analysis.</Text>

        {medicines.map((m) => (
          <MedicineRow
            key={m.id}
            med={m}
            onChange={(patch) => updateMedicine(m.id, patch)}
            onRemove={() => removeMedicine(m.id)}
          />
        ))}

        <TouchableOpacity
          style={styles.add}
          onPress={() =>
            addMedicine({ name: '', doseMg: '', frequency: '', unit: 'mg', source: 'manual' })
          }
        >
          <Text style={styles.addText}>+ Add medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cta, !valid && styles.ctaDisabled]}
          disabled={!valid}
          onPress={() => router.push('/analysis')}
        >
          <Text style={styles.ctaText}>Run AI safety analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rescan} onPress={() => router.push('/camera')}>
          <Text style={styles.rescanText}>Rescan photos</Text>
        </TouchableOpacity>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg, paddingBottom: 48 },
  h: { ...typography.h1, color: colors.textPrimary },
  conf: { ...typography.label, color: colors.teal, marginTop: 4 },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  add: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.teal,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addText: { color: colors.teal, fontWeight: '600' },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { ...typography.h2, color: colors.white },
  rescan: { marginTop: spacing.lg, alignItems: 'center' },
  rescanText: { ...typography.bodySmall, color: colors.teal },
});
