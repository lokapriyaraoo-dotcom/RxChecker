export type Gender = 'male' | 'female' | 'other' | '';

export interface Patient {
  name: string;
  age: string;
  weight: string;
  gender: Gender;
  pregnant: boolean;
  allergies: string;
  kidneyDisease: boolean;
  liverDisease: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  doseMg: string;
  frequency: string; // e.g. "1-0-1", "twice daily"
  unit?: string; // mg, mcg, ml, IU
  ocrConfidence?: number;
  source?: 'ocr' | 'manual';
}

export type CheckId =
  | 'interaction'
  | 'dosage'
  | 'allergy'
  | 'contraindication'
  | 'duplicate'
  | 'pregnancy'
  | 'renal_hepatic';

export interface AnalysisCheck {
  id: CheckId;
  label: string;
  status: 'pending' | 'running' | 'pass' | 'warn' | 'fail';
  message?: string;
}

export type Severity = 'error' | 'warning' | 'safe' | 'info';

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  relatedDrugs?: string[];
  checkId: CheckId;
}

export interface Alternative {
  original: string;
  suggested: string;
  reason: string;
  truemedsUrl?: string;
  tata1mgUrl?: string;
}

export interface AnalysisResult {
  score: number; // 0-100
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  findings: Finding[];
  alternatives: Alternative[];
  checks: AnalysisCheck[];
  patientSnapshot: Patient;
  medicines: Medicine[];
  generatedAt: string;
}

export type WizardPhase =
  | 'home'
  | 'patient'
  | 'prescription'
  | 'analysis'
  | 'results'
  | 'alternatives'
  | 'report';

export const PHASES: WizardPhase[] = [
  'home',
  'patient',
  'prescription',
  'analysis',
  'results',
  'alternatives',
  'report',
];

export const PHASE_LABELS: Record<WizardPhase, string> = {
  home: 'Start',
  patient: 'Patient',
  prescription: 'Rx Entry',
  analysis: 'AI Scan',
  results: 'Findings',
  alternatives: 'Alternatives',
  report: 'Report',
};
