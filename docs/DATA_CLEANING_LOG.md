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

## Environment presets added 2026-11-14 (post-deploy)
Added two presets from NASA's proposed Exploration Atmosphere table (NTRS 20220011152): "NASA Exploration Atmosphere" (8.2 psia, 34% O2) and a second point from the same table (10.2 psia, 26.5% O2). Both are marked `verified` with a source URL, per `claude/context-limitations.md` B7. Also updated the spacesuit preset's note to flag that NASA's 2022 chamber tests of simulated EVAs used 85% O2 at the same 4.3 psi, rather than the challenge statement's 100% O2 (the ranker still uses 100%, since that's what the challenge statement specifies; the note is informational).

The "combined" gap text for these two new presets (how many of the 1,138 run points are near the preset) was summed directly from the rounded display bins in `pipeline/build_data.mjs`'s `BINS` constant, not from the original full-resolution tables like the other presets' numbers were. Spot-checking this method against `moon_base` (which has both a bin-based and an original full-resolution count) reproduced the same number (23) for its only matching investigation, but reproduced the `iss` preset's count as 392 instead of the original 387 — a small rounding-boundary effect at the edges of the +/-5 O2 / +/-10 kPa window. The six original presets keep their original, more precise numbers; only the two new presets use the bin-based method, since there is no more-precise number to compare against for them.

## Publication lists populated 2026-11-14 (post-deploy)
Found that `publications` was hardcoded to an empty array for every investigation — the Explorer drawer only ever showed a bare count ("N listed on the PSI record") with nothing to click through to. The actual list (title + DOI per paper) was sitting unused in the same PSI API response (`https://psi.nasa.gov/geode-py/ws/repo/investigations/<ID>` → `.publications`) that the pipeline already calls for every other field.

Fetched all 19 investigations' `publications` arrays live from psi.nasa.gov, dropped author lists (not part of our schema — `types.ts` only wants `{title, doi}`), and saved them to `pipeline/publications_data.mjs` as a `PUBLICATIONS` lookup keyed by PSI ID. `build_data.mjs` now reads from it instead of hardcoding `[]`, and a new validation check (`i.publications.length !== i.n_publications`) throws if a count ever drifts out of sync.

Totals: 325 publications across the 19 investigations (264 with a DOI, 61 without — PSI's own record has no DOI for some conference papers and internal reports; that's PSI's data gap, not ours). Every per-investigation count matched the existing `pubs:` field exactly before this was written, confirming the fetch was complete and not missing any entries.

Updated `app/src/pages/Explorer.tsx` so the detail drawer renders the actual list (collapsible `<details>`, titles linked to `doi.org/<doi>` where a DOI exists, plain text with "(no DOI on record)" where it doesn't) instead of just the count.

## SAFFIRE-II 1-g vs. microgravity panel added 2026-11-14 (stretch item, built)
Built the stretch item flagged in `claude/context-limitations.md` B3 ("the app does not compare to the standard except via the SAFFIRE-II columns (stretch)"). PSI-99 (SAFFIRE-II) is the one PSI investigation whose raw table records burn length for the *same* solid-fuel samples in both microgravity and normal gravity — this was already noted in the investigation's own summary text ("The data table lists burn lengths in microgravity next to normal-gravity results") but was never surfaced in the UI.

Downloaded the actual CSV (`PSI-99_Experimental table_SAFFIRE-2.csv`, via the same signed-URL download pattern used elsewhere in this pipeline) and transcribed the 9 real burn samples (excluding 2 pre-test camera-calibration rows and 4 footnote rows, all present in the raw file but not burn data) into a `GRAVITY_COMPARISON` constant in `build_data.mjs`, attached to PSI-99's investigation record as an optional `gravity_comparison` field. A validation check confirms the row count stays at 9.

What the data actually shows, factually: for the silicone samples, microgravity mostly self-extinguished (~0 cm burned) while 1-g burned to completion or partway; for PMMA, microgravity left ~10 cm of visible damage out of 29 cm while 1-g consumed the sample completely; for cotton-fiberglass (SIBAL), both microgravity and 1-g burned the full sample. In other words, for these 9 samples 1-g burned equal to or more extensively than microgravity in every case except where they matched — this is the opposite direction from the BASS-II ignition-threshold finding cited in B3 (some materials ignite at *lower* O2 in microgravity), and the two findings measure different things (ignition threshold vs. burn extent at a fixed O2). The panel's caveat text makes clear this is shown for context only, not as a general claim about how materials behave below 1 g, and links to the exact source file.

Rendered in `app/src/pages/Explorer.tsx`'s detail drawer, visible only for PSI-99 (SAFFIRE-II), as a 5-column table (sample, material, O2, microgravity burn, 1-g burn) below the caveat text.
