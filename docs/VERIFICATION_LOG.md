# Verification log

## Done on 2026-11-14 (automated, by the build agent)
- Ranker: 11 unit tests pass, including hand-computed cases (PLAN.md section 5).
- Hand check: lunar habitat + prevention, BASS-II. O2 gap 7.8 / 79 = 0.0987; pressure gap 31.0 / 71.7 = 0.4324; gravity 0.166; task 0; airflow not set. (0.30 x 0.0987 + 0.20 x 0.4324 + 0.15 x 0.166) / 0.90 = 0.1567, match = 84. The app shows 84.
- Range cross-check: the ranges below were computed twice in the browser by two separate code paths (a column profiler and the mapping code) and agree: BASS-II O2 13.6 to 22.2; SAME-R flow 0 to 8.1; SAME flow 5 to 10; FLEX O2 0.12 to 0.34 and pressure max 2319.9 mmHg (309.3 kPa); CFI O2 0.17 to 0.21; Flame Design XO2 0.198 to 0.850 and pinit 0.425 to 3.008 atm (43.0 to 304.8 kPa; corrected to 3.0076 atm = 304.7 kPa when R04 recomputed from the raw table, see DATA_CLEANING_LOG.md); CFI-G XO2 0.12 to 0.85 and pressure 0.495 to 3.310 bar; SPICE air rate -5.92 to 85.28.
- Run bins: the build fails unless the copied bins sum to the browser-computed counts per investigation (129, 273, 87, 316, 333; total 1,138). It passes.
- Summaries: word limits enforced by the build (80 and 35 words).
- Pages rendered in headless Chrome at 1280 px and 390 px: no console errors; no "NaN", "undefined" or "null" in the page text.

## Still to do by a person
- [ ] Check 10 fields against the live PSI pages (suggested: the O2 and pressure ranges of PSI-25, 69, 39, 10, 159).
- [ ] Read all 19 summaries against their PSI records and set `human_reviewed` in the build script.
- [ ] Click every external link on the deployed site.
- [ ] Confirm the role and fuel-class labels.
