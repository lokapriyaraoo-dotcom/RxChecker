import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';

const DEMO = [
  { name: 'R. Okafor', date: 'JUL 3, 2026', ref: 'REF·H1', score: 68, risk: 'MODERATE' as const },
  { name: 'M. Alvarez', date: 'JUN 28, 2026', ref: 'REF·H2', score: 91, risk: 'LOW' as const },
  { name: 'S. Chen', date: 'JUN 21, 2026', ref: 'REF·H3', score: 42, risk: 'HIGH' as const },
];

export default function HistoryScreen() {
  const router = useRouter();
  const history = usePrescriptionStore((s) => s.history);
  const setAnalysis = usePrescriptionStore((s) => s.setAnalysis);

  const rows =
    history.length > 0
      ? history.map((h, i) => ({
          name: h.patientSnapshot.name || 'Unnamed',
          date: new Date(h.generatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).toUpperCase(),
          ref: `REF·H${i + 1}`,
          score: h.score,
          risk: h.riskLevel,
          raw: h,
        }))
      : DEMO.map((d) => ({ ...d, raw: null }));

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.meta}>ARCHIVE</Text>
            <Text style={styles.title}>History</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.count}>ALL REVIEWS  /  {String(rows.length).padStart(2, '0')}</Text>
          <View style={styles.card}>
            {rows.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.row, i < rows.length - 1 && styles.border]}
                onPress={() => {
                  if (r.raw) {
                    setAnalysis(r.raw);
                    router.push('/report');
                  }
                }}
              >
                <View style={[styles.shield, shieldBg(r.risk)]}>
                  <Text style={{ fontSize: 14 }}>🛡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{r.name}</Text>
                  <Text style={styles.sub}>
                    {r.date}  ·  {r.ref}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.score, { color: riskColor(r.risk) }]}>{r.score}</Text>
                  <Text style={[styles.risk, { color: riskColor(r.risk) }]}>{r.risk}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => router.replace('/')} style={styles.homeLink}>
            <Text style={styles.homeText}>←  BACK TO HOME</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function riskColor(r: string) {
  if (r === 'HIGH') return colors.error;
  if (r === 'MODERATE') return colors.warning;
  return colors.safe;
}
function shieldBg(r: string) {
  if (r === 'HIGH') return { backgroundColor: '#FCE8E6' };
  if (r === 'MODERATE') return { backgroundColor: '#FEF3E0' };
  return { backgroundColor: '#E6F5EA' };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
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
  meta: { fontSize: 10, letterSpacing: 1.4, color: colors.textMuted },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  pad: { padding: 16 },
  count: { fontSize: 10, letterSpacing: 1.2, color: colors.textMuted, marginBottom: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  shield: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 2, letterSpacing: 0.3 },
  score: { fontSize: 20, fontWeight: '700' },
  risk: { fontSize: 9, letterSpacing: 0.8, fontWeight: '600', marginTop: 2 },
  homeLink: { marginTop: 28, alignItems: 'center' },
  homeText: { fontSize: 12, letterSpacing: 1.2, color: colors.teal, fontWeight: '600' },
});
