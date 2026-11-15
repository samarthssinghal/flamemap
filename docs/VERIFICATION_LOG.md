# Verification log

## Done on 2026-11-14 (automated, by the build agent)
- Ranker: 11 unit tests pass, including hand-computed cases (PLAN.md section 5).
- Hand check: lunar habitat + prevention, BASS-II. O2 gap 7.8 / 79 = 0.0987; pressure gap 31.0 / 71.7 = 0.4324; gravity 0.166; task 0; airflow not set. (0.30 x 0.0987 + 0.20 x 0.4324 + 0.15 x 0.166) / 0.90 = 0.1567, match = 84. The app shows 84.
- Range cross-check: the ranges below were computed twice in the browser by two separate code paths (a column profiler and the mapping code) and agree: BASS-II O2 13.6 to 22.2; SAME-R flow 0 to 8.1; SAME flow 5 to 10; FLEX O2 0.12 to 0.34 and pressure max 2319.9 mmHg (309.3 kPa); CFI O2 0.17 to 0.21; Flame Design XO2 0.198 to 0.850 and pinit 0.425 to 3.008 atm (43.0 to 304.8 kPa; corrected to 3.0076 atm = 304.7 kPa when R04 recomputed from the raw table, see DATA_CLEANING_LOG.md); CFI-G XO2 0.12 to 0.85 and pressure 0.495 to 3.310 bar; SPICE air rate -5.92 to 85.28.
- Run bins: the build fails unless the copied bins sum to the browser-computed counts per investigation (129, 273, 87, 316, 333; total 1,138). It passes.
- Summaries: word limits enforced by the build (80 and 35 words).
- Pages rendered in headless Chrome at 1280 px and 390 px: no console errors; no "NaN", "undefined" or "null" in the page text.

## Live PSI check, 2026-11-14 (automated, by the build agent, for R05)
Done with a one-off Python script that does not use `pipeline/*.mjs` (its own CSV parsing and unit conversion).
- **Records.** All 24 records re-fetched from `https://psi.nasa.gov/geode-py/ws/repo/investigations/<ID>`. Compared with the app (title, DOI, start and end dates, publication count, table file names) and with the snapshot in `pipeline/raw/`: everything matches. The only differences are formats (PSI writes dates as MM-DD-YYYY, empty strings where the app has null, `totalFileSize` as a float) and one display choice: the app shows "ACME Flame Design" where PSI's acronym is "ACME/Flame Design". No record content has changed since the snapshot. Latest `modifiedDate`: PSI-117, 09-Jun-2026 (version 2).
- **Tables.** The five tables below were downloaded again: each is byte-identical (sha256) to `pipeline/raw/manifest.json`.
- **Ranges.** 18 O2 and pressure values recomputed from those tables: all equal the app's values. FLEX minimum pressure is 70.2 kPa only after dropping the one row recorded as 0 mmHg (test 114), as logged in DATA_CLEANING_LOG.md.
- **Links.** All 40 external URLs in the app code and data, plus the 3 in README / project page / slides, return HTTP 200. All 242 DOIs in the data are registered (doi.org handle API). Note: PSI's web pages return 200 for any ID (a single-page app), so the record check above via the API is what confirms each PSI link points at a real record.
- **Summaries.** Every number in the 19 summaries and "why it matters" lines appears in that record's PSI text or the app data. Review sheet for H5: `docs/SUMMARY_REVIEW.md`.

## H4: 10 fields for a person to check against the live PSI pages
The script above already agrees with every row; this is the independent human check. For each: open the PSI record, go to its files, open the "Experimental table" CSV, sort or filter the column and confirm the value. Then initial the row and add the investigation to `"fields"` in `pipeline/reviews.json` (`"PSI-25": { "by": "SS", "date": "2026-11-15" }`), which sets `verified.by/date` in the app data.

| # | Record | Table, column | Value in app | Conversion | Checked by / date |
|---|---|---|---|---|---|
| 1 | [PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) BASS-II | BASS-II.csv, "Calibrated initial O2 % by vol" min | 13.6 % | none | |
| 2 | PSI-25 BASS-II | same column, max | 22.2 % | none | |
| 3 | [PSI-69](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69) FLEX | FLEX.csv, "O initial ambient composition; mole fraction" max | 34 % | 0.34 × 100 | |
| 4 | PSI-69 FLEX | "Ambient pressure; mmHg" max | 309.3 kPa | 2319.9 mmHg × 0.13332 | |
| 5 | [PSI-39](https://psi.nasa.gov/physci/repo/data/investigations/PSI-39) CFI | CFI.csv, "Pressure" min | 50.7 kPa | "0.5 atm" × 101.325 | |
| 6 | PSI-39 CFI | "Pressure" max | 506.6 kPa | "5 atm" × 101.325 | |
| 7 | [PSI-10](https://psi.nasa.gov/physci/repo/data/investigations/PSI-10) ACME Flame Design | Flame Design_Normal Flame.csv, "XO2 (init)" max | 40 % | × 100 | |
| 8 | PSI-10 ACME Flame Design | "pinit (atm)" max | 131.4 kPa | × 101.325 | |
| 9 | [PSI-159](https://psi.nasa.gov/physci/repo/data/investigations/PSI-159) ACME CFI-G | CFI-G_Normal Flames.csv, "XO2 before test" max | 40 % | × 100 | |
| 10 | PSI-159 ACME CFI-G | "approx p (bar)" min | 50.7 kPa | × 100 | |

## Still to do by a person
- [ ] H4: the 10 rows above.
- [ ] H5: read all 19 summaries in `docs/SUMMARY_REVIEW.md` (includes role and fuel-class labels) and add approvals to `pipeline/reviews.json`.
- [ ] Click through the external links on the deployed site once (script found none broken; this catches pages that load but show the wrong thing).
