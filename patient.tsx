import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stepper } from '../src/components/Stepper';
import { colors, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';
import type { Gender } from '../src/types';

export default function PatientScreen() {
  const router = useRouter();
  const { patient, setPatient } = usePrescriptionStore();

  const genders: { g: Gender; label: string }[] = [
    { g: 'male', label: 'M' },
    { g: 'female', label: 'F' },
    { g: 'other', label: 'OTHER' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.stepMeta}>STEP 02  /  06</Text>
            <Text style={styles.stepTitle}>Patient details</Text>
          </View>
        </View>
        <Stepper current="patient" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
            {/* Demographics */}
            <View style={styles.card}>
              <Text style={styles.section}>DEMOGRAPHICS</Text>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={patient.name}
                onChangeText={(name) => setPatient({ name })}
                placeholder="e.g. R. Okafor"
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>AGE</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={patient.age}
                    onChangeText={(age) => setPatient({ age })}
                    placeholder="34"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>WEIGHT</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={patient.weight}
                    onChangeText={(weight) => setPatient({ weight })}
                    placeholder="72"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <Text style={styles.fieldLabel}>GENDER</Text>
              <View style={styles.seg}>
                {genders.map(({ g, label }) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.segItem, patient.gender === g && styles.segOn]}
                    onPress={() => setPatient({ gender: g })}
                  >
                    <Text style={[styles.segText, patient.gender === g && styles.segTextOn]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Risk flags */}
            <View style={styles.card}>
              <Text style={styles.section}>RISK FLAGS</Text>
              <Toggle
                title="Pregnant"
                hint="Applies pregnancy-safety rules"
                value={patient.pregnant}
                onChange={(pregnant) => setPatient({ pregnant })}
              />
              <Toggle
                title="Kidney disease"
                hint="Enables renal dose adjustment"
                value={patient.kidneyDisease}
                onChange={(kidneyDisease) => setPatient({ kidneyDisease })}
              />
              <Toggle
                title="Liver disease"
                hint="Enables hepatic dose adjustment"
                value={patient.liverDisease}
                onChange={(liverDisease) => setPatient({ liverDisease })}
                last
              />
            </View>

            {/* Allergies */}
            <View style={styles.card}>
              <Text style={styles.section}>ALLERGIES</Text>
              <TextInput
                style={styles.input}
                value={patient.allergies}
                onChangeText={(allergies) => setPatient({ allergies })}
                placeholder="e.g. penicillin, sulfa"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.hint}>Comma-separated. Try: penicillin, sulfa, asthma</Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => router.push('/prescription')}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>Continue to medicines  →</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Toggle({
  title,
  hint,
  value,
  onChange,
  last,
}: {
  title: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, !last && styles.toggleBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.teal, false: '#D0D8D2' }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: { fontSize: 28, color: colors.textPrimary, marginTop: -2 },
  stepMeta: { fontSize: 10, letterSpacing: 1.2, color: colors.textMuted },
  stepTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  pad: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1.1,
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  row2: { flexDirection: 'row', gap: 12 },
  seg: { flexDirection: 'row', gap: 8 },
  segItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segOn: { backgroundColor: colors.tealLight, borderColor: colors.teal },
  segText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5 },
  segTextOn: { color: colors.teal },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  toggleHint: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: -4 },
  footer: {
    padding: 16,
    paddingBottom: 20,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cta: {
    backgroundColor: colors.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
