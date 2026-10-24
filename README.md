# ℞ Rx/Check — AI Prescription Error Detector

React Native / Expo (Android + iOS) app. Enter the patient first, then scan the prescription (one or many photos) or type it in. Rx/Check reads the drug names, doses and the patient’s name/age, checks interactions, dosage, allergies, duplicates, pregnancy and kidney/liver rules, suggests safer swaps with Tata 1mg / Truemeds / DrugBank links, and exports a PDF report.

> **Prototype, not a medical device.** Checks run against a small illustrative dataset (8 drugs, in `src/lib/drugs.ts`). A drug outside that dataset is reported as **NOT CHECKED**, never as safe. A pharmacist or physician must confirm every result.

## Flow

`Home → Patient details → Scan / Medicines → Analysis (animated checklist) → Results → Alternatives → Final report`

| You asked for | Where |
|---|---|
| Patient details **before** scanning | `src/screens/Patient.tsx` → then `Prescription.tsx` |
| Scan, read drug name + dose, show OCR confidence | `services/ocr.ts`, `lib/ocrParse.ts`; confidence chip per photo and per scan |
| Multi-photo prescriptions | up to 6 photos, merged without duplicates (`lib/meds.ts`) |
| Rescan keeps patient + typed medicines, replaces only photo medicines, no duplicates | `RESCAN` in `state/reducer.ts` (tested in `tests/reducer.test.ts`) |
| Scan history panel, switch between previous and latest | `ScanHistoryPanel` in `screens/Results.tsx` |
| Compare view (error cards + score change) | `CompareView`, `lib/compare.ts` |
| Dosage validation, mg / g / mcg / ml, liquids like `5 mg/5 ml`, `100 mg/10 ml` | `lib/dosage.ts`, `lib/validate.ts` |
| Patient name/age read from the prescription, wrong-patient warning | `checkIdentity` in `lib/ocrParse.ts` |
| Alternatives that avoid interactions (re-checked before being offered) | `suggestAlternatives` in `lib/analysis.ts` |
| Tata 1mg + Truemeds (+ DrugBank) links | `lib/links.ts`, `ui/shared.tsx` |
| Final report with the app name and per-drug suitability | `lib/report.ts` |
| Prescription history list | Home screen, saved on the device |

## 1. Run the tests (no phone needed)

```bash
npm install
npm test                    # all suites
npm run test:ocr-security   # only the OCR security suite (what CI runs as a required check)
npm run typecheck
```

## 2. Put it on GitHub

```bash
cd rxcheck
git init -b main
git add .
git commit -m "Rx/Check app"
# create the empty repo on github.com (or: gh repo create rxcheck --private --source=. --push)
git remote add origin https://github.com/<you>/rxcheck.git
git push -u origin main
```

After the first `npm install`, commit the generated `package-lock.json` so CI uses `npm ci`.

### CI: OCR security suite on every pull request

`.github/workflows/ci.yml` runs on **every** pull request (no path filter) with three jobs: **OCR security suite**, **Unit tests**, **Type check**.

To make regressions block a merge: GitHub → repo → **Settings → Branches → Add branch ruleset** (or classic protection rule) for `main` → enable **Require status checks to pass** → add **OCR security suite** (and **Unit tests**). A PR that breaks the size cap, header check, leak protection or error messages can then no longer be merged.

What the security suite (`tests/security/`) pins down:

- **Size cap** 3 MiB: exactly at the cap passes; 1 and 2 bytes over fail; padded base64; data-URL prefix not counted; oversized payloads rejected before decoding; no network call for rejected images.
- **Invalid headers**: GIF, PDF, HTML, SVG, ZIP, EXE, text, all-zero, truncated JPEG, corrupted PNG, RIFF-but-not-WEBP; MIME claimed vs real bytes must agree.
- **Gateway leaks**: upstream bodies, URLs, keys, stack traces and failed-response bodies never reach the UI or the log callback; the proxy never forwards upstream errors and sends its key in a header, not the URL.
- **`mapGatewayErrorMessage`**: every known failure pattern (HTTP status, response objects, `Error` text, network/timeout codes) maps to one fixed generic message; the exact wording is locked; `auth` and `server` share one message so credential problems are never revealed.

