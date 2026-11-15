# Data cleaning log

Snapshot: psi.nasa.gov, 2026-11-14. 24 records fetched (19 ranked, 5 related modeling studies) and 22 "Experimental table" CSV files. No fetch errors.

## How the data was read
Since R04 (2026-11-14) the pipeline is reproducible from files in the repo:
1. `node pipeline/fetch.mjs` downloads each record from `https://psi.nasa.gov/geode-py/ws/repo/investigations/<ID>`, keeps the fields listed in PLAN.md P1.2 (`pipeline/raw/<ID>.json`), and downloads every file in its `experimentalTable` list through the signed-URL endpoint (`pipeline/raw/tables/`). Requests are 500 ms apart with retries; files already on disk are not downloaded again (`--force` refreshes). `raw/manifest.json` records the source URL, fetch time and sha256 of each file. `.gitattributes` marks `pipeline/raw/**` as binary so line endings never change.
2. `pipeline/tables.mjs` parses the CSVs using the rules in the table below. A data row is any row with at least one non-empty cell (the CFI-G inverse table has 1,015 lines, of which 154 are data; the rest are blank padding).
3. `pipeline/build_data.mjs` takes DOI, dates, license, file size, publications and table list from the records and ranges, run counts and run points from the parsed tables. It checks each file against its sha256, checks that the tables it parsed are exactly the ones the record lists, checks that every text-derived value quotes the record verbatim, and compares every computed number with `pipeline/expected.json`.

Earlier versions copied these values by hand from a browser session. `expected.json` was created from those hand-copied values, so the first reproducible build is a check of the hand copy. Result: all 19 run counts, 21 table-derived ranges, 161 display bins, 1,138 run points and the near/O2 run counts reproduced exactly, except two corrections (now in `expected.json`):
- PSI-10 pressure max is 304.7 kPa, not 304.8. The hand copy rounded the largest `pinit` (3.0076 atm) to 3.008 before converting.
- "NASA Exploration Atmosphere" preset: 28 CFI-G runs are near it, not 29 (total 30, not 31). The hand count was summed from rounded display bins (see the 2026-11-14 preset note below); counts now always come from full-resolution rows.
Publication lists now come straight from the records (`pipeline/publications_data.mjs` was removed). Titles are HTML-entity-decoded and whitespace-collapsed; this changed one title (a double space removed). Modeling-study DOIs also come from the records.

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
| PSI-10 Flame Design (2 tables) | 207 + 120 | Normal table only for conditions: XO2 (init) 0.198 to 0.400; pinit (atm) 0.932 to 1.297 (94.4 to 131.4 kPa) | Inverse table not used for ambient O2 or pressure (R01, below). 11 inverse rows have "RAMP" or "LOW O2" instead of a number. Run points: 207 normal. |
| PSI-159 CFI-G (2 tables) | 179 + 154 (inverse file has 1,015 lines; the rest are blank) | Normal table only for conditions: XO2 before test 0.18 to 0.40; approx p (bar) 0.507 to 3.04 | Inverse table not used for ambient O2 or pressure (R01, below). Run points: 179 normal. |
| PSI-21 CLD Flame, PSI-22 E-FIELD | 32 each | fuel only | No oxygen or pressure columns. Sealed chamber, so no cabin assumption. |
| PSI-23 s-Flame | 18 | "Atmosphere*": "~21% O2 ..." to "~30% O2 ..." | Approximate values: confidence medium. |
| PSI-107 SPICE | 469 | "Air Rate (cm/s)": -5.92 to 85.28 | 8 rows are negative (-0.28, -5.92). Kept as recorded. Record text says 5.4 to 65 cm/s. |
| PSI-106 SLICE | 12 | fuel only | Run log. |

## Inverse flames are not ambient atmospheres (R01, 2026-11-14)
PSI-10 and PSI-159 each have a normal-flame and an inverse-flame table. In a normal flame, fuel flows from the burner into a chamber of O2 + N2, and XO2 is the chamber's oxygen fraction. In an inverse flame it is the other way round: the chamber holds fuel diluted in N2 (columns "XC2H4 initial", "Xf before test") and XO2 is the oxygen fraction of the oxidizer stream from the burner. The record text says the studies ran "normal and inverse convection directions". So inverse-flame XO2 (up to 0.85) is not an atmosphere a crew could breathe or a material could burn in.

