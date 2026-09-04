import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PaperBackground } from '../src/components/PaperBackground';
import { Stepper } from '../src/components/Stepper';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';
import type { Gender } from '../src/types';

export default function PatientScreen() {
  const router = useRouter();
  const { patient, setPatient } = usePrescriptionStore();

  const genders: Gender[] = ['male', 'female', 'other'];

  return (
    <PaperBackground>
      <Stepper current="patient" />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h}>Patient profile</Text>
        <Text style={styles.hint}>Used for allergy, pregnancy, and organ-dose checks.</Text>

        <Label>Full name</Label>
        <TextInput
          style={styles.input}
          value={patient.name}
          onChangeText={(name) => setPatient({ name })}
          placeholder="As on prescription"
          placeholderTextColor={colors.textMuted}
        />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Label>Age (years)</Label>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={patient.age}
              onChangeText={(age) => setPatient({ age })}
              placeholder="e.g. 58"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Label>Weight (kg)</Label>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={patient.weight}
              onChangeText={(weight) => setPatient({ weight })}
              placeholder="e.g. 72"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <Label>Gender</Label>
        <View style={styles.seg}>
          {genders.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.segItem, patient.gender === g && styles.segOn]}
              onPress={() => setPatient({ gender: g })}
            >
              <Text style={[styles.segText, patient.gender === g && styles.segTextOn]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {patient.gender === 'female' && (
          <Toggle
            label="Currently pregnant"
            value={patient.pregnant}
            onChange={(pregnant) => setPatient({ pregnant })}
          />
        )}

        <Label>Known allergies</Label>
        <TextInput
          style={[styles.input, { minHeight: 64 }]}
          multiline
          value={patient.allergies}
          onChangeText={(allergies) => setPatient({ allergies })}
          placeholder="e.g. penicillin, sulfa"
          placeholderTextColor={colors.textMuted}
        />

        <Toggle
          label="Kidney disease / reduced eGFR"
          value={patient.kidneyDisease}
          onChange={(kidneyDisease) => setPatient({ kidneyDisease })}
        />
        <Toggle
          label="Liver disease"
          value={patient.liverDisease}
          onChange={(liverDisease) => setPatient({ liverDisease })}
        />

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push('/prescription')}
        >
          <Text style={styles.ctaText}>Continue to medicines</Text>
        </TouchableOpacity>
      </ScrollView>
    </PaperBackground>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.teal, false: colors.border }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg, paddingBottom: 48 },
  h: { ...typography.h1, color: colors.textPrimary },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: 6, marginTop: spacing.md },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.body,
    color: colors.textPrimary,
  },
  row2: { flexDirection: 'row', gap: spacing.md },
  seg: { flexDirection: 'row', gap: 8 },
  segItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  segOn: { backgroundColor: colors.tealLight, borderColor: colors.teal },
  segText: { ...typography.bodySmall, color: colors.textSecondary, textTransform: 'capitalize' },
  segTextOn: { color: colors.teal, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: 8,
  },
  toggleLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  cta: {
    marginTop: spacing.xxl,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { ...typography.h2, color: colors.white },
});
