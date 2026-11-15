# MASTER EXECUTION PLAN — "Flame in Freefall" (NASA Space Apps 2026)

Product name (working): **FlameMap — Fire-Safety Evidence Ranker for Crewed Space Environments**
Team: 2 people, virtual event, US Central time.
**Hard deadline: Sunday Nov 15, 2026, 11:59 PM Central. Target submit: 10:00 PM. Feature freeze: 5:00 PM Sunday.**

This file is written to be executed by a coding agent (Claude Code) inside one git repository. Put it at the repo root as `PLAN.md`.

---

## 0. RULES FOR THE EXECUTING AGENT (read first, obey always)

1. **Work in task order.** Tasks have IDs (P0.1, P1.1 ...). Do not skip ahead unless a task says it can run in parallel. After each task: run its acceptance check, then `git add -A && git commit -m "<task id>: <summary>"`.
2. **Never invent data.** Every number shown in the app must come from (a) a PSI table column, (b) PSI record text, (c) a publication listed on the PSI record, or (d) a preset value with a cited source. If a value is unknown, store `null` and render "not recorded". Never render unknown as 0.
3. **Every extracted field carries provenance**: `source.type`, `source.ref`, `confidence`. No provenance = do not include the value.
4. **Do not change the data contracts in Section 4** without writing the change to `docs/DECISIONS.md` and updating both the pipeline and the app in the same commit.
5. **When blocked for more than 15 minutes** on a task, use the task's "If blocked" fallback. If there is none, write the problem to `docs/BLOCKERS.md`, tell the human, and move to the next task that does not depend on it.
6. **Do not download PSI raw data** (videos, images; hundreds of GB). Only JSON metadata and the "Experimental table" CSV files.
7. **Be polite to psi.nasa.gov**: at most 2 requests per second, cache every response on disk, never re-download a cached file.
8. **Scope discipline.** Build only what is in this plan. Stretch items (Section 10) are allowed only after gate G3 passes.
9. **Wording discipline.** The app is a *screening and research-navigation aid*. Never write that it predicts fire risk, certifies safety, or gives NASA guidance. The disclaimer in Section 7.6 must appear in the app footer and About page.
10. **Log as you go**: `docs/DECISIONS.md` (choices made), `docs/DATA_CLEANING_LOG.md` (every conversion, dropped row, assumption), `docs/VERIFICATION_LOG.md` (spot-checks).
11. **Human-only steps** are marked **[HUMAN]**. Stop and ask the human; do not attempt them.
12. Where this plan says "verify", it means: find a NASA source (nasa.gov, ntrs.nasa.gov, psi.nasa.gov), record the URL, and only then use the value. If you cannot verify, mark the value `"status": "nominal_assumption"` and the UI must show the label "assumption".

---

## 1. WHAT WE ARE BUILDING AND WHY IT CAN WIN

**Challenge ask (paraphrased):** an interactive, AI-powered, web-based dashboard that summarizes, ranks and interprets NASA microgravity combustion investigations from the Physical Science Informatics (PSI) database, to give fire-safety insight for crewed spacecraft, stations, Moon/Mars bases and rovers. Audience: professors, students, aerospace researchers, engineers.

**Our answer in one sentence:** Pick a crewed environment and a fire-safety task; FlameMap ranks every PSI combustion investigation by how closely its *actually tested conditions* match that environment, shows the math per variable, and flags where NASA has **no evidence at all** (for example partial gravity, or solid fuels at high oxygen and low pressure).

**The five judging criteria and how each feature serves them**

| Criterion | What we do for it |
|---|---|
| Relevance | Directly implements "summarize, rank, interpret"; covers the statement's suggested capabilities (find relevant investigations; extract data for modeling via export; highlight research for fire-safety controls; Earth applications panel) |
| Validity | Real PSI data only; provenance on every field; transparent arithmetic scoring with unit tests; documented cleaning log; explicit limits and disclaimer |
| Creativity | "Distance to condition" breakdown; Evidence Map showing tested conditions vs. where future habitats sit; computed gap flags |
| Impact | Shows researchers where the evidence gaps are for Artemis-class atmospheres; export for modelers; Earth spin-off panel |
| Presentation | One clear 30-second flow; 7 slides; clean UI; project page text prepared in this plan |

**Hero moment for the demo:** switch the environment from "ISS" to "Lunar surface habitat". The ranking reorders, the environment marker on the Evidence Map jumps away from the cluster of tested runs, and a gap banner appears: "No PSI combustion investigation was run at partial gravity."

---

## 2. HARD CONSTRAINTS

- Submission closes Sun Nov 15, 11:59 PM local time; the "Submit for Judging" button must be clicked on the team Project tab. Late or unsaved = not judged.
- Reported limits: demo **30 seconds**, slides **7**. Exceeding them makes the project ineligible. **[HUMAN] H1: open the live Project Submission Guide and confirm exactly what each limit applies to, plus all required form fields. Write the answers into `docs/SUBMISSION_REQUIREMENTS.md`.**
- Must use at least one NASA data source and state it specifically: PSI (psi.nasa.gov).
- AI use must be disclosed (Section 9.3).
- PSI requires citing investigations by DOI. The app must have a Sources page listing every DOI used.
- All team members must be registered, on the team page, and joined to a local/virtual event. **[HUMAN] H2.**

---

## 3. STACK AND REPO LAYOUT

- **App:** Vite + React + TypeScript. Styling: Tailwind CSS (follow the current official Tailwind + Vite install steps; if setup takes more than 10 minutes, use one plain `src/styles.css`). Charts: Recharts. Routing: `react-router-dom` with **HashRouter** (works on any static host). Tests: Vitest.
- **No backend. No runtime API calls.** All data is static JSON in `app/public/data/`. The ranker runs in the browser.
- **Pipeline:** Python 3.10+, `requests`, `pandas`. Output is the static JSON the app loads.
- **Hosting:** GitHub Pages via GitHub Actions (public repo; the repo link also goes in the submission). Vite `base: './'`.

```
repo/
  PLAN.md
  README.md
  pipeline/                # AS BUILT (Node, see "Phase 1 as built"); original Python plan in git history
    fetch.mjs              # PSI JSON + experimental table CSVs -> pipeline/raw/ (cached, sha256 manifest)
    tables.mjs             # CSV parsing, unit conversions, cleaning rules -> ranges, counts, run points
    build_data.mjs         # classification, text-derived fields, summaries, environments, gaps, insights, validation
    expected.json          # regression snapshot of every computed number (build fails on a difference)
    raw/                   # committed snapshot: <ID>.json, tables/*.csv, manifest.json
    findings.json          # key findings with quote / record text / table cells; checked by build_data.mjs (R03, R06a)
    reviews.json           # human sign-offs: summaries (H5) and field checks (H4)
    ai_build.mjs           # AI-text check (R06d): runs ranker.ts for every view, checks every AI sentence, writes review sheet
    ai/                    # context.md/.json (AI writer input, generated), briefs.json, qa.json, related.json, meta.json
  reference/               # challenge text, NASA resources, Researcher's Guide text (researchers-guide-2015.txt)
  app/
    public/data/           # investigations.json runs.json environments.json gaps.json insights.json earth_applications.json
                           # sources.json findings.json briefs.json qa.json related.json
    src/
      lib/ranker.ts  lib/ranker.test.ts  lib/types.ts  lib/data.ts  lib/export.ts
      pages/  Rank.tsx  EvidenceMap.tsx  Explorer.tsx  Ask.tsx  Compare.tsx  About.tsx   (Earth panel lives in About)
      components/ EnvPicker.tsx  Findings.tsx  Brief.tsx  Cites.tsx
  docs/
    DECISIONS.md  DATA_CLEANING_LOG.md  VERIFICATION_LOG.md  BLOCKERS.md  REVIEW_ISSUES.md  AI_PLAN.md
    SUBMISSION_REQUIREMENTS.md  DEMO_SCRIPT.md  SLIDES.md  PROJECT_PAGE.md  QA_CHECKLIST.md
    HUMAN_TASKS.md  SUMMARY_REVIEW.md  AI_TEXT_REVIEW.md
  .github/workflows/deploy.yml
```