Earlier builds mixed both tables, so the app showed atmospheres up to 85% O2, low-pressure tests down to 43 kPa (all of which were inverse flames), and 83 runs at 30% O2 or more and 75 kPa or less. Now `tables.mjs` takes the ambient O2 and pressure ranges from the normal-flame tables only and tags every point with `flame_type`; `build_data.mjs` leaves inverse points out of the evidence map bins and all coverage counts. The inverse rows still count toward each table's row total (`n_runs`), and their oxidizer-stream ranges are kept in the parsed output (`TABLES[id].inverse`) for a later labeled view.

Effect: run points 1,138 to 875 (263 inverse removed: 109 + 154). Flame Design 19.8 to 40% O2 at 94.4 to 131.4 kPa (was 19.8 to 85% at 43 to 304.7). CFI-G 18 to 40% at 50.7 to 304 kPa (was 12 to 85% at 49.5 to 331). Highest O2 in any table is now 40% (ACME BRE, Flame Design, CFI-G). Runs at 30% O2 or more and 75 kPa or less: 37 (CFI-G 20, FLEX 17), was 83. Near the station cabin: Flame Design 71 (was 74), CFI-G 35 (was 44). Near the NASA Exploration Atmosphere: CFI-G 19 (was 28), Flame Design 0 (was 2). The two "why it matters" lines that cited very high oxygen and low pressure were rewritten.

## Assumptions
- Cabin pressure (101.3 kPa, low confidence, labeled "assumed") is applied only to experiments open to cabin or module air: MSG glovebox (BASS, BASS-II, SPICE, SLICE, SAME, SAME-R), DAFT, and Saffire in Cygnus.
- Cabin oxygen (21%, low confidence, labeled "assumed"), added 2026-11-14 for R02: applied to the same cabin-air experiments when the table has no O2 column and the record does not say ambient oxygen was changed: BASS, SAFFIRE-III, SAME, SAME-R, DAFT, SPICE, SLICE (checked against each record's objective, approach and hypothesis; SLICE diluted the fuel, not the air). BASS-II, SAFFIRE-I and SAFFIRE-II use their tabulated O2. Sealed-chamber studies without an O2 column (ACME CLD Flame, E-FIELD) stay unrecorded. Sealed-chamber experiments (FLEX, FLEX-2, CFI, all ACME) use the table value or "not recorded".
- All ranked records are "Microgravity Investigation", so gravity = 0 g.
- n_runs is the number of data rows in the experimental table unless noted above.
- Run points on the evidence map are grouped to the nearest 1% O2 and 5 kPa. Inverse-flame runs are not run points (see R01 above).

## Excluded
PSI-108 (STDCE-1) and PSI-181 (solder study) appear in the "combustion" search but are not combustion investigations.

## Environment presets added 2026-11-14 (post-deploy)
Added two presets from NASA's proposed Exploration Atmosphere table (NTRS 20220011152): "NASA Exploration Atmosphere" (8.2 psia, 34% O2) and a second point from the same table (10.2 psia, 26.5% O2). Both are marked `verified` with a source URL, per the team's review notes at the time. Also updated the spacesuit preset's note to flag that NASA's 2022 chamber tests of simulated EVAs used 85% O2 at the same 4.3 psi, rather than the challenge statement's 100% O2 (the ranker still uses 100%, since that's what the challenge statement specifies; the note is informational).

The "combined" gap text for these two new presets (how many of the 1,138 run points are near the preset) was summed directly from the rounded display bins in `pipeline/build_data.mjs`'s `BINS` constant, not from the original full-resolution tables like the other presets' numbers were. Spot-checking this method against `moon_base` (which has both a bin-based and an original full-resolution count) reproduced the same number (23) for its only matching investigation, but reproduced the `iss` preset's count as 392 instead of the original 387 — a small rounding-boundary effect at the edges of the +/-5 O2 / +/-10 kPa window. The six original presets keep their original, more precise numbers; only the two new presets use the bin-based method, since there is no more-precise number to compare against for them.

