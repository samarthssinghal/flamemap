# Data cleaning log

Snapshot: psi.nasa.gov, 2026-11-14. 24 records fetched (19 ranked, 5 related modeling studies) and 22 "Experimental table" CSV files. No fetch errors.

## How the data was read
The build machine could not reach psi.nasa.gov, so the record JSON and the CSV tables were fetched and parsed in a browser session on psi.nasa.gov. The resulting ranges, counts and binned run points were copied into `pipeline/build_data.mjs`. The build script checks the copied run bins against the per-investigation row counts computed in the browser and fails if they differ. To make this fully reproducible, run the console snippet in PLAN.md Appendix E, save `psi_bundle.json`, and port the parsing into the pipeline.

## Unit conversions
mmHg x 0.133322 = kPa; atm x 101.325 = kPa; bar x 100 = kPa; mole fraction x 100 = % by volume.

## Per table
| Table | Rows | What was used | Decisions |
|---|---|---|---|
| PSI-25 BASS-II | 129 | "Calibrated initial O2 % by vol": 13.6 to 22.2 | "Fan display" and "Air display" hold instrument settings and free text, not cm/s: not mapped. Airflow upper bound (40 cm/s) taken from record text. Pressure not in table: cabin assumed. |
| PSI-26 BASS | 122 | fuel only | Run log. Airflow upper bound from text. |
| PSI-98 SAFFIRE-1 | 4 (2 burn samples, 2 flow-visualization rows) | "Percent O2": "21.5 - 21.7", "~ 21.5"; "Air Flow (cm/s)": 20 | n_runs = 2. |
| PSI-99 SAFFIRE-2 | 15 (9 samples, 2 flow-visualization rows, 4 note rows) | "Percent O2 (Note 1)": 21.5 to 22.1 (derived from CO2, per the table note) | n_runs = 9. Table lists 20 cm/s; record text says 20 or 30 cm/s, so the range 20 to 30 is used, marked "from record text". |
| PSI-100 SAFFIRE-3 | 2 | "Air Flow": "30 cm/s" | No O2 column. |
| PSI-102 SAME | 8 | "Air Flow (cm/s)": 5 to 10 (4 rows filled) | |
| PSI-101 SAME-R | 109 | "Inlet velocity (cm/s)": 0 to 8.1 | |
| PSI-47 DAFT | 2 | none | Session log only; no combustion. |
| PSI-69 FLEX | 274 | "O initial ambient composition; mole fraction": 0.12 to 0.34; "Ambient pressure; mmHg": 526.3 to 2319.9 | One row has pressure 0: dropped from pressure and from the run points (273 points). The "CO" column is read as CO2 (the record names CO2 as a suppressant). |
| PSI-68 FLEX-2 | 8 | Cells list several values ("0.17; 0.21;0.25; 0.3", "0.5; 1.0; 1.5; 2.0; or 3.0", "0.1 - 5") | Used for ranges only, not for run points. |
| PSI-39 CFI | 87 | "Oxygen": 0.17 to 0.21 (mole fraction); "Pressure": "0.5 atm" to "5 atm" | Units decided from the cell text. |
| PSI-20 ACME BRE | 18 | "Oxygen Conc (percent)": lists such as "21; 26.5; 40"; two cells read "3400%" and "2100%" | The two cells are read as 34 and 21 (spreadsheet formatting). Table note: chamber pressure varied but is not listed, so pressure = not recorded. |
| PSI-10 Flame Design (2 tables) | 207 + 120 | XO2 (init) / XO2: 0.198 to 0.850; pinit (atm): 0.425 to 3.008 | 11 inverse-flame rows have "RAMP" or "LOW O2" instead of a number: excluded from oxygen range and run points (316 points). |
| PSI-159 CFI-G (2 tables) | 179 + 154 | XO2: 0.12 to 0.85; approx p (bar): 0.495 to 3.310 | 333 points. |
| PSI-21 CLD Flame, PSI-22 E-FIELD | 32 each | fuel only | No oxygen or pressure columns. Sealed chamber, so no cabin assumption. |
| PSI-23 s-Flame | 18 | "Atmosphere*": "~21% O2 ..." to "~30% O2 ..." | Approximate values: confidence medium. |
| PSI-107 SPICE | 469 | "Air Rate (cm/s)": -5.92 to 85.28 | 8 rows are negative (-0.28, -5.92). Kept as recorded. Record text says 5.4 to 65 cm/s. |
| PSI-106 SLICE | 12 | fuel only | Run log. |

## Assumptions
- Cabin pressure (101.3 kPa, low confidence, labeled "assumed") is applied only to experiments open to cabin or module air: MSG glovebox (BASS, BASS-II, SPICE, SLICE, SAME, SAME-R), DAFT, and Saffire in Cygnus. Sealed-chamber experiments (FLEX, FLEX-2, CFI, all ACME) use the table value or "not recorded".
- All ranked records are "Microgravity Investigation", so gravity = 0 g.
- n_runs is the number of data rows in the experimental table unless noted above.
- Run points on the evidence map are grouped to the nearest 1% O2 and 5 kPa.

## Excluded
PSI-108 (STDCE-1) and PSI-181 (solder study) appear in the "combustion" search but are not combustion investigations.
