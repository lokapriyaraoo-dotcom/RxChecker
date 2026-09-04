import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PaperBackground } from '../src/components/PaperBackground';
import { colors, typography, spacing, radius } from '../src/theme';
import { usePrescriptionStore } from '../src/store/prescriptionStore';
import { runOcrMock, prepareImageForOcr } from '../src/services/ocrService';
import { mapGatewayErrorMessage } from '../src/utils/ocrSecurity';

export default function CameraScreen() {
  const router = useRouter();
  const {
    prescriptionImages,
    addImage,
    setImages,
    setPatient,
    patient,
    rescanReplaceMedicines,
    setOcrConfidence,
    setAnalyzing,
  } = usePrescriptionStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (fromCamera: boolean) => {
    setError(null);
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera / photos to scan prescriptions.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.85,
          allowsMultipleSelection: true,
          selectionLimit: 5,
        });
    if (result.canceled) return;
    const uris = result.assets.map((a) => a.uri);
    for (const uri of uris) {
      addImage(uri);
    }
  };

  const runOcr = async (isRescan: boolean) => {
    if (!prescriptionImages.length) {
      setError('Add at least one photo first.');
      return;
    }
    setBusy(true);
    setAnalyzing(true);
    setError(null);
    try {
      for (const uri of prescriptionImages) {
        const prepared = await prepareImageForOcr(uri, async () => {
          const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
          return jpegHeader.buffer;
        });
        if (!prepared.ok) {
          throw new Error(prepared.message);
        }
      }
      const ocr = await runOcrMock(prescriptionImages);
      setOcrConfidence(ocr.confidence);
      if (ocr.patientHints.name && !patient.name) {
        setPatient({
          name: ocr.patientHints.name,
          age: ocr.patientHints.age || patient.age,
        });
      }
      if (isRescan) {
        rescanReplaceMedicines(ocr.medicines);
        router.replace('/prescription');
      } else {
        usePrescriptionStore.getState().setMedicines(ocr.medicines);
        router.replace('/patient');
      }
    } catch (e) {
      setError(mapGatewayErrorMessage(e));
    } finally {
      setBusy(false);
      setAnalyzing(false);
    }
  };

  return (
    <PaperBackground>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h}>Scan prescription</Text>
        <Text style={styles.hint}>
          Multi-photo supported (up to 5). OCR confidence is shown after scan. Rescan keeps patient info and replaces photo-derived medicines only.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={() => pick(true)}>
            <Text style={styles.btnText}>Open camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={() => pick(false)}>
            <Text style={styles.btnOutlineText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {prescriptionImages.length > 0 && (
          <ScrollView horizontal style={styles.thumbs}>
            {prescriptionImages.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.thumb} />
            ))}
          </ScrollView>
        )}

        {error && <Text style={styles.err}>{error}</Text>}

        <TouchableOpacity
          style={[styles.cta, busy && { opacity: 0.6 }]}
          disabled={busy}
          onPress={() => runOcr(false)}
        >
          <Text style={styles.ctaText}>{busy ? 'Reading…' : 'Extract medicines'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          disabled={busy || !prescriptionImages.length}
          onPress={() => runOcr(true)}
        >
          <Text style={styles.linkText}>Rescan (keep patient, refresh meds)</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setImages([]); router.back(); }}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg },
  h: { ...typography.h1, color: colors.textPrimary },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginVertical: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  btn: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '600' },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutlineText: { color: colors.teal, fontWeight: '600' },
  thumbs: { marginTop: spacing.lg },
  thumb: { width: 88, height: 112, borderRadius: radius.sm, marginRight: 8 },
  err: { ...typography.bodySmall, color: colors.error, marginTop: spacing.md },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { ...typography.h2, color: colors.white },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { ...typography.bodySmall, color: colors.teal },
  cancel: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
