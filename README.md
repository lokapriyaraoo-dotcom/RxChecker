# Rx/Check — AI Prescription Error Detector

Clinical / editorial React Native (Expo) app for prescription safety checks.

## Design system

- **Feel:** trustworthy, clinical, editorial (medical documentation × modern mobile)
- **Fonts:** IBM Plex Sans (body) + IBM Plex Mono (labels, doses)
- **Colors:** teal `#0E6E63`, paper `#F4F6F2`, error `#B33A2E`, amber warnings, green safe
- **UI:** 10px radius, subtle shadows, left-stripe severity cards, semicircle score gauge, ECG pulse hero, 6-phase stepper

## Screens

1. **Home** — camera/gallery upload or manual entry  
2. **Patient** — name, age, weight, gender, pregnancy, allergies, kidney/liver  
3. **Prescription** — dynamic medicine rows (name, dose + unit, frequency) with validation  
4. **AI Analysis** — animated checklist (interaction, dosage, allergy, contraindications, duplicate, pregnancy, renal/hepatic)  
5. **Results** — color-coded finding cards + score gauge  
6. **Alternatives** — suggested swaps with **Truemeds** & **Tata 1mg** deep links  
7. **Final report** — branded PDF export (Rx/Check verification language)  
8. **History** — past analyses  

## Key behaviours

- **Rescan:** keeps existing patient profile, replaces only OCR-derived medicines (deduped), clears prior analysis, returns to prescription step.  
- **Multi-photo:** up to 5 images.  
- **OCR confidence** shown on medicine rows / prescription step.  
- **Dosage validation:** positive numeric dose + normal units (mg, mcg, g, ml, IU, units).  
- **OCR security:** client-side size cap (8 MB) + magic-byte header check before gateway; `mapGatewayErrorMessage` never leaks hostnames / provider names

## Deep links

- Truemeds: `https://www.truemeds.in/search/{drug}`  
- Tata 1mg: `https://www.1mg.com/search/all?name={drug}`  

## Disclaimer

Decision support only. Not a substitute for licensed clinical judgment.
