# Rx/Check

A phone-layout prescription check. Patient details come first. Then you photograph a slip or type the medicines. The review uses a short teaching set stored in the app. It is not a clinical clearance.

Photos are read in the browser. They are not uploaded.

## Run it from GitHub

1. Create an empty repository on GitHub.
2. From this project folder:

```bash
git init
git add .
git commit -m "Add Rx/Check"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

3. Open the Actions tab. The workflow `.github/workflows/ocr-security.yml` runs `npm run test:ocr` on every pull request and on pushes to `main`.
4. On a computer with Node 22:

```bash
npm ci
npm run test:ocr
npm run dev
```

The dev script prints a local address. Open that on a phone or in a narrow browser window. Use the browser menu to add it to the home screen if you want an icon. This repository is not a Gradle or Expo project, so it does not produce a Play Store package.

## What the OCR tests lock

- Gateway failures become one of a fixed set of sentences. Vendor hosts, tokens, and stack paths are not shown.
- Images one byte under the 4 MB cap, exactly on the cap, and one byte over.
- JPEG, PNG, GIF, and WEBP signatures pass. PDF, HTML, BMP, empty files, and a truncated JPEG do not.
- Dose text in mg, g, mcg, and ml, including `5 mg/5 ml` and `100 mg/10 ml`.
- Truemeds, Tata 1mg, and DrugBank links for each suggested name.
- A rescan keeps the patient, drops only photo-derived rows, and does not duplicate a medicine.
