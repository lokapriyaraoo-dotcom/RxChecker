import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PulseECG } from '../src/components/PulseECG';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';

const DEMO_HISTORY = [
  { name: 'R. Okafor', date: 'JUL 3, 2026', score: 68, risk: 'MODERATE' as const },
  { name: 'M. Alvarez', date: 'JUN 28, 2026', score: 91, risk: 'LOW' as const },
  { name: 'S. Chen', date: 'JUN 21, 2026', score: 42, risk: 'HIGH' as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const resetFlow = usePrescriptionStore((s) => s.resetFlow);
  const history = usePrescriptionStore((s) => s.history);

  const recent =
    history.length > 0
      ? history.slice(0, 3).map((h) => ({
          name: h.patientSnapshot.name || 'Unnamed',
          date: new Date(h.generatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).toUpperCase(),
          score: h.score,
          risk: h.riskLevel,
        }))
      : DEMO_HISTORY;

  const startScan = () => {
    resetFlow();
    router.push('/patient');
  };
  const startManual = () => {
    resetFlow();
    router.push('/patient');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoR}>℞</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Rx/Check</Text>
              <Text style={styles.brandMeta}>V1.0  ·  CLINICAL</Text>
            </View>
          </View>

          {/* Hero card */}
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <Text style={styles.module}>PATIENT-SAFETY  /  MODULE 01</Text>
              <View style={styles.live}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>
              AI review for every{'\n'}prescription, before{'\n'}it leaves the pad.
            </Text>
            <Text style={styles.heroBody}>
              Rx/Check cross-references interactions, dosage, allergies and organ function against a 40k-entry clinical database.
            </Text>
            <View style={styles.ecgRow}>
              <View style={{ flex: 1 }}>
                <PulseECG width={200} height={40} />
                <Text style={styles.ecgLabel}>SIGNAL  /  72 BPM</Text>
              </View>
              <Text style={styles.delta}>Δ 0.04s</Text>
            </View>
          </View>

          {/* Dual CTAs */}
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.ctaDark} onPress={startScan} activeOpacity={0.9}>
              <View style={styles.ctaIconDark}>
                <Text style={{ fontSize: 16 }}>📷</Text>
              </View>
              <Text style={styles.ctaStep}>STEP 1  →  SCAN</Text>
              <Text style={styles.ctaTitleDark}>Scan Rx</Text>
              <Text style={styles.ctaSubDark}>Enter patient, then photograph the prescription</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaLight} onPress={startManual} activeOpacity={0.9}>
              <View style={styles.ctaIconLight}>
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </View>
              <Text style={styles.ctaStepLight}>MANUAL</Text>
              <Text style={styles.ctaTitleLight}>Enter</Text>
              <Text style={styles.ctaSubLight}>Type patient & medicines</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>40,218</Text>
              <Text style={styles.statLabel}>DRUG-DRUG{'\n'}PAIRS</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>7</Text>
              <Text style={styles.statLabel}>CHECK{'\n'}CATEGORIES</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>99.4%</Text>
              <Text style={styles.statLabel}>RECALL</Text>
            </View>
          </View>

          {/* History */}
          <View style={styles.histHead}>
            <Text style={styles.histMeta}>RECENT  /  {String(recent.length).padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.histAll}>ALL  →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.histTitle}>Prescription history</Text>

          <View style={styles.histCard}>
            {recent.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.histRow, i < recent.length - 1 && styles.histBorder]}
                onPress={() => router.push('/history')}
              >
                <View style={[styles.shield, shieldBg(r.risk)]}>
                  <Text style={{ fontSize: 14 }}>🛡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histName}>{r.name}</Text>
                  <Text style={styles.histDate}>{r.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.histScore, { color: riskColor(r.risk) }]}>{r.score}</Text>
                  <Text style={[styles.histRisk, { color: riskColor(r.risk) }]}>{r.risk}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.disclaimer}>NOT A SUBSTITUTE FOR CLINICAL JUDGMENT</Text>
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
  scroll: { padding: 20, paddingBottom: 48 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoR: { color: '#7DDBB0', fontSize: 22, fontWeight: '700' },
  brandName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  brandMeta: { fontSize: 10, letterSpacing: 1.2, color: colors.textMuted, marginTop: 2 },

  hero: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  module: { fontSize: 10, letterSpacing: 1.1, color: colors.textMuted, fontWeight: '500' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#3CB371' },
  liveText: { fontSize: 10, letterSpacing: 1, color: colors.textMuted, fontWeight: '600' },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  heroBody: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginBottom: 16 },
  ecgRow: { flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  ecgLabel: { fontSize: 9, letterSpacing: 1, color: colors.textMuted, marginTop: 4 },
  delta: { fontSize: 11, color: colors.tealMuted },

  ctaRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  ctaDark: {
    flex: 1.15,
    backgroundColor: colors.ink,
    borderRadius: 16,
    padding: 16,
    minHeight: 150,
  },
  ctaLight: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 150,
  },
  ctaIconDark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E2E28',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaIconLight: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaStep: { fontSize: 9, letterSpacing: 1, color: '#7A8A82', marginBottom: 4 },
  ctaStepLight: { fontSize: 9, letterSpacing: 1, color: colors.textMuted, marginBottom: 4 },
  ctaTitleDark: { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: 6 },
  ctaTitleLight: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  ctaSubDark: { fontSize: 12, lineHeight: 17, color: '#9AABA3' },
  ctaSubLight: { fontSize: 12, lineHeight: 17, color: colors.textSecondary },

  stats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.4 },
  statLabel: { fontSize: 9, letterSpacing: 0.8, color: colors.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 13 },
  statDiv: { width: 1, backgroundColor: colors.border, marginVertical: 4 },

  histHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  histMeta: { fontSize: 10, letterSpacing: 1.1, color: colors.textMuted },
  histAll: { fontSize: 11, letterSpacing: 0.8, color: colors.teal, fontWeight: '600' },
  histTitle: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: 4, marginBottom: 12, letterSpacing: -0.4 },
  histCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  histRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  histBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  shield: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  histName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  histDate: { fontSize: 11, color: colors.textMuted, marginTop: 2, letterSpacing: 0.4 },
  histScore: { fontSize: 20, fontWeight: '700' },
  histRisk: { fontSize: 9, letterSpacing: 0.8, fontWeight: '600', marginTop: 2 },

  disclaimer: {
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginTop: 28,
  },
});