**Two-person parallel split (two agent sessions, no file overlap):**
- **Track A (data):** everything under `pipeline/` and `app/public/data/`. Tasks P1, P4, part of P7.
- **Track B (app):** everything under `app/src/`. Tasks P2, P3, P6, P8. Track B starts against the mock data pack (if the team has `mock-data.zip`, unzip it into `app/public/data/`), then switches to real files when Track A lands them.
- **Shared, do first together:** P0. Merge points are the gates in Section 11.

---

## 4. DATA CONTRACTS (authoritative)

If a mock data pack is already in `app/public/data/`, open its `investigations.json` and `environments.json` first. This contract was written to match that pack's README. If a field *name* differs, keep the mock pack's name, and record it in `docs/DECISIONS.md`.

### 4.1 `investigations.json` — array, one object per ranked investigation
```json
{
  "psi_id": "PSI-25",
  "acronym": "BASS-II",
  "title": "Burning and Suppression of Solids - II",
  "doi": "10.60555/4qc4-de67",
  "url": "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25",
  "license": "CC0-1.0",
  "project_type": "flight",
  "platform": "International Space Station (ISS)",
  "hardware": "Microgravity Science Glovebox (MSG)",
  "start_date": "2010-01-01",
  "end_date": "2022-12-31",
  "sub_research_area": "Spacecraft Fire Safety",
  "fire_safety_role": "prevention",
  "secondary_roles": ["suppression"],
  "fuel_class": "solid",
  "fuel_materials": ["..."],
  "geometry": null,
  "conditions": {
    "o2_percent":   {"min": 0, "max": 0, "unit": "%",    "source": {"type": "table_column", "ref": "PSI-25_Experimental table_BASS-II.csv :: Calibrated initial O2 % by vol"}, "confidence": "high"},
    "pressure_kpa": {"min": 101.3, "max": 101.3, "unit": "kPa", "source": {"type": "assumed_platform", "ref": "ISS cabin ambient; not recorded in the table"}, "confidence": "low"},
    "flow_cm_s":    null,
    "gravity_g":    {"values": [0], "source": {"type": "psi_text", "ref": "projectType = Microgravity Investigation"}, "confidence": "high"}
  },
  "diluents": [],
  "variables_varied": [],
  "sensors": [],
  "evidence": {"n_runs": 129, "table_files": ["..."], "data_availability": "run_table_with_conditions", "raw_data_gb": 274.6},
  "text": {"objective": "...", "approach": "...", "hypothesis": "...", "impacts": "..."},
  "summary": {"text": "...", "why_it_matters": "...", "generated_by": "AI-drafted from PSI record text", "human_reviewed": false},
  "publications": [{"title": "...", "doi": "..."}],
  "related_modeling": [{"psi_id": "PSI-62", "title": "...", "url": "..."}],
  "verified": {"by": null, "date": null}
}
```
(The numbers `0` above are placeholders showing shape only. Real values come from the pipeline.)

Enumerations:
- `fire_safety_role`: `prevention | detection | suppression | fundamental`
- `fuel_class`: `solid | liquid_droplet | gas | aerosol`
- `source.type`: `table_column | psi_text | publication | assumed_platform`
- `confidence`: `high` (table column) | `medium` (explicit number in PSI text or a publication) | `low` (assumed from platform or inferred from text)
- `data_availability`: `run_table_with_conditions | run_table_partial | run_log_only | metadata_only`
- `project_type`: `flight | ground`

### 4.2 `runs.json` — array, one object per experimental-table row that has at least one condition
```json
{"psi_id": "PSI-69", "acronym": "FLEX", "run_id": "PSI-69:17", "fuel": "heptane", "fuel_class": "liquid_droplet",
 "o2_percent": 21.0, "pressure_kpa": 101.3, "pressure_assumed": false, "flow_cm_s": null,
 "gravity_g": 0, "diluent": "N2", "source_file": "PSI-69_Experimental table_FLEX.csv", "source_row": 17}
```
(Example values show shape only.) `pressure_assumed: true` means cabin ambient was assumed; the Evidence Map draws these as hollow markers.

### 4.3 `environments.json`
```json
{
  "reference_spans": {"o2_percent": 79.0, "pressure_kpa": 71.7, "flow_cm_s": 20.0, "gravity_g": 1.0},
  "default_weights": {"o2": 0.30, "pressure": 0.20, "flow": 0.10, "gravity": 0.15, "task": 0.25},
  "environments": [ { "id": "iss", "name": "...", "o2_percent": 21.0, "pressure_kpa": 101.3, "gravity_g": 0, "flow_cm_s": null,
                      "sources": [{"field": "o2_percent", "url": "...", "status": "verified | nominal_assumption | from_challenge_statement"}], "note": "..." } ],
  "tasks": [ {"id": "prevent", "name": "Material flammability and fire prevention", "role": "prevention", "preferred_fuel_classes": ["solid"]},
             {"id": "detect",  "name": "Smoke and fire detection",                  "role": "detection",  "preferred_fuel_classes": ["aerosol", "solid"]},
             {"id": "suppress","name": "Fire suppression and extinguishment",       "role": "suppression","preferred_fuel_classes": ["liquid_droplet", "solid"]} ]
}
```
Preset values: Appendix C.

### 4.4 `gaps.json`, `insights.json` — computed by `pipeline/build_data.mjs`
```json
{"environment_id": "moon_base", "gaps": [
  {"id": "partial_gravity", "severity": "high", "text": "…", "computed_from": {"metric": "count of investigations with gravity within 0.05 g of 0.166", "value": 0}, "sources": ["PSI-25", "..."]}
]}
```
Every insight has `computed_from` (metric + value) and `sources`. No free-form claims.

### 4.5 `sources.json`
Array of `{psi_id, acronym, title, doi, url, license, citation}` for every investigation used, plus the non-PSI NASA links (Appendix D).

---

## 5. SCORING SPEC (authoritative; implement exactly)

Inputs: environment `E` (o2, pressure, flow, gravity; any may be null), task `T`, weights `W`, investigation `I`.

**Range variables** (o2_percent, pressure_kpa, flow_cm_s):
- If `I.conditions[v]` is null or `E[v]` is null → variable is **unknown**; skip it.
- Else `gap = 0` if `min <= E[v] <= max`; else `gap = min(|E[v]-min|, |E[v]-max|)`.
- `d_v = min(1, gap / reference_span[v])`.

