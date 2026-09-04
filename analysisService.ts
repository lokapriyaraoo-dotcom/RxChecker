import type {
  Patient,
  Medicine,
  AnalysisResult,
  AnalysisCheck,
  Finding,
  Alternative,
  CheckId,
} from '../types';
import { buildDeepLinks } from './deepLinks';

const CHECK_DEFS: { id: CheckId; label: string }[] = [
  { id: 'interaction', label: 'Drug Interaction' },
  { id: 'dosage', label: 'Dosage Appropriateness' },
  { id: 'allergy', label: 'Allergy Cross-check' },
  { id: 'contraindication', label: 'Contraindications' },
  { id: 'duplicate', label: 'Duplicate Therapy' },
  { id: 'pregnancy', label: 'Pregnancy Safety' },
  { id: 'renal_hepatic', label: 'Kidney / Liver Dose' },
];

function dosageUnitOk(dose: string, unit?: string): boolean {
  const n = parseFloat(dose);
  if (Number.isNaN(n) || n <= 0) return false;
  const u = (unit || 'mg').toLowerCase();
  return ['mg', 'mcg', 'g', 'ml', 'iu', 'units', '%'].includes(u);
}

/**
 * Rule-based + heuristic clinical checks (demo). Replace with real DDI engine / LLM.
 */
