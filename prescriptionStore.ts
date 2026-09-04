import { create } from 'zustand';
import type {
  Patient,
  Medicine,
  AnalysisResult,
  WizardPhase,
  AnalysisCheck,
} from '../types';
import { PHASES } from '../types';

const emptyPatient = (): Patient => ({
  name: '',
  age: '',
  weight: '',
  gender: '',
  pregnant: false,
  allergies: '',
  kidneyDisease: false,
  liverDisease: false,
});

interface PrescriptionState {
  phase: WizardPhase;
  patient: Patient;
  medicines: Medicine[];
  prescriptionImages: string[]; // local URIs
  analysis: AnalysisResult | null;
  history: AnalysisResult[];
  isAnalyzing: boolean;
  ocrConfidence: number | null;

  setPhase: (p: WizardPhase) => void;
  nextPhase: () => void;
  prevPhase: () => void;
  setPatient: (p: Partial<Patient>) => void;
  setMedicines: (m: Medicine[]) => void;
  addMedicine: (m: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, patch: Partial<Medicine>) => void;
  removeMedicine: (id: string) => void;
  /** Rescan: keep patient, replace only photo-derived medicines, clear analysis */
  rescanReplaceMedicines: (fromOcr: Medicine[]) => void;
  setImages: (uris: string[]) => void;
  addImage: (uri: string) => void;
  setAnalysis: (r: AnalysisResult | null) => void;
  setAnalyzing: (v: boolean) => void;
  setOcrConfidence: (c: number | null) => void;
  pushHistory: (r: AnalysisResult) => void;
  resetFlow: () => void;
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  phase: 'home',
  patient: emptyPatient(),
  medicines: [],
  prescriptionImages: [],
  analysis: null,
  history: [],
  isAnalyzing: false,
  ocrConfidence: null,

  setPhase: (phase) => set({ phase }),
  nextPhase: () => {
    const idx = PHASES.indexOf(get().phase);
    if (idx < PHASES.length - 1) set({ phase: PHASES[idx + 1] });
  },
  prevPhase: () => {
    const idx = PHASES.indexOf(get().phase);
    if (idx > 0) set({ phase: PHASES[idx - 1] });
  },
  setPatient: (p) => set((s) => ({ patient: { ...s.patient, ...p } })),
  setMedicines: (medicines) => set({ medicines }),
  addMedicine: (m) =>
    set((s) => ({
      medicines: [
        ...s.medicines,
        { ...m, id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` },
      ],
    })),
  updateMedicine: (id, patch) =>
    set((s) => ({
      medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  removeMedicine: (id) =>
    set((s) => ({ medicines: s.medicines.filter((m) => m.id !== id) })),

  rescanReplaceMedicines: (fromOcr) => {
    // Keep patient + manual entries that user may have added; replace OCR-sourced only
    const manual = get().medicines.filter((m) => m.source === 'manual');
    const merged = [
      ...manual,
      ...fromOcr.map((m) => ({
        ...m,
        id: m.id || `ocr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        source: 'ocr' as const,
      })),
    ];
    // Deduplicate by normalized name
    const seen = new Set<string>();
    const unique = merged.filter((m) => {
      const key = m.name.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    set({
      medicines: unique,
      analysis: null,
      ocrConfidence: null,
      phase: 'prescription',
    });
  },

  setImages: (prescriptionImages) => set({ prescriptionImages }),
  addImage: (uri) =>
    set((s) => ({
      prescriptionImages: [...s.prescriptionImages, uri].slice(0, 5), // multi-photo support, max 5
    })),
  setAnalysis: (analysis) => set({ analysis }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setOcrConfidence: (ocrConfidence) => set({ ocrConfidence }),
  pushHistory: (r) => set((s) => ({ history: [r, ...s.history].slice(0, 20) })),
  resetFlow: () =>
    set({
      phase: 'home',
      patient: emptyPatient(),
      medicines: [],
      prescriptionImages: [],
      analysis: null,
      isAnalyzing: false,
      ocrConfidence: null,
    }),
}));
