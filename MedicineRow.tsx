import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import type { Medicine } from '../types';

const UNITS = ['mg', 'mcg', 'g', 'ml', 'IU', 'units'];

export function MedicineRow({
  med,
  onChange,
  onRemove,
}: {
  med: Medicine;
  onChange: (patch: Partial<Medicine>) => void;
  onRemove: () => void;
}) {
  const doseNum = parseFloat(med.doseMg);
  const doseInvalid = med.doseMg !== '' && (Number.isNaN(doseNum) || doseNum <= 0);

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <TextInput
          style={styles.name}
          placeholder="Medicine name"
          placeholderTextColor={colors.textMuted}
          value={med.name}
          onChangeText={(name) => onChange({ name })}
        />
        <TouchableOpacity onPress={onRemove} hitSlop={12}>
          <Text style={styles.remove}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottom}>
        <TextInput
          style={[styles.dose, doseInvalid && styles.invalid]}
          placeholder="Dose"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={med.doseMg}
          onChangeText={(doseMg) => onChange({ doseMg })}
        />
        <View style={styles.unitWrap}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => onChange({ unit: u })}
              style={[styles.unit, med.unit === u && styles.unitOn]}
            >
              <Text style={[styles.unitText, med.unit === u && styles.unitTextOn]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.freq}
          placeholder="Freq e.g. 1-0-1"
          placeholderTextColor={colors.textMuted}
          value={med.frequency}
          onChangeText={(frequency) => onChange({ frequency })}
        />
      </View>
      {med.ocrConfidence != null && (
        <Text style={styles.conf}>OCR {(med.ocrConfidence * 100).toFixed(0)}%</Text>
      )}
      {doseInvalid && <Text style={styles.err}>Enter a valid positive dose</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', alignItems: 'center' },
  name: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  remove: { color: colors.error, fontSize: 16, padding: 4 },
  bottom: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 6 },
  dose: {
    width: 72,
    ...typography.mono,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.textPrimary,
  },
  invalid: { borderColor: colors.error },
  unitWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  unit: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
  },
  unitOn: { backgroundColor: colors.tealLight },
  unitText: { ...typography.caption, color: colors.textSecondary },
  unitTextOn: { color: colors.teal, fontWeight: '600' },
  freq: {
    flex: 1,
    minWidth: 100,
    ...typography.mono,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.textPrimary,
  },
  conf: { ...typography.caption, color: colors.teal, marginTop: 4 },
  err: { ...typography.caption, color: colors.error, marginTop: 4 },
});