**Gravity:** `d_g = min(1, min over g in I.gravity_g.values of |E.gravity_g - g| / 1.0)`.

**Task fit:** `role_match = 1.0` if `I.fire_safety_role == T.role`; `0.5` if `T.role` is in `I.secondary_roles`; `0.25` if `I.fire_safety_role == "fundamental"`; else `0`.
`fuel_match = 1.0` if `I.fuel_class` is in `T.preferred_fuel_classes`, else `0`.
`task_fit = 0.6*role_match + 0.4*fuel_match`; `d_task = 1 - task_fit`.

**Score:** over the set K of known components (task and gravity are always known):
`weighted_distance = sum(W_k * d_k for k in K) / sum(W_k for k in K)`
`relevance = round(100 * (1 - weighted_distance))` (0–100)
`evidence_completeness = sum(W_k for k in K) / sum(all W)` (0–1) — shown on every card as "based on N of 5 factors".

**Sort:** relevance desc, then evidence_completeness desc, then `n_runs` desc, then `psi_id`.

**Output per investigation:** `{psi_id, relevance, evidence_completeness, breakdown: [{factor, env_value, tested_min, tested_max, gap, distance, weight, status: "inside"|"outside"|"unknown", source, confidence}], flags: [...]}`.

**Per-card flags:** `"O2 above tested range by X points"`, `"pressure below tested range by X kPa"`, `"pressure assumed, not recorded"`, `"microgravity only"`, `"conditions from text, low confidence"`.

**Required unit tests (hand-computed; all must pass):**
1. O2: E=30, range 15–22 → gap 8 → d = 8/79 = 0.1013 (±0.0005).
2. O2: E=21, range 15–22 → d = 0, status "inside".
3. Pressure: E=70.3, range 101.3–101.3 → gap 31.0 → d = 31.0/71.7 = 0.4324.
4. Gravity: E=0.166, values [0] → d = 0.166. E=0.38, values [0, 1] → d = 0.38.
5. Flow: E=40, range 0–20 → gap 20 → d = 1.0 (cap). E=100 → still 1.0.
6. Unknown skip: weights default; I has o2 d=0, pressure null, flow null, gravity d=0, task d=0 → relevance 100, evidence_completeness = (0.30+0.15+0.25)/1.0 = 0.70.
7. Full example: d_o2=0.1013, d_p=0.4324, flow unknown, d_g=0.166, task_fit=1 (d=0). Weighted = (0.30*0.1013 + 0.20*0.4324 + 0.15*0.166 + 0.25*0) / 0.90 = (0.03039+0.08648+0.0249)/0.90 = 0.15752 → relevance 84.
8. Task fit: role prevention vs task prevent, fuel gas → 0.6*1 + 0.4*0 = 0.6. Fundamental + preferred fuel → 0.6*0.25+0.4 = 0.55.
9. Sorting tie-break order.
10. Null must never be treated as 0 (an investigation with null o2 must not get status "inside").

---

## 6. PHASES AND TASKS

### PHASE 0 — Setup (both tracks, 45 min)

**P0.1 Repo.** `git init`; create the layout in Section 3; add `.gitignore` (node_modules, dist, __pycache__, .venv); copy this file to `PLAN.md`; create empty docs files. **[HUMAN] H3: create a public GitHub repo, add it as `origin`, enable Pages with source "GitHub Actions".**
Accept: `git log` shows the first commit; `git remote -v` shows origin.

**P0.2 App scaffold.** `npm create vite@latest app -- --template react-ts`; install `react-router-dom recharts`; dev deps `vitest`; set `base: './'` in `vite.config.ts`; HashRouter with 6 empty routes (`/`, `/map`, `/explorer`, `/compare`, `/earth`, `/about`) and a nav bar.
Accept: `npm run build` succeeds; `npm run dev` shows the nav.

**P0.3 Deploy pipeline.** Add `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run test --if-present && npm run build
        working-directory: app
      - uses: actions/upload-pages-artifact@v3
        with: { path: app/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.d.outputs.page_url }}" }
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```
Accept: the public URL loads the nav. Record the URL in `README.md`. If blocked (Pages not available): **[HUMAN]** deploy `app/dist` to Vercel or Netlify by drag-and-drop.

**P0.4 Types.** Write `app/src/lib/types.ts` from Section 4. Write `app/src/lib/data.ts` that fetches each JSON from `./data/...` once and caches it.
Accept: `tsc --noEmit` passes.

### PHASE 1 — PSI data pipeline (Track A, about 5 hours)

> **Phase 1 as built (updated 2026-11-14, R04/R01).** The pipeline is Node, not the Python scripts described below. At first PSI was reachable only from a browser, so values were copied by hand; since R04 the pipeline downloads and parses everything itself. The tasks below are kept as the original spec. Where each one lives now:
> - P1.1 Config → investigation list and classification in `build_data.mjs` (`I`, `MODELING`); column map and conversions in `tables.mjs`.
> - P1.2 Fetch → `node pipeline/fetch.mjs` (endpoints work from a script; 24 records, 22 tables; `--force` to refresh). The browser fallback (Appendix E) is no longer needed.
> - P1.3 Inspect → done; decisions in `docs/DATA_CLEANING_LOG.md` and Appendix B (corrected).
> - P1.4 Runs → `tables.mjs` returns full-resolution run points with source file, row and `flame_type`; `runs.json` holds them binned to 1% O2 and 5 kPa. Inverse-flame rows are not run points (R01), so there are 875 points, not the 1,500+ expected below.
> - P1.5 Investigations → `build_data.mjs`: identity, dates, license, size, publications and table list from `raw/<ID>.json`; ranges and `n_runs` from `tables.mjs`. `text.*` (verbatim PSI text) is not stored yet (REVIEW_ISSUES R34).
> - P1.6 Text-derived fields → inline in `build_data.mjs` (no `manual_fields.json`); each quote is checked against the record text at build time.
> - P1.7 Validate and P1.8 Insights/gaps → end of `build_data.mjs`, plus file sha256 checks and the `expected.json` regression check (`--accept` after an intended change, logged in DATA_CLEANING_LOG.md).
> - P1.9 Spot-check → `docs/VERIFICATION_LOG.md`; H4 still open (REVIEW_ISSUES R05).

**P1.1 Config.** Create `pipeline/config.py` with: the investigation list (Appendix A), the column map and conversions (Appendix B), the role/fuel classification (Appendix A).

**P1.2 Fetch (`01_fetch.py`).** For each PSI ID in Appendix A (ranked set and related-modeling set):
1. `GET https://psi.nasa.gov/geode-py/ws/repo/investigations/<ID>` → JSON. Save a **trimmed** copy to `pipeline/raw/<ID>.json` keeping only: `accession, investigationAcronym, title, doi, researchArea, subResearchArea, projectType, flightProgram, experimentHardware, investigationStartDate, investigationEndDate, objective, approach, hypothesis, researchImpacts, publications, experimentalTable, related_glds, licenseIdentifier, totalFileSize, modifiedDate, version`. (Drop the huge `added`/`removed` file lists.)
2. For each entry in `experimentalTable`: `GET https://psi.nasa.gov/geode-py/ws/studies/<ID>/download?file=<url-encoded file_name>&version=1&redirect=false`. The response body is a **plain-text signed URL**. `GET` that URL; save to `pipeline/raw/tables/<file_name>`.
3. Sleep 0.5 s between requests; send a descriptive `User-Agent` ("SpaceApps2026-FlameMap team research script"); skip files already on disk.