## Publication lists populated 2026-11-14 (post-deploy)
Found that `publications` was hardcoded to an empty array for every investigation — the Explorer drawer only ever showed a bare count ("N listed on the PSI record") with nothing to click through to. The actual list (title + DOI per paper) was sitting unused in the same PSI API response (`https://psi.nasa.gov/geode-py/ws/repo/investigations/<ID>` → `.publications`) that the pipeline already calls for every other field.

Fetched all 19 investigations' `publications` arrays live from psi.nasa.gov, dropped author lists (not part of our schema — `types.ts` only wants `{title, doi}`), and saved them to `pipeline/publications_data.mjs` as a `PUBLICATIONS` lookup keyed by PSI ID. `build_data.mjs` now reads from it instead of hardcoding `[]`, and a new validation check (`i.publications.length !== i.n_publications`) throws if a count ever drifts out of sync.

Totals: 325 publications across the 19 investigations (264 with a DOI, 61 without — PSI's own record has no DOI for some conference papers and internal reports; that's PSI's data gap, not ours). Every per-investigation count matched the existing `pubs:` field exactly before this was written, confirming the fetch was complete and not missing any entries.

Updated `app/src/pages/Explorer.tsx` so the detail drawer renders the actual list (collapsible `<details>`, titles linked to `doi.org/<doi>` where a DOI exists, plain text with "(no DOI on record)" where it doesn't) instead of just the count.

## SAFFIRE-II 1-g vs. microgravity panel added 2026-11-14 (stretch item, built)
Built PLAN.md stretch item 1 (the app did not compare microgravity with the 1-g standard except via the SAFFIRE-II columns). PSI-99 (SAFFIRE-II) is the one PSI investigation whose raw table records burn length for the *same* solid-fuel samples in both microgravity and normal gravity — this was already noted in the investigation's own summary text ("The data table lists burn lengths in microgravity next to normal-gravity results") but was never surfaced in the UI.

Downloaded the actual CSV (`PSI-99_Experimental table_SAFFIRE-2.csv`, via the same signed-URL download pattern used elsewhere in this pipeline) and transcribed the 9 real burn samples (excluding 2 pre-test camera-calibration rows and 4 footnote rows, all present in the raw file but not burn data) into a `GRAVITY_COMPARISON` constant in `build_data.mjs`, attached to PSI-99's investigation record as an optional `gravity_comparison` field. A validation check confirms the row count stays at 9.

What the data actually shows, factually: for the silicone samples, microgravity mostly self-extinguished (~0 cm burned) while 1-g burned to completion or partway; for PMMA, microgravity left ~10 cm of visible damage out of 29 cm while 1-g consumed the sample completely; for cotton-fiberglass (SIBAL), both microgravity and 1-g burned the full sample. In other words, for these 9 samples 1-g burned equal to or more extensively than microgravity in every case except where they matched — this is the opposite direction from the BASS-II ignition-threshold finding cited in B3 (some materials ignite at *lower* O2 in microgravity), and the two findings measure different things (ignition threshold vs. burn extent at a fixed O2). The panel's caveat text makes clear this is shown for context only, not as a general claim about how materials behave below 1 g, and links to the exact source file.

Rendered in `app/src/pages/Explorer.tsx`'s detail drawer, visible only for PSI-99 (SAFFIRE-II), as a 5-column table (sample, material, O2, microgravity burn, 1-g burn) below the caveat text.

## Key findings and the SAFFIRE-II comparison (R03, 2026-11-14)
- `reference/researchers-guide-2015.txt`: text of NASA's "A Researcher's Guide to: ISS Combustion Science" (NP-2015-10-034-JSC), extracted with `pdftotext` in reading order, one `=== page N ===` marker per page (PDF page = printed page). The header gives the source URL and the PDF's sha256. This also covers REVIEW_ISSUES R33.
- `pipeline/findings.json`: 11 findings for 7 investigations (BASS-II, BASS, SAFFIRE-I, SAFFIRE-II, SAME, SAME-R, FLEX), written with Claude Code. 7 quote the Guide with a page number; 4 are read from table cells (SAFFIRE-I, SAFFIRE-II). `build_data.mjs` fails if a Guide quote is not on its page, a table quote is not in a cell, a listed cell does not hold exactly the stated value, or a number in the finding text is not in its quote or cells.
- Attribution: the Guide (2015) credits "the BASS experiment currently running on the ISS". BASS (PSI-26) ended in 2013 and BASS-II (PSI-25) used the same hardware and flew in 2014, so the BASS findings are shown on both records with a note. The microgravity smoke-particle statement (Guide p. 35) is about the research area, not SAME specifically, so it is labeled "NASA context".
- No finding for DAFT, SAFFIRE-III or the non-fire-safety studies: neither source states a result for them.
- SAFFIRE-II comparison panel: rows are now read from the table instead of typed by hand. The hand copy had sample 2-7 wrong (it gave the 1-g burn as "PMMA consumed; Nomex not ignited"; the table's 1-g cell reads "~ 0 (Nomex)" and note 2 belongs to the microgravity cell "5 cm & 0 (note 2)") and added words not in the table ("self-extinguished", "29 cm"). Cells are now shown as written, including PSI's thickness entries "037 mm" (probably 0.37 mm) and "See Fig. 5", and the table's four notes. The microgravity column is headed "?-g" in the file itself; the µ was lost before the file reached PSI.
- `PSI-69_Experimental table_FLEX.csv` is not valid UTF-8 (one Windows-1252 en dash, byte 0x96). The parser reads it as UTF-8, which only affects that text cell; no numeric column is affected.

## More findings and the AI layer (R06, 2026-11-14)
- `pipeline/findings.json` now has 20 findings for 11 investigations. New source type `psi_text`: the quote must appear word for word (after whitespace and HTML-entity clean-up) in the named field (`objective`, `approach`, `hypothesis`, `researchImpacts`) of the cached record in `pipeline/raw/`. New kinds: `record_stated` (the record states a result) and `limitation` (the record states a limit of the data).
- Added from record text: ACME BRE (PSI-20) research impacts, three findings (steady burning with no airflow; continued at elevated O2 but self-extinguished at 21%; suggestion to use the cone-calorimeter Test 2, which the team calls preliminary). SAME-R (PSI-101) objective: the first SAME flight's TEM grids were all contaminated; shown on SAME and SAME-R as a limitation. FLEX (PSI-69) approach: some extinction droplet sizes were too small to measure (limitation).
- Added from the Guide: p. 34, FLEX cool flames can burn for a prolonged time; p. 31, the solid-fuel flammability minimum near 10 cm/s and upstream flame spread at low flow (NASA states both for solids in general, so they are labeled "NASA context" and shown on BASS, BASS-II and the three Saffire flights); p. 32, gas-jet flames start smoking at different conditions in low gravity (general statement; shown on SPICE and SLICE, which the Guide pp. 13-14 describes as the ISS gas-jet soot studies).
- Considered and left out: E-FIELD's "revealing ion-driven convection effects" (approach text; too thin to state as a finding); DAFT's Guide mention (says what it measured, not what it found).
- Findings now have stable IDs (`F1`, `F2`, …, in file order) and are also written to `app/public/data/findings.json`, so AI text can cite them. Only append new findings: reordering or deleting one shifts the IDs, and a citation could then point to a different finding without the check noticing (it fails only if the numbers or names no longer match).
- AI text (briefs, Q&A, related studies) is checked by `pipeline/ai_build.mjs`; see REVIEW_ISSUES R06 and `docs/AI_PLAN.md`. The number check ignores digits inside formulas (O2, CO2, SF6), and a cited investigation contributes only its structured data and its ranking explanation, not its full record text, so a number cannot pass just because it appears somewhere in the record.