## 3. Run the app on your phone

```bash
npm install
npx expo install --fix        # aligns native package versions with the installed Expo SDK
cp .env.example .env          # then fill in the OCR endpoint (step 4)
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS). Expo Go only supports the newest SDK; if it says the project is incompatible, run `npx expo install expo@latest` then `npx expo install --fix`.

You can try everything except photo reading without step 4 — manual entry, analysis, compare, report and links all work.

## 4. Deploy the OCR proxy (needed for photo reading)

Photos are read by Google Cloud Vision through a tiny serverless proxy (`api/ocr.ts` → `server/ocrHandler.ts`) so the API key **never ships inside the app**.

1. Google Cloud console → enable **Cloud Vision API** → create an API key (restrict it to the Vision API).
2. [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo (Framework preset: *Other*).
3. Project → **Settings → Environment Variables**: `GOOGLE_VISION_API_KEY` = your key. Optional: `APP_TOKEN` = any random string.
4. Deploy. Your endpoint is `https://<project>.vercel.app/api/ocr`.
5. In `.env`: `EXPO_PUBLIC_OCR_ENDPOINT=https://<project>.vercel.app/api/ocr` (and `EXPO_PUBLIC_OCR_APP_TOKEN` if you set `APP_TOKEN`). Restart `npx expo start`.

Notes: `APP_TOKEN` inside a mobile app is not a real secret; it only deters casual abuse. The proxy rate-limits per instance (20 req/min) — use a real store (Upstash/Redis) before heavy use. Prescription photos contain health data: get consent and check the rules that apply to you (e.g. DPDP Act in India, HIPAA/GDPR elsewhere).

## 5. Build an Android APK with GitHub Actions

1. Create a free account at expo.dev, then **Account settings → Access tokens** → create a token.
2. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret** → `EXPO_TOKEN`.
3. Locally, once: `npx eas-cli login`, `npx eas-cli init` (links the project), and set the endpoint for builds:
   `npx eas-cli env:create --name EXPO_PUBLIC_OCR_ENDPOINT --value https://<project>.vercel.app/api/ocr --environment preview --visibility plaintext`. Commit the `eas.json` / `app.json` changes `eas init` makes.
4. GitHub → **Actions → Build Android APK → Run workflow**. The log prints the EAS build link; open it on your phone to download and install the APK (allow “install unknown apps”).

Or build locally: `npx eas-cli build --platform android --profile preview`.

## 6. Check the store links

```bash
npm run check:links                       # every default drug × Tata 1mg / Truemeds / DrugBank
npm run check:links -- Azithromycin       # specific drugs
```

`tests/links.test.ts` proves every generated URL is https on an allow-listed host, properly encoded, and opened through `Linking.openURL`. Whether the **sites themselves** still answer on those search URLs can only be checked live, with the command above. If one fails, change the pattern in `src/lib/links.ts` (the unit tests will tell you what else to update).

## About DrugBank

go.drugbank.com data is licensed and the site is not meant to be scraped, so Rx/Check does **not** copy it. Each drug has a **DrugBank ↗** link instead. To use DrugBank (or openFDA / RxNorm) data for real checks, replace `src/lib/drugs.ts` with data you are licensed to use; the rest of the app reads only from that file.

## Project layout

```
App.tsx                    navigation + persistence
src/screens/               Home, Patient, Prescription, Analysis, Results, Alternatives, Report
src/ui/                    theme (IBM Plex, teal #0E6E63, paper grid), ECG pulse, stepper, gauge
src/lib/                   dosage, ocrGateway, ocrParse, drugs, analysis, compare, links, report, validate (pure TS)
src/state/                 reducer (rescan, history, compare), storage
src/services/ocr.ts        camera/gallery → resize → gateway
server/ocrHandler.ts       OCR proxy logic (framework-free, unit-tested)
api/ocr.ts                 Vercel adapter
tests/                     Vitest suites (tests/security = OCR protections)
.github/workflows/         ci.yml (every PR), android-apk.yml (manual)
```