These endpoints are the PSI website's own (undocumented) JSON endpoints, confirmed working from a browser on 2026-11-14. They were not tested from a script.
Accept: about 24 JSON files and about 25 CSVs on disk; a printed table of file name, row count, header.
**If blocked** (403, HTML instead of JSON, or network refused): **[HUMAN]** open `https://psi.nasa.gov/physci/repo/search?q=combustion` in Chrome, open DevTools Console, paste the snippet in Appendix E, and move the downloaded `psi_bundle.json` into `pipeline/raw/`. Then make `01_fetch.py` unpack that bundle instead of calling the network.

**P1.3 Inspect before mapping.** Print for every CSV: exact header strings (they contain stray spaces and odd characters), first 5 rows, and distinct values of the columns named in Appendix B. Compare to Appendix B. Where a header differs, fix `config.py` to the *actual* string. Where a unit is not stated in the header (flagged "INSPECT" in Appendix B), decide from the values and the PSI text, and write the decision to `docs/DATA_CLEANING_LOG.md`. If you cannot decide, set the column unmapped (values become null).
Accept: the log has one entry per CSV.

**P1.4 Runs (`02_runs.py`).** For each mapped CSV: read with pandas (`dtype=str`), strip whitespace, coerce numerics with `errors="coerce"`, apply conversions, build rows per Section 4.2. Rules:
- Drop a row only if every condition column is null; log the count.
- A cell holding a text range such as "0.18-0.21" → skip for `runs.json` but use both ends for the investigation range; log it.
- Sanity asserts (fail loudly): `0 <= o2_percent <= 100`; `5 <= pressure_kpa <= 400`; `0 <= flow_cm_s <= 500`. A violation means a unit mistake: fix the mapping, do not clip.
- Pressure: if the table has no pressure column and the platform is ISS or Cygnus, set `pressure_kpa = 101.3`, `pressure_assumed = true`.
Accept: `runs.json` has more than 1,500 rows across at least 8 investigations (CFI-G alone has about 1,190); asserts pass.

**P1.5 Investigations (`03_investigations.py`).** For each ranked investigation:
- Identity fields from the PSI JSON. Dates → ISO. `raw_data_gb = totalFileSize / 1e9` rounded to 1 decimal.
- `conditions.*` min/max from that investigation's runs → `source.type = "table_column"`, `confidence = "high"`, `ref = "<file> :: <exact column header>"`.
- Assumed cabin pressure → `source.type = "assumed_platform"`, `confidence = "low"`.
- `gravity_g.values = [0]` for flight records.
- `n_runs` = CSV data row count (sum if two tables).
- `data_availability` per Appendix A unless inspection shows otherwise.
- `text.*` copied verbatim from PSI (license is CC0; still cite the DOI).
- Merge `pipeline/manual/manual_fields.json` (P1.6) over the top; merge `pipeline/manual/summaries.json` (P4.1).
- Attach `related_modeling` from Appendix A.
Accept: `investigations.json` has 16–19 records; every non-null condition has a source and confidence.

**P1.6 Text-derived fields (`manual_fields.json`).** For fields not in tables, read `objective` and `approach` for each investigation and extract: `fuel_materials`, `geometry`, `diluents`, `variables_varied`, `sensors`, and any condition numbers stated in the text (for example the BASS text states airflow up to 40 cm/s). Rules:
- Only extract what the text states explicitly. Copy the supporting phrase (under 25 words) into `source.ref`.
- Numbers from text → `source.type = "psi_text"`, `confidence = "medium"`. Where only an upper bound is stated ("as high as 40 cm/s"), set `max` and leave `min` null; the ranker treats a null bound as open on that side only if the other bound exists (implement: missing min → min = max for gap math, and add flag "partial range from text").
- Do not use outside knowledge to fill fields. If the text does not say it, leave null.
Accept: file exists; every entry has a quote in `source.ref`.

**P1.7 Validate (`04_validate.py`).** Checks: enumerations valid; `min <= max`; no condition without provenance; every `psi_id` has a DOI and URL; every run's `psi_id` exists in investigations; no NaN in JSON (write `null`). Exit non-zero on failure. Copy outputs to `app/public/data/`.
Accept: script exits 0.

