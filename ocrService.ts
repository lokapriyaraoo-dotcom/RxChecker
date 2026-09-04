import { validateImageBytes, mapGatewayErrorMessage, MAX_IMAGE_BYTES } from '../utils/ocrSecurity';
import type { Medicine } from '../types';

export interface OcrResult {
  medicines: Medicine[];
  patientHints: { name?: string; age?: string };
  confidence: number;
  rawText?: string;
}

/**
 * Client-side gate before any network call.
 * Rejects oversized / invalid images so the gateway never sees them.
 */
export async function prepareImageForOcr(
  uri: string,
  getBytes: (uri: string) => Promise<ArrayBuffer>
): Promise<{ ok: true; bytes: ArrayBuffer; mime: string } | { ok: false; message: string }> {
  try {
    const bytes = await getBytes(uri);
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, message: mapGatewayErrorMessage('413 Payload Too Large') };
    }
    const validation = validateImageBytes(bytes);
    if (!validation.ok) {
      if (validation.reason === 'too_large') {
        return { ok: false, message: mapGatewayErrorMessage('413 Payload Too Large') };
      }
      if (validation.reason === 'invalid_header') {
        return { ok: false, message: mapGatewayErrorMessage('415 Unsupported Media Type') };
      }
      return { ok: false, message: mapGatewayErrorMessage('empty image') };
    }
    return { ok: true, bytes, mime: validation.mime };
  } catch (e) {
    return { ok: false, message: mapGatewayErrorMessage(e) };
  }
}

/** Mock OCR that extracts sample Indian prescription drugs + patient hints */
export async function runOcrMock(_imageUris: string[]): Promise<OcrResult> {
  // Simulate network + vision latency
  await new Promise((r) => setTimeout(r, 1400));

  // Deterministic sample that matches clinical demo flow
  const medicines: Medicine[] = [
    {
      id: `ocr_${Date.now()}_1`,
      name: 'Atorvastatin',
      doseMg: '20',
      frequency: '1-0-0',
      unit: 'mg',
      ocrConfidence: 0.94,
      source: 'ocr',
    },
    {
      id: `ocr_${Date.now()}_2`,
      name: 'Metformin',
      doseMg: '500',
      frequency: '1-0-1',
      unit: 'mg',
      ocrConfidence: 0.91,
      source: 'ocr',
    },
    {
      id: `ocr_${Date.now()}_3`,
      name: 'Amlodipine',
      doseMg: '5',
      frequency: '1-0-0',
      unit: 'mg',
      ocrConfidence: 0.88,
      source: 'ocr',
    },
  ];

  return {
    medicines,
    patientHints: { name: 'Ramesh K.', age: '58' },
    confidence: 0.91,
    rawText: 'Rx\nAtorvastatin 20 mg OD\nMetformin 500 mg BD\nAmlodipine 5 mg OD',
  };
}

/**
 * Production path: call your backend OCR gateway.
 * Always route errors through mapGatewayErrorMessage.
 */
export async function runOcrGateway(
  prepared: { bytes: ArrayBuffer; mime: string },
  endpoint = process.env.EXPO_PUBLIC_OCR_URL ?? ''
): Promise<OcrResult> {
  if (!endpoint) {
    // Fallback to mock when no backend configured
    return runOcrMock([]);
  }
  try {
    const form = new FormData();
    // @ts-expect-error RN FormData accepts blob-like
    form.append('image', {
      uri: 'data:' + prepared.mime + ';base64,' + btoa(String.fromCharCode(...new Uint8Array(prepared.bytes))),
      type: prepared.mime,
      name: 'rx.jpg',
    });
    const res = await fetch(endpoint, { method: 'POST', body: form });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data as OcrResult;
  } catch (e) {
    throw new Error(mapGatewayErrorMessage(e));
  }
}