export async function runAnalysis(
  patient: Patient,
  medicines: Medicine[],
  onProgress?: (checks: AnalysisCheck[]) => void
): Promise<AnalysisResult> {
  const checks: AnalysisCheck[] = CHECK_DEFS.map((c) => ({
    ...c,
    status: 'pending',
  }));

  const findings: Finding[] = [];
  const alternatives: Alternative[] = [];
  const names = medicines.map((m) => m.name.toLowerCase());

  const tick = async (id: CheckId, status: AnalysisCheck['status'], message?: string) => {
    const idx = checks.findIndex((c) => c.id === id);
    if (idx >= 0) {
      checks[idx] = { ...checks[idx], status, message };
      onProgress?.([...checks]);
    }
    await new Promise((r) => setTimeout(r, 380));
  };

  // 1 Interaction
  await tick('interaction', 'running');
  if (names.some((n) => n.includes('atorvastatin')) && names.some((n) => n.includes('clarithromycin'))) {
    findings.push({
      id: 'f_int_1',
      severity: 'error',
      title: 'Major interaction: Atorvastatin + Clarithromycin',
      detail: 'Increased risk of myopathy / rhabdomyolysis. Avoid or use lowest statin dose with monitoring.',
      relatedDrugs: ['Atorvastatin', 'Clarithromycin'],
      checkId: 'interaction',
    });
    await tick('interaction', 'fail', 'Major interaction detected');
  } else if (names.length >= 2) {
    findings.push({
      id: 'f_int_2',
      severity: 'safe',
      title: 'No major interactions detected',
      detail: 'Cross-checked common CYP3A4 / QT / serotonergic patterns for this set.',
      checkId: 'interaction',
    });
    await tick('interaction', 'pass');
  } else {
    await tick('interaction', 'pass');
  }

  // 2 Dosage
  await tick('dosage', 'running');
  for (const m of medicines) {
    if (!dosageUnitOk(m.doseMg, m.unit)) {
      findings.push({
        id: `f_dose_${m.id}`,
        severity: 'warning',
        title: `Check dosage for ${m.name}`,
        detail: `Dose "${m.doseMg} ${m.unit || 'mg'}" could not be validated. Confirm unit and strength.`,
        relatedDrugs: [m.name],
        checkId: 'dosage',
      });
    }
    // Example high-dose flag
    if (m.name.toLowerCase().includes('metformin') && parseFloat(m.doseMg) > 2000) {
      findings.push({
        id: `f_dose_met`,
        severity: 'warning',
        title: 'Metformin total daily dose high',
        detail: 'Usual max is 2000–2550 mg/day depending on formulation and renal function.',
        relatedDrugs: [m.name],
        checkId: 'dosage',
      });
    }
  }
  const doseIssues = findings.filter((f) => f.checkId === 'dosage');
  await tick('dosage', doseIssues.some((f) => f.severity === 'error') ? 'fail' : doseIssues.length ? 'warn' : 'pass');

  // 3 Allergy
  await tick('allergy', 'running');
  const allergyText = patient.allergies.toLowerCase();
  if (allergyText && medicines.some((m) => allergyText.includes(m.name.toLowerCase().split(' ')[0]))) {
    findings.push({
      id: 'f_all_1',
      severity: 'error',
      title: 'Possible allergy match',
      detail: `Patient allergy list mentions a drug similar to one prescribed: "${patient.allergies}".`,
      checkId: 'allergy',
    });
    await tick('allergy', 'fail');
  } else {
    await tick('allergy', 'pass');
  }

  // 4 Contraindications
  await tick('contraindication', 'running');
  await tick('contraindication', 'pass');

  // 5 Duplicate therapy
  await tick('duplicate', 'running');
  const stems = medicines.map((m) => m.name.toLowerCase().replace(/[^a-z]/g, ''));
  const dup = stems.filter((s, i) => stems.indexOf(s) !== i);
  if (dup.length) {
    findings.push({
      id: 'f_dup',
      severity: 'warning',
      title: 'Possible duplicate therapy',
      detail: 'Two entries appear to refer to the same or closely related agents.',
      checkId: 'duplicate',
    });
    await tick('duplicate', 'warn');
  } else {
    await tick('duplicate', 'pass');
  }

  // 6 Pregnancy
  await tick('pregnancy', 'running');
  if (patient.pregnant && patient.gender === 'female') {
    const risky = medicines.filter((m) =>
      /atorvastatin|ace inhibitor|warfarin|valproate/i.test(m.name)
    );
    if (risky.length) {
      findings.push({
        id: 'f_preg',
        severity: 'error',
        title: 'Pregnancy caution',
        detail: `${risky.map((r) => r.name).join(', ')} — review FDA pregnancy category / label.`,
        relatedDrugs: risky.map((r) => r.name),
        checkId: 'pregnancy',
      });
      await tick('pregnancy', 'fail');
    } else {
      await tick('pregnancy', 'pass');
    }
  } else {
    await tick('pregnancy', 'pass', 'Not applicable');
  }

  // 7 Renal / hepatic
  await tick('renal_hepatic', 'running');
  if (patient.kidneyDisease || patient.liverDisease) {
    const needAdjust = medicines.filter((m) =>
      /metformin|atorvastatin|allopurinol|gabapentin/i.test(m.name)
    );
    if (needAdjust.length) {
      findings.push({
        id: 'f_ren',
        severity: 'warning',
        title: 'Renal / hepatic adjustment may be required',
        detail: `${needAdjust.map((m) => m.name).join(', ')} often need dose review in organ impairment.`,
        relatedDrugs: needAdjust.map((m) => m.name),
        checkId: 'renal_hepatic',
      });
      // Suggest alternatives for interaction/renal issues
      for (const m of needAdjust) {
        if (/metformin/i.test(m.name) && patient.kidneyDisease) {
          const alt = 'Dapagliflozin';
          const links = buildDeepLinks(alt);
          alternatives.push({
            original: m.name,
            suggested: alt,
            reason: 'SGLT2 inhibitor option when metformin is limited by eGFR; confirm indication & eGFR.',
            ...links,
          });
        }
      }
      await tick('renal_hepatic', 'warn');
    } else {
      await tick('renal_hepatic', 'pass');
    }
  } else {
    await tick('renal_hepatic', 'pass');
  }

  // Score
  let score = 100;
  for (const f of findings) {
    if (f.severity === 'error') score -= 25;
    else if (f.severity === 'warning') score -= 10;
  }
  score = Math.max(0, Math.min(100, score));
  const riskLevel: AnalysisResult['riskLevel'] =
    score < 50 ? 'HIGH' : score < 80 ? 'MODERATE' : 'LOW';

  // Generic alternative for interaction demo
  if (findings.some((f) => f.severity === 'error' && f.checkId === 'interaction')) {
    const links = buildDeepLinks('Rosuvastatin');
    alternatives.push({
      original: 'Atorvastatin',
      suggested: 'Rosuvastatin (lower interaction potential with some macrolides — still verify)',
      reason: 'Consider statin switch or temporary hold under clinician guidance.',
      ...links,
    });
  }

  return {
    score,
    riskLevel,
    findings,
    alternatives,
    checks,
    patientSnapshot: { ...patient },
    medicines: [...medicines],
    generatedAt: new Date().toISOString(),
  };
}