**P1.8 Insights and gaps (`05_insights.py`).** Compute from the data only, for each environment in `environments.json`:
- `partial_gravity`: count of investigations with a gravity value within 0.05 g of the environment's gravity. If 0 and env gravity is not 0 or 1 → gap, severity high.
- `o2_solids`: max `o2_percent.max` among `fuel_class == "solid"` investigations vs. environment O2. If env O2 is higher → gap with the difference and the investigation that holds the max.
- `o2_any`: same across all fuel classes (shows whether only gas-fuel tests reach the environment's O2).
- `low_pressure`: count of investigations whose *recorded* (not assumed) pressure range includes the environment pressure; list them by fuel class.
- `combined`: count of runs in `runs.json` within ±5 O2 points AND ±10 kPa of the environment, split by fuel class and by `pressure_assumed`.
- `airflow`: recorded airflow range for solids.
Also global `insights.json`: totals (investigations, runs, publications, years spanned), highest O2 tested overall and by fuel class, lowest recorded pressure, count by fire-safety role, count by data availability.
Each item's `text` is generated from a template with the computed numbers. No hand-written claims.
Accept: `gaps.json` has entries for every environment; each has `computed_from` and `sources`.

**P1.9 Spot-check (verification).** Pick 30 random non-null fields across investigations (seeded random; print them). For each, open the cached CSV or JSON and confirm the value by an independent calculation (for example recompute min/max in a one-off command, not by calling the pipeline function). Record pass/fail in `docs/VERIFICATION_LOG.md`. Fix any failure, then re-run all 30. **[HUMAN] H4: verify 10 of those against the live PSI web pages and initial the log; then set `verified.by/date` on those records.**
Accept: 30/30 pass.

### PHASE 2 — Ranker (Track B, 1.5 hours; can start right after P0)

**P2.1** Implement `app/src/lib/ranker.ts` exactly per Section 5: `rank(env, task, weights, investigations) -> RankedItem[]`. Pure function, no I/O.
**P2.2** Write `ranker.test.ts` with the 10 tests in Section 5. `npm run test` must pass and must run in CI (the deploy workflow runs tests).
**P2.3** Add `explain(item) -> string[]`: template sentences built from the breakdown, for example "Tested O2 range 15–22%; your environment needs 30% (8 points above the tested range)." Numbers come from the breakdown only.
Accept: tests green.

### PHASE 3 — UI (Track B, about 8 hours)

Design rules: dark "mission control" theme with high contrast (text contrast ratio ≥ 4.5:1); one accent color for the selected environment; color is never the only signal (use icons/labels for status); works at 1280 px wide and on a phone; every number has a hover or adjacent "source" link.

**P3.1 Rank page (`/`, the home page).**
- Top: environment selector (cards or segmented buttons from `environments.json`), "Custom" opens sliders (O2 10–100%, pressure 20–110 kPa, gravity 0–1 g, airflow 0–100 cm/s or "not set"). Task selector (3 tasks). Collapsible "weights" with 5 sliders and a reset.
- Conditions strip: the chosen environment's values with a "verified / from challenge statement / assumption" label and source link per value.
- Gap banner(s) for the chosen environment from `gaps.json` (high severity first).
- Ranked list: card per investigation with rank, acronym, title, relevance (0–100), "based on N of 5 factors", role and fuel chips, data-availability chip, and a per-factor bar row (O2, pressure, airflow, gravity, task) showing inside/outside/unknown. Expand → `explain()` sentences, tested ranges vs. environment values, provenance per value, links to the PSI record and DOI, "Add to compare".
- Buttons: "Export ranking (CSV)", "Export ranking (JSON)".
Accept: changing environment, task or a weight re-ranks instantly; unknown factors render "not recorded" (never 0); all three presets from Appendix C work.

**P3.2 Evidence Map (`/map`).** Recharts ScatterChart: x = O2 %, y = pressure kPa, one point per run from `runs.json`, colored and shaped by fuel class; hollow markers where `pressure_assumed`. Overlay labeled markers for every environment preset; highlight the selected one. Legend toggles per fuel class. Tooltip: investigation, fuel, values, source file and row. Under the chart, the computed `combined` insight for the selected environment ("N runs within ±5 O2 points and ±10 kPa; M of them solid fuels"). If more than 3,000 points, sample deterministically per investigation and say so in a caption. Add a second small chart: O2 range bar per investigation (min–max) with a vertical line at the environment's O2.
Accept: environment markers visible; selecting an environment updates highlight and caption.

**P3.3 Explorer (`/explorer`).** Table of all investigations: acronym, role, fuel class, O2 range, pressure range, airflow range, runs, data availability, years. Text search; filters for role, fuel class, platform, data availability. Row click → detail drawer: summary (labeled "AI-drafted summary, from PSI record text"), why it matters, PSI objective/approach text, conditions with provenance and confidence chips, sensors, variables varied, publications with DOI links, related modeling studies, PSI link. "Export table (CSV/JSON)" and "Export runs (CSV)".
Accept: filters combine; exports open in a spreadsheet.

**P3.4 Compare (`/compare`).** Pick 2–3 investigations (from Explorer/Rank or a dropdown). Side-by-side rows for every attribute in the challenge statement: objectives; fuels and geometry; O2, pressure, airflow; variables varied; sensors; platform/hardware; runs. Highlight rows that differ. A one-line computed note per numeric row ("O2 ranges overlap between 18 and 21%" / "no overlap").
Accept: works for any 2–3 picks; state is kept in the URL hash.

**P3.5 Earth applications (`/earth`).** Cards from `earth_applications.json` (Appendix D): title, one-sentence description taken from the NASA page, link. Plus a short "why space fire research matters" strip linking the NASA history pages (Appendix D). Keep text factual; one or two sentences each, written in our own words.

**P3.6 About / Method / Sources (`/about`).** Sections: what this is; data source (PSI, with link); method (the scoring formula in plain words plus the table of weights and reference spans); data cleaning summary (from the log); limitations (Section 7.6 list); AI-use statement (Section 9.3); full source list from `sources.json` with DOIs; scope note (rocket and propellant fire safety is outside PSI's combustion data); team and repo link.

**P3.7 Shared.** Footer disclaimer on every page; loading and error states for data fetch; empty states; page titles; favicon; `README.md` with run instructions.

### PHASE 4 — AI layer (Track A, 1.5 hours; after P1.5)

"AI-powered" here means: AI extracted and structured the investigation attributes from PSI text, and AI drafted the plain-language summaries. Both are constrained to source text and machine-checked. The ranking itself is deliberately *not* AI, so that every result is explainable. State this plainly in the app and the project page.

**P4.1 Summaries (`pipeline/manual/summaries.json`).** For each investigation write:
- `text`: at most 80 words, plain language, what was burned, in what conditions, what was measured, what was learned *as stated in the PSI text*.
- `why_it_matters`: at most 35 words linking it to crewed-environment fire safety, using only the PSI "research impacts" text.
Rules: use only that record's `text.*` fields and its computed conditions; no outside facts; no superlatives; every number must appear in the source text or the computed conditions.
**P4.2 Machine check (`06_check_summaries.py`).** For every summary: extract all numbers; assert each appears in the record's source text or computed condition values (allow rounding to the shown precision). Assert word limits. Fail on violation; fix the summary, not the check.
**P4.3** Set `generated_by` and leave `human_reviewed: false` until **[HUMAN] H5** reads all summaries (about 20 minutes) and flips the flag.
Accept: check exits 0.

**Phase 4 as built (2026-11-14, REVIEW_ISSUES R03, R06).** The AI layer grew beyond summaries:
- Summaries (P4.1) live in `build_data.mjs`; the number check (P4.2) is built into it; H5 sign-off goes in `pipeline/reviews.json` with a hash (sheet: `docs/SUMMARY_REVIEW.md`).
- Key findings (`pipeline/findings.json`, 20 for 11 studies): from NASA's Researcher's Guide (quote + page), PSI record text (quote + field) or PSI table cells; checked by `build_data.mjs`.
- Interpretation briefs (Rank page), curated "Ask the evidence" answers and related-study reasons: written by AI from `pipeline/ai/context.md` (computed rankings, gaps, findings) and checked sentence by sentence by `pipeline/ai_build.mjs` (cites resolve, numbers appear in what is cited, named studies are cited, "closest" studies are in the computed top 5). Review sheet: `docs/AI_TEXT_REVIEW.md`; sign-off with a content hash in `pipeline/ai/meta.json`.
- The ranking is still not AI. See `docs/AI_PLAN.md` for the design.

### PHASE 5 — Environment presets (Track A, 45 min; before G3)

**P5.1** Build `environments.json` from Appendix C. For each value marked "verify", search for a NASA source and record the URL; otherwise keep `status: "nominal_assumption"`. Values marked "from challenge statement" keep that status and link to the challenge page.
Accept: every value has a status; none is unlabeled.

### PHASE 6 — QA (both, 2 hours; after feature freeze)

Write results into `docs/QA_CHECKLIST.md`.
1. `npm run test` green; `node pipeline/build_data.mjs` and `node pipeline/ai_build.mjs` exit 0.
2. Hand-check: for 3 environments × 1 task, compute the top investigation's relevance by hand (spreadsheet or calculator) from `investigations.json` and compare to the app. Must match exactly.
3. Every page loads from the deployed URL in a private window on desktop Chrome, Safari or Firefox, and on one phone. No console errors.
4. Click every external link (PSI, DOI, NASA). No dead links.
5. Search the built app text for forbidden claims: "predict", "certif", "safe to", "guarantee", "NASA recommends". Rewrite any hit.
6. Search for rendered `NaN`, `undefined`, `null`, and for "0" where the data is null.
7. Unknown handling: an investigation with null pressure shows "not recorded" and "based on N of 5 factors".
8. Keyboard: tab through the Rank page; focus visible; controls labeled.
9. Exports: open CSV and JSON; column headers readable; values match the screen.
10. Lighthouse (Chrome DevTools) on the home page: Accessibility ≥ 90; fix the top issues.
11. Disclaimer present on every page; Sources page lists every DOI in `investigations.json` (script check: counts equal).
12. Second-person data check: the teammate who did *not* build the pipeline verifies 10 more random fields against live PSI pages.

### PHASE 7 — Deliverables (Section 9) and PHASE 8 — Submission (Section 12)

---

## 7. CONTENT RULES

7.1 Tone: precise, calm, technical. No hype words.
7.2 Units: O2 in % by volume; pressure in kPa with psi in parentheses on first use per page; airflow in cm/s; gravity in g.
7.3 Every chart has a title that states the takeaway, axis labels with units, and a data-source caption.
7.4 Confidence chips: high = "from data table", medium = "from PSI text", low = "assumed".
7.5 AI labels: "AI-drafted summary, based only on the PSI record text. Check the PSI record before relying on it."
7.6 Disclaimer (footer and About, verbatim): "FlameMap is a student hackathon project and a research-navigation aid. It ranks how closely past NASA experiments match a chosen environment. It does not predict fire behavior, assess risk or certify safety, and it is not NASA guidance. Always consult the original PSI records and publications."
Limitations to list on About: undocumented PSI endpoints, snapshot date; conditions summarized as min–max ranges (not every combination inside a range was tested); cabin pressure assumed where not recorded; ranking weights are a judgment call and are user-adjustable; text-derived fields are lower confidence; no partial-gravity data exists in PSI combustion records, so gravity distance is a flag, not physics.

---

## 8. HUMAN-ONLY STEPS (collect here; do early)

- **H1** Read the live Project Submission Guide and Judging & Awards Guide; fill `docs/SUBMISSION_REQUIREMENTS.md` (limits, fields, formats, hosting rules for the demo and slides, local-event deadline).
- **H2** Confirm both members are registered, on the team page, and joined to an event; challenge selected.
- **H3** Create the public GitHub repo; enable Pages.
- **H4** Verify 10 data fields against live PSI pages; initial the log.
- **H5** Read and approve all AI summaries.
- **H6** Record the 30-second demo (Section 9.1) and upload it where the guide requires.
- **H7** Build the 7 slides from `docs/SLIDES.md` in Google Slides or PowerPoint; host with a public link.
- **H8** Paste `docs/PROJECT_PAGE.md` into the Project tab; dry-run at 9 PM Sunday; click "Submit for Judging" by 10 PM; screenshot the confirmation.

---

## 9. DELIVERABLE DRAFTS (the agent writes these files, filling {{placeholders}} from `insights.json` and `gaps.json`; never leave a placeholder or invent a number)

### 9.1 `docs/DEMO_SCRIPT.md` — 30 seconds maximum (about 70 spoken words)
| Time | Screen | Voice-over |
|---|---|---|
| 0–5 s | Title card, then Rank page on "ISS" | "NASA has decades of microgravity fire experiments. Which ones apply to a Moon habitat?" |
| 5–12 s | Click "Lunar surface habitat", task "Prevention" — list reorders | "FlameMap ranks every investigation by how closely its tested conditions match your environment." |
| 12–18 s | Expand top card: per-factor bars and sources | "Every score shows its math and links to the NASA record." |
| 18–25 s | Evidence Map: environment marker away from the run cluster; gap banner | "And it shows what's missing: {{gap headline computed for moon_base}}." |
| 25–30 s | Export button, then URL | "Export the data for modeling. Built on NASA's PSI database." |
Recording notes: 1080p, browser at 100% zoom, cursor highlighted, no dead air, captions burned in, hard cut at 29 s. Rehearse with a timer three times. Confirm in H1 whether voice-over, music or captions are required or restricted.

### 9.2 `docs/SLIDES.md` — 7 slides maximum
1. **Title + one-line pitch.** Name, team, challenge, live URL, repo URL.
2. **Problem.** Fire is a top risk in crewed spacecraft; future habitats plan higher O2 at lower pressure (challenge statement: at least 30% O2 at or below 10.2 psi); PSI holds {{n_investigations}} combustion investigations and {{n_runs}} tabulated runs, but they are hard to compare.
3. **Solution.** Screenshot of the Rank page. "Choose environment + task → ranked evidence with visible math."
4. **Data and method.** PSI pipeline diagram (PSI records and tables → normalize units → provenance on every field → static JSON → in-browser ranker). The formula in one line. "AI extracts and summarizes; arithmetic ranks."
5. **What we found.** Evidence Map screenshot plus the 3 strongest computed gaps for the lunar habitat preset: {{gap1}}, {{gap2}}, {{gap3}}.
6. **Validity and limits.** {{n_fields_checked}} fields spot-checked against PSI; {{n_tests}} unit tests; cleaning log; disclaimer; AI-use statement.
7. **Impact and next steps.** Who uses it (researchers, students, engineers); export for modeling; Earth applications; next: add LUCI and FM2 partial-gravity data when released, add NTRS publication data, PSI team feedback.
Rules: at most 30 words per slide besides labels; one visual per slide; sources in small print at the bottom.

### 9.3 `docs/PROJECT_PAGE.md`
Write these sections (adapt headings to the fields found in H1):
- **High-level summary (about 100 words).** What it is, who it is for, why it matters.
- **Project details (300–500 words).** What it does; how it works (pipeline, schema, ranker, map); what is new (distance-to-condition, computed gap flags, provenance on every field); benefits; tools and languages; what we would do next.
- **How it addresses the challenge.** Map each suggested capability in the statement to a feature (find relevant investigations → ranker; data for predictive modeling → exports and run table; research informing controls and equipment → role filter and task selector; Earth applications → panel; attributes to compare → Compare view).
- **NASA data and resources.** PSI Data Repository (combustion science): list the PSI IDs and DOIs used; NASA Combustion Science pages; NASA spin-off pages; history pages. State exactly how each was used.
- **Use of artificial intelligence (disclosure).** "We used AI coding assistants (Anthropic Claude) to help plan the project, write code, extract structured attributes from PSI record text, and draft plain-language summaries. All AI-extracted values carry a source reference and were spot-checked by team members against PSI; AI-drafted summaries are labeled in the app and were reviewed by the team. The ranking uses transparent arithmetic, not an AI model. The project idea, design decisions and verification are the team's own." **[HUMAN] edit so every sentence is true of what you actually did.** No AI-generated images or video unless watermarked as the guide requires.
- **References.** All DOIs and URLs.
- **Links.** Live app, repo, demo, slides.

---

## 10. STRETCH (only after gate G3; in this order; drop any that is not finished by 4 PM Sunday)
1. "1-g vs. microgravity" mini-panel using the SAFFIRE-II table columns that hold both burn lengths (only if the columns parse cleanly).
2. Shareable links (environment, task and weights encoded in the URL hash).
3. Fire-safety controls view: investigations grouped by prevention / detection / suppression with counts and condition coverage.
4. Add the four partial-table ACME records (PSI-21, 22, 23) and SLICE (PSI-106) if not already ranked.
Do **not** build: live LLM chat, user accounts, a backend, a predictive ML model, 3D graphics.
("Ask the evidence" respects this: it matches questions to answers checked at build time and generates nothing in the browser. Items 1 and 2 above are built.)

**Cut order if behind:** Compare page polish → Earth page (reduce to links on About) → weights sliders → O2 range bar chart → text-derived fields (P1.6) beyond the 6 thinnest records. **Never cut:** real PSI data with provenance, ranker tests, Rank page, Evidence Map, gap flags, About/Sources/disclaimer, demo, slides, dry run.

---

## 11. GATES (Central time; both people stop, merge to main, check the live URL together)

| Gate | When | Must be true |
|---|---|---|
| G0 | start + 1 h | P0 done; live URL up; contracts agreed |
| G1 | Sat 6 PM (or start + 5 h) | P1.2–P1.4 done: real `runs.json`; ranker tests pass; Rank page works on mock or partial data |
| G2 | Sat 11 PM | Real `investigations.json` and `runs.json` in the deployed app; Explorer and Rank pages working. Sleep. |
| G3 | Sun 1 PM | MVP end to end on the live URL: Rank, Evidence Map, Explorer, gaps, exports, About |
| G4 | Sun 5 PM | **Feature freeze.** Only bug fixes, content and QA after this |
| G5 | Sun 9 PM | QA checklist done; demo recorded; slides done; Project tab filled (dry run) |
| Submit | Sun 10 PM | "Submit for Judging" clicked; confirmation screenshot saved |

If the team starts later than planned, keep G3–Submit fixed and compress by applying the cut order.

---

## 12. FINAL SUBMISSION CHECKLIST
- [ ] Live URL loads in a private window; repo is public; README explains how to run.
- [ ] Demo ≤ limit confirmed in H1 (timed with a stopwatch; aim for 29 s).
- [ ] Slides ≤ 7; public link opens without sign-in.
- [ ] Project page: all required fields; NASA data statement names PSI and DOIs; AI disclosure present and true.
- [ ] Disclaimer and Sources page in the app.
- [ ] All team members listed on the team page.
- [ ] "Submit for Judging" clicked before 11:59 PM; confirmation screenshot saved in `docs/`.

---

## APPENDIX A — Investigations (from the PSI repository, read 2026-11-14)

Record URL pattern: `https://psi.nasa.gov/physci/repo/data/investigations/<PSI-ID>`. Take DOI, dates, text and hardware from the fetched JSON, not from this table.

**Ranked set**
| PSI ID | Acronym | Primary role | Secondary | Fuel class | Expected data availability |
|---|---|---|---|---|---|
| PSI-25 | BASS-II | prevention | suppression | solid | run_table_with_conditions |
| PSI-26 | BASS | prevention | suppression | solid | run_log_only |
| PSI-98 | SAFFIRE-I | prevention | detection | solid | run_table_with_conditions |
| PSI-99 | SAFFIRE-II | prevention | – | solid | run_table_with_conditions |
| PSI-100 | SAFFIRE-III | prevention | – | solid | run_table_partial |
| PSI-102 | SAME | detection | – | aerosol | run_table_partial |
| PSI-101 | SAME-R | detection | – | aerosol | run_table_partial |
| PSI-47 | DAFT / DAFT-2 | detection | – | aerosol | run_log_only |
| PSI-69 | FLEX | suppression | fundamental | liquid_droplet | run_table_with_conditions |
| PSI-68 | FLEX-2 | fundamental | suppression | liquid_droplet | run_table_with_conditions |
| PSI-39 | CFI | fundamental | – | liquid_droplet | run_table_with_conditions |
| PSI-20 | ACME BRE | prevention | fundamental | gas | run_table_partial |
| PSI-10 | ACME Flame Design | fundamental | – | gas | run_table_with_conditions |
| PSI-159 | ACME CFI-G | fundamental | – | gas | run_table_with_conditions |
| PSI-21 | ACME CLD Flame | fundamental | – | gas | run_table_partial |
| PSI-22 | ACME E-FIELD Flames | fundamental | – | gas | run_table_partial |
| PSI-23 | ACME s-Flame | fundamental | – | gas | run_table_partial |
| PSI-107 | SPICE | fundamental | detection | gas | run_table_with_conditions |
| PSI-106 | SLICE | fundamental | – | gas | run_log_only |

Role assignments follow the challenge statement's grouping (prevention: BASS, BASS-II, Saffire; detection: SAME, SAME-R, DAFT; suppression: FLEX; BRE studies flammability vs. material properties). Secondary roles are our judgment from the PSI objectives; confirm each against the fetched `objective` text and remove any the text does not support. Record this in `docs/DECISIONS.md`.

**Related modeling / ground studies (not ranked; attach as `related_modeling` to the parent)**
| PSI ID | Topic | Parent |
|---|---|---|
| PSI-62 | Flame-spread modeling compared with BASS | PSI-25, PSI-26 |
| PSI-60 | Computational and experimental analysis of SPICE data | PSI-107 |
| PSI-115 | Modeling smoke generation using SAME data | PSI-102 |
| PSI-117 | CFD of cool-flame dynamics | PSI-69 |
| PSI-142 | Counterflow cool-flame transitions (ground) | PSI-69 |

**Exclude** (returned by the "combustion" search but not combustion): PSI-108 (STDCE-1), PSI-181 (solder study).

## APPENDIX B — Experimental-table column map (headers as seen 2026-11-14; corrected after R04/R01 — `pipeline/tables.mjs` is the source of truth)

Conversions: mmHg × 0.133322 = kPa; atm × 101.325 = kPa; bar × 100 = kPa; psi × 6.89476 = kPa; mole fraction × 100 = %.

| PSI ID | File suffix (after `PSI-<n>_Experimental table_`) | Rows | O2 column → conversion | Pressure column → conversion | Airflow column | Fuel column | Notes |
|---|---|---|---|---|---|---|---|
| PSI-25 | BASS-II.csv | 129 | "Calibrated initial O2 % by vol" (header has extra spaces) → % | none → assumed cabin | none usable ("Fan display", "Air display" are settings: INSPECT; map only if units are documented) | "Fuel Sample Material" | also final O2, CO2, CO columns: keep final O2 as an extra field |
| PSI-26 | BASS.csv | 122 | none | none → assumed cabin | none (text says up to 40 cm/s) | "Fuel Sample Material" | run log only |
| PSI-98 | SAFFIRE-1.csv | 4 | "Percent O2" → % | none → assumed cabin | "Air Flow (cm/s)" | "Material" | |
| PSI-99 | SAFFIRE-2.csv | 15 | "Percent O2 (Note 1)" → % | none → assumed cabin | "Air Flow (cm/s)" | "Material" | has 1-g and microgravity burn-length columns (stretch 1); header has a typo "Samle Thickness" |
| PSI-100 | SAFFIRE-3.csv | 2 | none | none → assumed cabin | "Air Flow" (unit not in header: INSPECT) | "Material" | |
| PSI-102 | SAME.csv | 8 | none | none → assumed cabin | "Air Flow (cm/s)" | "Sample Material" | |
| PSI-101 | SAME-R.csv | 109 | none | none → assumed cabin | "Inlet velocity (cm/s)" | "Sample Type" / "Description" | |
| PSI-47 | DAFT.csv | 2 | none | none → assumed cabin | none | "Sample Material" | session log (D1, D2); no combustion |
| PSI-69 | FLEX.csv | 274 | "O initial ambient composition; mole fraction" → ×100 | "Ambient pressure; mmHg" → ×0.133322 | none | "Fuel" | diluent columns N, CO, He (confirm from PSI text whether "O"/"CO" mean O2/CO2; log it) |
| PSI-68 | Flex2.csv | 8 | "Oxygen Mole Fraction" → ×100 | "Ambient Pressure (atm)" → ×101.325 | "Flow Velocity (cm/s)" | "Sample (Fuel Type)" | cells may hold ranges as text |
| PSI-39 | CFI.csv | 87 | "Oxygen" (unit INSPECT) | "Pressure" (unit INSPECT) | none | "Fuel" | also Nitrogen, Helium |
| PSI-20 | ACME BRE.csv | 18 | "Oxygen Conc (percent)" → % | none → INSPECT text (CIR chamber, not cabin: do **not** assume 101.3) | none | "Fuel Bottle" | "Burner Size (mm)" → geometry |
| PSI-10 | Flame Design_Normal Flame.csv | 207 | "XO2 (init)" → ×100 | "pinit (atm)" → ×101.325 | none | "Fuel" | the only table used for PSI-10 conditions |
| PSI-10 | Flame Design_Inverse Flame.csv | 120 | not ambient: "XO2" is the burner oxidizer stream | not used (chamber holds C2H4 + N2) | none | ethylene ("XC2H4" columns) | R01: excluded from ranges, bins and counts; 11 rows say RAMP / LOW O2 |
| PSI-159 | CFI-G_Normal Flames.csv | 179 | "XO2 before test" → ×100 | "approx p (bar)" → ×100 | none | "Fuel" | the only table used for PSI-159 conditions |
| PSI-159 | CFI-G_Inverse Flames.csv | 154 (1,015 lines; rest blank) | not ambient: "XO2" is the burner oxidizer stream | not used (chamber holds fuel + N2, "Xf before test") | none | "Fuel" | R01: excluded from ranges, bins and counts |
| PSI-21 | CLD Flame.csv | 32 | none | none (CIR chamber: do not assume) | none | "Fuel Bottle" | partial |
| PSI-22 | ACME E-FIELD Flames.csv | 32 | none | none (CIR: do not assume) | none | "Fuel Bottle" | partial |
| PSI-23 | ACME s-Flame.csv | 18 | "Atmosphere*" (INSPECT) | none (CIR: do not assume) | none | "Fuel Bottle" | partial |
| PSI-107 | Spice.csv | 469 | none | none → assumed cabin (MSG) | "Air Rate (cm/s)" | "Fuel" | "Nozzle (mm)" → geometry |
| PSI-106 | Slice.csv | 12 | none | none | none | "Fuel Type" | run log only |

**Cabin-pressure assumption applies only** to experiments open to cabin or Cygnus air (MSG glovebox, Saffire, SAME, DAFT). Experiments in the sealed Combustion Integrated Rack chamber (FLEX, FLEX-2, CFI, all ACME) set their own atmosphere: use the table value or leave pressure null. Before applying the assumption to any record, confirm from its `approach` text that it ran in cabin or module air; log the decision.

## APPENDIX C — Environment presets

| id | Name | O2 % | Pressure kPa (psi) | Gravity g | Airflow | Status |
|---|---|---|---|---|---|---|
| iss | ISS-like station cabin | 21 | 101.3 (14.7) | 0 | null | verify (sea-level-equivalent cabin; find a NASA page) |
| moon_base | Lunar surface habitat | 30 | 70.3 (10.2) | 0.166 | null | O2 and pressure from the challenge statement ("at least 30% O2 at or below 10.2 psi": show as "≥30%" / "≤10.2 psi" in the UI); gravity: verify |
| rover | Pressurized lunar rover | 30 | 70.3 (10.2) | 0.166 | null | same as above |
| mars_base | Mars surface habitat | 30 | 70.3 (10.2) | 0.38 | null | atmosphere = nominal_assumption (same as lunar habitat); gravity: verify |
| spacesuit | Spacesuit (EVA) | 100 | 29.6 (4.3) | 0 | null | O2 and pressure from the challenge statement; gravity depends on location (label it) |
| earth | Earth reference | 21 | 101.3 (14.7) | 1 | null | reference |
| custom | Custom | sliders | sliders | slider | slider | user input |

Optional extra preset, only if a NASA source is found and cited: "NASA exploration atmosphere", reported as about 34% O2 at 8.2 psi (56.5 kPa). Do not add it without the source.
Reference spans: O2 79 (= 100 − 21), pressure 71.7 kPa (= 101.3 − 29.6), airflow 20 cm/s, gravity 1 g.

## APPENDIX D — Non-PSI NASA links

- PSI repository (combustion): https://psi.nasa.gov/physci/repo/search?q=combustion
- NASA Combustion Science: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/
- Researcher's Guide to ISS Combustion Science: https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/
- Apollo 1: https://sma.nasa.gov/sma-disciplines/accllp/apollo-1 · Apollo 13: https://sma.nasa.gov/sma-disciplines/accllp/apollo-13 · Mir fire: https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/
- Earth spin-offs: Fireman's Air Tanks https://spinoff.nasa.gov/node/9582 · Fire Detector https://spinoff.nasa.gov/node/9407 · New Technology for the Fire Attire https://spinoff.nasa.gov/node/9918
- Challenge page: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
For `earth_applications.json`, fetch each spin-off page and write one or two sentences in our own words from what the page says. If a page cannot be fetched, show the title and link only.

## APPENDIX E — Browser fallback for P1.2 ([HUMAN] paste into the DevTools console on psi.nasa.gov)

> No longer needed (2026-11-14): `pipeline/fetch.mjs` reaches PSI directly. Kept for reference in case PSI starts blocking scripts.

```js
(async () => {
  const ids = ["PSI-25","PSI-26","PSI-98","PSI-99","PSI-100","PSI-102","PSI-101","PSI-47","PSI-69","PSI-68","PSI-39","PSI-20","PSI-10","PSI-159","PSI-21","PSI-22","PSI-23","PSI-107","PSI-106","PSI-62","PSI-60","PSI-115","PSI-117","PSI-142"];
  const keep = ["accession","investigationAcronym","title","doi","researchArea","subResearchArea","projectType","flightProgram","experimentHardware","investigationStartDate","investigationEndDate","objective","approach","hypothesis","researchImpacts","publications","experimentalTable","related_glds","licenseIdentifier","totalFileSize","modifiedDate","version"];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const out = { fetched_at: new Date().toISOString(), investigations: {}, tables: {} };
  for (const id of ids) {
    try {
      const r = await fetch("/geode-py/ws/repo/investigations/" + id).then(r => r.json());
      const t = {}; keep.forEach(k => t[k] = r[k]); out.investigations[id] = t;
      for (const e of (r.experimentalTable || [])) {
        const signed = (await fetch("/geode-py/ws/studies/" + id + "/download?file=" + encodeURIComponent(e.file_name) + "&version=1&redirect=false").then(r => r.text())).trim();
        out.tables[e.file_name] = await fetch(signed).then(r => r.text());
        await sleep(400);
      }
    } catch (err) { out.investigations[id] = { error: String(err) }; }
    console.log("done", id); await sleep(400);
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
  a.download = "psi_bundle.json"; a.click();
})();
```
It takes about 2 minutes. Check the console for any "error" entries before using the bundle.
