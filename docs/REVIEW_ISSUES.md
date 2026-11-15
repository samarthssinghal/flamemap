# Review issues tracker

Source: code and data review, 2026-11-14. Ordered from highest to lowest impact on judging (validity, relevance to the challenge, presentation).
Status values: `todo` · `in progress` · `done` · `skipped`. Effort is a rough estimate for one person with an agent.

| ID | Impact | Effort | Status | Issue |
|---|---|---|---|---|
| R01 | Critical | 1–2 h | done | Inverse-flame O2 (burner oxidizer stream) treated as ambient O2 |
| R02 | Critical | 1 h | done | Missing data raises the score (renormalization rewards unknowns) |
| R03 | High | — | done | No "findings": app ranks conditions, never interprets results (done via R06a) |
| R04 | High | 2–3 h | done | Pipeline not reproducible: hand-copied constants, no raw data in repo |
| R05 | High | 1 h (human) | in progress | Human verification steps not done (H1, H4, H5, links, phone) |
| R06 | Critical | see subtasks | todo | Add the super-intelligence (SI) layer the challenge title asks for (subtasks R06a–R06e) |
| R06a | Critical | 3–4 h | todo | SI: AI-extracted key findings per investigation, each with a quote and source (merges with R03) |
| R06b | Critical | 2–3 h | todo | SI: AI interpretation brief for each environment + task (what the evidence says, what's missing) |
| R06c | High | 3–4 h | todo | SI: "Ask the evidence" Q&A in the app, answers cited to PSI records only |
| R06d | High | 1 h | in progress | SI guardrails: machine check that every number/quote in AI text exists in the source; label AI text |
| R06e | Medium | 1 h | todo | SI: AI-suggested related investigations ("studies like this one") with reasons |
| R07 | High | 30 min | todo | Same metric shows two numbers (387 vs 392); custom env has no gaps |
| R27 | High | 1–2 h | in progress | Add NASA-stated findings from the Researcher's Guide (cited by page); seeds R06a with verified findings |
| R28 | High | 1 h | todo | "Three misconceptions" panel: NASA's myths about fire in space vs. the PSI evidence that disproved them |
| R29 | High | 30 min | todo | Presets have no airflow, so the airflow factor is never scored; set ventilation airflow from the Guide |
| R08 | Medium | 2–3 h | todo | Exports not useful for modeling: ranges and bins only, no per-run rows or outcomes |
| R09 | Medium | 1 h | todo | Gravity factor never discriminates; SAFFIRE-II 1-g data not used |
| R10 | Medium | 1–2 h | todo | Partial-gravity framing missing (E-FIELD analog, µg/1-g bounding) |
| R11 | Medium | 30 min | todo | Assumed (low-confidence) pressure scored at full weight |
| R12 | Medium | 30 min | todo | DAFT (no combustion) ties for #1 on every detection ranking |
| R13 | Medium | 2 h | todo | No controls/equipment view (detection, suppression, ventilation) |
| R14 | Medium | 1–2 h | todo | No hardware-family / similarity view (ACME-CIR, MDCA, MSG duct, SAME↔DAFT) |
| R15 | Medium | 15 min | todo | Slides and project page contain numbers affected by R01 |
| R30 | Medium | 1 h | todo | Incident → lesson → evidence panel (Apollo 1, Apollo 13, Mir linked to tasks and investigations) |
| R33 | Medium | 15 min | done | Save the Researcher's Guide text in `reference/` so findings and citations are reproducible |
| R16 | Low | 20 min | todo | Earth panel misses fine-water-mist extinguishers (named in challenge); Guide has the source |
| R17 | Low | 15 min | todo | Dangling references to `claude/*.md` files not in repo |
| R18 | Low | 15 min | todo | SAFFIRE-I dates copied from PSI record are wrong (same as SAME); add note |
| R19 | Low | 15 min | todo | SPICE airflow min −5.9 cm/s kept; record text says 5.4–65 |
| R20 | Low | 15 min | todo | Top card not opened after re-rank (open state keyed by investigation) |
| R21 | Low | 10 min | todo | `explain()` omits units on the environment value |
| R22 | Low | 10 min | todo | Explorer role filter matches secondary roles; table shows primary only |
| R23 | Low | 10 min | todo | All-zero weights accepted (from sliders or URL): every score 0 |
| R24 | Low | 30 min | todo | Bundle > 500 kB; lazy-load Evidence Map / Recharts |
| R25 | Low | 15 min | todo | CI skips lint; README says `main` (branch is `master`), no live URL; project page links are placeholders |
| R26 | Low | 10 min | todo | Lint warning: `App.tsx` exports non-components (fast refresh) |
| R31 | Low | 5 min | todo | "Fireman's Air Tanks" blurb says spacesuit tech; the NASA page doesn't say that |
| R32 | Low | 10 min | todo | NASA ScienceCasts video (challenge resource) is not linked anywhere |

---

## Details

### R01 — Inverse-flame O2 treated as ambient O2 (Critical)
In inverse flames the chamber holds fuel + N2 (`Xf before test`); `XO2` is the O2 fraction of the burner's oxidizer stream. Verified in `PSI-159_Experimental table_CFI-G_Inverse Flames.csv` (154 rows, 102 with XO2 ≥ 0.5). PSI-10 Flame Design inverse table very likely the same (verify).
- Where: `pipeline/build_data.mjs:96,102` (O2 ranges up to 85%), `BINS`, `RUN_STATS.o2_ge_30*`, `o2_any` gap.
- Effect: Evidence Map shows atmospheres to 85% O2; gap "highest O2 tested 85%"; Slide 5 "83 runs ≥30% O2 at ≤75 kPa"; spacesuit + suppression ranks Flame Design and CFI-G first only because of this.
- Fix: split normal vs. inverse; exclude inverse rows from ambient-O2 ranges and coverage counts (or plot them separately labeled "oxidizer stream"); recompute bins, insights, gaps.
- Done 2026-11-14: inverse rows excluded from ambient O2 and pressure ranges, bins and all counts (PSI-10 inverse table confirmed the same: chamber holds C2H4 + N2). Run points 1,138 → 875; max O2 85% → 40%; ≥30% O2 at ≤75 kPa 83 → 37. Slides 5 and project page numbers updated (R15 still open for R02). A labeled "oxidizer stream" view was not built; ranges kept in `TABLES[id].inverse`.

### R02 — Missing data raises the score (Critical)
`ranker.ts:65-68` skips unknown factors and rescales weights. Spacesuit + prevention ranks BASS and SAFFIRE-III #1/#2 though neither recorded O2.
- Fix options: unknown factor → fixed distance (e.g. 0.5); or relevance × completeness; or sort by completeness band first. Update tests (spec test 6 changes) and the About page text.
- Done 2026-11-14: unrecorded factor → distance 1 (`UNKNOWN_DISTANCE` in `ranker.ts`); factor the environment does not set → skipped for all (`not_set` status). 0.5 was tried: spacesuit still ranked ACME CLD/E-FIELD (nothing recorded) first. Added cabin-air O2 assumption (21%, low confidence) for 7 cabin-air studies, matching the existing cabin-pressure assumption, so SAME/SAME-R/DAFT stay top for detection. Spacesuit + prevention now: CFI-G, BASS-II, SAFFIRE-II, SAFFIRE-I, BASS (all 44–45). Tests 6, 10 updated; 12, 13 added. Cards show "n of m factors recorded"; CSV export adds `factors_recorded`.

### R03 — No findings / interpretation (High)
Challenge: "summarizes, ranks, and interprets those findings". Summaries say what was done, not what was learned. Tables have outcome columns (CFI-G hot ignition, burn time, self-extinction; SAFFIRE-II burn length; FLEX extinction).
- Fix: per-investigation "Key findings" (3–5 bullets) with a quote and source (PSI text, table column, or publication), shown on cards, Explorer and Compare. Start with the top ~8 fire-safety studies.
- Done 2026-11-14: 11 findings for 7 studies in `pipeline/findings.json` (7 Guide quotes with page, 4 from SAFFIRE-I/II table cells), checked by `build_data.mjs` (quote on page, cell values, numbers). Shown on Rank cards, Explorer drawer and Compare. Covers the R27 findings and the quote check of R06d; R06a's AI extraction from PSI reports (R35) and publications is still open. No findings for DAFT, SAFFIRE-III or the non-fire-safety studies (no source states a result). SAFFIRE-II comparison rows now read from the table (fixed sample 2-7).

### R04 — Pipeline not reproducible (High)
Values were transcribed by hand into constants; `pipeline/raw/` is empty. PSI is reachable from this machine now.
- Fix: fetch script (PLAN P1.2, rate-limited, cached), commit trimmed record JSON + CSVs, parse ranges/bins/counts from them, keep current numbers as regression checks.
- Done 2026-11-14: `pipeline/fetch.mjs` → `pipeline/raw/` (24 records, 22 tables, sha256 manifest); `pipeline/tables.mjs` parses ranges, counts and full-resolution run points (with file, row and `flame_type` normal/inverse, ready for R01); `build_data.mjs` checks against `pipeline/expected.json`. Hand copy reproduced except two corrections (PSI-10 max pressure 304.7 not 304.8; Exploration Atmosphere near-count 30 not 31), logged in DATA_CLEANING_LOG.md. Text-derived quotes are checked against record text. R01 and R08 can now work from `POINTS`.

### R05 — Human verification outstanding (High, human)
H1 (`SUBMISSION_REQUIREMENTS.md` empty: demo/slide limits unconfirmed), H4 (10 fields vs live PSI), H5 (read 19 summaries; `human_reviewed` all false), external link check, phone check, keyboard/screen-reader check.
- Prepared 2026-11-14 (agent):
  - H1: `docs/SUBMISSION_REQUIREMENTS.md` filled from the live guides. **Deadline Sun 15 Nov 2026, 11:59 p.m. local-event time.** Demo is a 7-slide deck *or* a ≤30-s video (one is enough). SI-generated code and data must be acknowledged in descriptive text and metadata; SI images or video need a visible watermark.
  - Live PSI check (all 24 records, 5 tables, 18 range values) and link check (40 URLs, 242 DOIs): no errors. Results in `docs/VERIFICATION_LOG.md`.
  - H4: 10 rows pre-filled in `VERIFICATION_LOG.md` for a person to initial.
  - Checklist for the person: `docs/HUMAN_TASKS.md`.
  - H5: `docs/SUMMARY_REVIEW.md` shows each summary next to its PSI text, with a ready-made approval line. Sign-offs go in `pipeline/reviews.json`; the build sets `human_reviewed` and `verified` from it and stops if a summary changes after it was approved.
- Left for a person: H2 (all members registered for the same Local Event), H4 and H5 sign-offs, phone check in a private window, keyboard and screen-reader pass, one click-through of the links.
- Found for other items: the project page has no "Other references" list (tools and libraries), a required form field (→ R25); README does not say the code was written with an AI assistant, which the SI rule asks for (→ R25).

### R06 — Add the super-intelligence (SI) layer (Critical)
The challenge is "SI-Powered Fire Safety Insights": an SI-powered dashboard that summarizes, ranks and **interprets**. Today the only AI is 19 offline summaries, unreviewed, with the planned number check (PLAN P4.2) never built. The ranking stays plain arithmetic (that's a validity strength); AI does the reading and interpreting, always grounded in cited sources.

Note: PLAN.md section 10 forbids "live LLM chat". R06c overrides that and needs a team decision (logged in `docs/DECISIONS.md`).

**R06a — Key findings extraction (static, build time).** Model reads each record's objective/approach/impacts text, table outcome columns and publication titles/abstracts, and outputs 3–5 findings: `{text, quote, source_type, source_ref, confidence}`. Shown on Rank cards, Explorer, Compare. Covers R03.

**R06b — Environment + task interpretation brief (static for presets).** For each preset × task, the model writes a short brief from the computed ranking, gaps and R06a findings: most relevant evidence, how far it is from the environment, what is untested, what a researcher should look at next. Every sentence cites a PSI ID or a computed gap. Precomputed into `briefs.json`; Custom environment shows the nearest preset's brief plus the computed gaps.

**R06c — "Ask the evidence" Q&A (runtime).** Question box; retrieval over investigations, findings and gaps in the browser; model answers only from retrieved items with citations; refuses outside scope (no risk prediction). GitHub Pages has no backend, so pick one:
1. User pastes their own API key (stored only in the browser). No server; judges must have a key.
2. Small proxy (e.g. Cloudflare Worker) holding the team's key, with rate limit and spend cap. Works for judges; costs money and needs abuse protection.
3. Precomputed answers to ~20 curated questions (static, always works), with option 1 or 2 for free-form questions.

**R06d — Guardrails.** Build-time check: every number and quote in AI text must appear in the cited source or computed data; fail the build otherwise. Labels "AI-generated, based on PSI record text" and a link to the source on every AI sentence. Human review (H5) before submission.

**R06e — Related studies.** Model suggests 2–3 related investigations per record with a one-line reason (shared hardware, fuel, condition range); checked against the data.

### R07 — Inconsistent counts; no gaps for custom env (High)
Rank page "combined" gap uses `RUN_STATS.near` (ISS 387); Evidence Map recounts from bins (`EvidenceMap.tsx:28-34`, ISS 392).
- Fix: compute all gaps in the browser from one source (`runs.json`, investigations) so presets and Custom agree.

### R08 — Exports weak for modeling (Medium)
Exports are min–max ranges and 1% / 5 kPa bins. Fix: export normalized per-run rows (conditions + outcomes + source file/row). Depends on R04.

### R09 — Gravity factor non-discriminating (Medium)
All investigations have `gravity_g.values = [0]` (`build_data.mjs:197`), so 15% weight never reorders. SAFFIRE-II has 1-g burn data → `[0, 1]`. Alternatively drop gravity from the score and keep it as a banner.

### R10 — Partial-gravity framing (Medium)
Challenge: E-FIELD Flames mimics partial gravity; µg and 1-g results bound intermediate gravity. Add a Moon/Mars "bounding" panel (µg vs. 1-g evidence, SAFFIRE-II pairs), tag E-FIELD as an analog, list LUCI/FM2 as forthcoming.

### R11 — Confidence unused in scoring (Medium)
Assumed cabin pressure (confidence low) counts like measured data. Fix: scale factor weight by confidence (e.g. high 1, medium 0.75, low 0.5) and show it.

### R12 — DAFT ranks top for detection (Medium)
No combustion took place. Fix: `combustion: false` flag shown on the card and a penalty or exclusion option for detection ranking.

### R13 — Controls / equipment view (Medium)
Objective 3 ("research that informs next-gen fire safety controls and equipment"). Group studies by prevention / detection / suppression with condition coverage and what each informs (materials selection, detector design, suppressant choice, ventilation shutdown). PLAN stretch item 3.

### R14 — Hardware family / similarity view (Medium)
Challenge lists ACME (CIR), MDCA (FLEX, FLEX-2, CFI), MSG flow duct (BASS, BASS-II, SPICE, SLICE), SAME↔DAFT instrument. Add grouping in Explorer and a similarity summary.

### R15 — Slides / project page numbers (Medium)
After R01/R02, update `docs/SLIDES.md` (slide 5) , `docs/PROJECT_PAGE.md`, `docs/DEMO_SCRIPT.md`.

### R16 — Water mist missing from Earth panel (Low)
Add fine-water-mist extinguisher entry with a NASA source; optionally a per-investigation "Earth relevance" line.

### R17 — Dangling references (Low)
`claude/context-limitations.md`, `claude/build-status.md` cited in `DATA_CLEANING_LOG.md`, `SLIDES.md`, `build_data.mjs:171`. Remove or add the files.

### R18 — SAFFIRE-I dates (Low)
PSI record says 2001-03-02 to 2008-02-28 (identical to SAME); Saffire-I flew 2016. Keep PSI's value, add "date as listed on PSI; appears incorrect" note.

### R19 — SPICE negative airflow (Low)
Range −5.9 to 85.3 cm/s; 8 negative rows. Exclude negatives from the range or flag; log the decision.

### R20 — Top card not opened after re-rank (Low)
`Rank.tsx:25` `useState(idx === 0)` with `key=psi_id`. Demo script opens the top card.

### R21 — `explain()` units (Low)
`ranker.ts:103`: "this environment needs 30 (7.8 outside…)" → add unit.

### R22 — Explorer role filter (Low)
`Explorer.tsx:102` matches secondary roles; show "also …" in the table or match primary only.

### R23 — All-zero weights (Low)
`App.tsx:48` and weight sliders: reject sum = 0 or show a message.

### R24 — Bundle size (Low)
Lazy-load `EvidenceMap` (Recharts) with `React.lazy`.

### R25 — CI and docs housekeeping (Low)
Add `npm run lint` to CI; README branch name and live URL; fill project-page links.

### R26 — Lint warning (Low)
Move `useApp`/`DISCLAIMER` out of `App.tsx` into `lib/context.ts`.

---

## From the NASA Data & Resources review (2026-11-14)

How each challenge resource is used today:

| Resource | Used in app today | Content used? |
|---|---|---|
| PSI repository | Core data | Yes |
| NASA Combustion Science page | Link in Sources | No |
| ScienceCasts video | Not linked | No |
| Researcher's Guide to ISS Combustion Science (PDF) | Link in Sources | No |
| Apollo 1, Apollo 13, Mir | One-line tiles on About | Titles only |
| Spin-offs (air tanks, fire detector, fire attire) | One-line tiles on About | Blurbs (one inaccurate) |

Guide PDF: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf (page numbers below are the printed ones).

### R27 — NASA-stated findings from the Researcher's Guide (High)
Findings NASA itself states, quotable with page numbers, so they need no AI interpretation:
- BASS: "NASA-STD-6001 Test 1 is not conservative, and materials can burn at lower oxygen levels in microgravity than on Earth" (p. 31).
- BASS: "local application of suppressant is not adequate for flame extinguishment. The local jet entrains air and sustains the flame even when the ambient airflow is turned off" (p. 31); nitrogen applied to the flame "can actually strengthen it" (p. 22).
- FLEX: "the flammability limit is lower in reduced gravity … terrestrial standards for inert gas suppressants in low gravity do not offer the same margin of safety" (p. 12); limiting oxygen index "significantly lower than in normal gravity" (p. 36); cool flames after radiative extinction (p. 36).
- Solids: the minimum-oxygen flammability limit occurs near 10 cm/s, "the velocity typical of that of spacecraft ventilation systems"; flames spread upstream at low flow; materials ignite more easily in low gravity (pp. 20, 31).
- Detection: microgravity smoke particle sizes differ, so terrestrial detectors "would be looking for something different"; SAME measured particle-size distributions; DAFT measured ISS background aerosol (pp. 26, 35).
Show these on cards, Explorer and Compare, labeled "NASA-stated finding" with page cite. AI-extracted findings (R06a) are added on top and labeled differently.

### R28 — "Three misconceptions" panel (High)
Guide p. 35 lists NASA's past misconceptions, all disproved by microgravity research: (1) a steady fire cannot exist in quiescent microgravity; (2) a fire will self-extinguish if ventilation is shut off; (3) terrestrial fire tests are conservative. Pair each with the evidence (candle/SOFBALL; BASS suppression finding; BASS and FLEX lower limits) and links to the PSI records. Strong demo and slide material.

### R29 — Ventilation airflow for presets (High)
Every preset has `flow_cm_s: null`, so the airflow factor (10% weight) is never scored and the airflow data from BASS, SAFFIRE, SAME and SPICE is unused in ranking. Guide: spacecraft ventilation range "0 to 30 cm/s" (p. 20), worst case near 10 cm/s (p. 31). Set crewed presets to a cited value (or a range) and label it "from NASA Researcher's Guide".

### R30 — Incident → lesson → evidence panel (Medium)
From the NASA pages (facts as stated there):
- Apollo 1: 100% O2 cabin, flash fire, likely wiring arcing; combustible materials restricted afterwards → prevention task; BASS, SAFFIRE, BRE; spacesuit / high-O2 presets. (Page gives no pressure; don't add a preset without a source.)
- Apollo 13: overheated tank heaters degraded Teflon insulation in the O2 tank → ignition-source control in oxygen systems; largely outside PSI's combustion data (state it, as a scope note).
- Mir 1997: solid-fuel oxygen generator fire, several minutes, dense smoke filled modules and blocked the escape route, foam extinguishers, smoke cleared by life support over hours → detection (SAME, SAME-R, DAFT) and suppression (FLEX, BASS suppression finding).
Guide p. 34 also frames this: crewed spacecraft always hold all three sides of the fire triangle.

### R33 — Keep the Guide text in the repo (Medium)
Save extracted text (`reference/researchers-guide-2015.txt`) with the source URL so R27/R06a citations can be checked by script.

### Additions to existing items
- R16: Guide p. 26: water-mist research (Mist, STS-107, 2003) led to water-mist portable extinguishers; the first two of nine were sent to the ISS in December 2015 to replace CO2 units; designed to replace banned Halon systems. Use for the Earth panel and the suppression task.
- R14: hardware specs from the Guide: CIR 100-liter chamber; MDCA droplets 1–5 mm in 0–3 atm with up to 40% O2; MSG "normally limited to ISS air", which explains why no solid-fuel table records pressure (useful text for the gap banner).
- R10: forthcoming evidence named on NASA pages: FM2 (lunar gravity), SoFIE (solid fuels, 10–40% O2 at 0.2–1.5 atm, exploration atmospheres), FLARE (ground-to-microgravity flammability correlation). List them under the partial-gravity and high-O2 gaps as "planned, not yet in PSI".

### R31 — Air-tank blurb (Low)
NASA page: JSC and Scott Aviation made a backpack system of "only 20 pounds for 30 minute air supply, 13 pounds less than conventional" tanks, at 4,500 psi. It does not mention spacesuits. Fix `earth_applications.json` blurb in `build_data.mjs`.

### R32 — ScienceCasts video (Low)
Link "NASA ScienceCasts: The Power of Studying Combustion on the ISS" (https://www.youtube.com/watch?v=W1oXykoz9zg) on About and in Sources.

---

## From the PSI data-usage review (2026-11-14)

Checked against all 24 live PSI records (`/geode-py/ws/repo/investigations/<ID>`) and the PSI search index.

**Correct:** All 24 records in PSI's "Combustion Science" research area are covered (19 ranked + 5 ground/modeling). The two exclusions (PSI-108, PSI-181) are not in that research area. Every hand-copied field (title, DOI, acronym, dates, platform, sub-area, license, file size, publication count, table file names) matches the live record; the only differences are spelling clean-ups of PSI typos ("Comparitive", "Appartatus") and shortened hardware names.

**Not used:** most of each record's content.

| PSI field | Filled | Used in app |
|---|---|---|
| `objective`, `approach`, `hypothesis`, `researchImpacts` ("Research Impacts/Earth Benefits") | 24/24 | Only as input to the AI summaries; text not shown or stored |
| `publications` (`title`, `doi`, `authorList`, `status`) | 23/24 | Title and DOI only |
| `related_glds` (PSI's own links between investigations) | 15/24 | No (modeling links hand-built) |
| Files: Reports (20), Science Documents (36), Presentations (50), Analyzed Data (248), Reference Data (57), Representative Images (9) | most | No |
| `contacts` (PI / Co-I, affiliation) | 24/24 | No |
| `experimentHardwareLink` (GRC hardware pages) | 19/24 | No |
| `Keywords`, `Thumbnail` (search index) | 24/24 | No |
| `modifiedDate`, `releaseDate`, `version` | 24/24 | No (one global snapshot date) |

| ID | Impact | Effort | Status | Issue |
|---|---|---|---|---|
| R34 | High | 1 h | todo | Show PSI objective, approach, hypothesis and research impacts verbatim (CC0) in Explorer and Compare |
| R35 | High | 2–3 h | todo | Use PSI's own Reports / Science Documents / Presentations as the source for findings (R06a, R27) |
| R36 | High | 1 h | todo | Pair each hypothesis with its finding ("tested → found") |
| R37 | Medium | 30 min | todo | Use PSI `related_glds` for related investigations (replaces hand-built links; feeds R14, R06e) |
| R38 | Medium | 30 min | todo | Per-investigation Earth benefits from `researchImpacts` (challenge's Earth objective) |
| R39 | Medium | 30 min | todo | Publications: keep authors and status; citation export (CSV/BibTeX) |
| R40 | Medium | 1 h | todo | Data inventory per investigation from PSI file categories; link GRC hardware page |
| R41 | Low | 20 min | todo | Show PI / Co-I names and affiliations (no email or phone) |
| R42 | Low | 30 min | todo | Use PSI keywords for search and tags; show representative images |
| R43 | Low | 30 min | todo | Label the 5 "modeling" studies as PSI Ground Investigations; PSI-142 has a 1-g table (use for R10) |
| R44 | Low | 15 min | todo | PSI-179 Aerosol Sampling Experiment (Complex Fluids) is relevant to detection; add as related |
| R45 | Low | 15 min | todo | Store each record's `modifiedDate`/`version`; show per-record freshness |

### R34 — PSI record text verbatim (High)
Challenge lists "experimental objectives" first. Records are CC0 (PSI-10 has no license field; cite DOI). Show the four sections collapsed in Explorer, side by side in Compare, and keep them in `investigations.json` (`text.*`, as PLAN 4.1 specified). Also lets R06d check AI text against the source. Reverses DECISIONS.md "PSI record text is not copied"; log it.

### R35 — PSI documents as findings source (High)
Examples: `PSI-25_Reports_BASS-II Summary Report.pdf`, `PSI-25_Science Documents_BASS-II_Test.Matrices.xlsx` (per-run conditions; may replace the text-derived airflow), `PSI-102_Reports_SAME_Final Science Report.pdf`, `PSI-101_Reports_SAME-R_Final Report.pdf`, `PSI-101_Presentations_SAME-2_Comparison of Flight and Ground Test Results.pptx`, `PSI-107_Reports_SPICE_FinalReport.pdf`, `PSI-107_Reports_SMOKE POINTS OF MICROGRAVITY AND NORMAL GRAVITY COFLOW DIFFUSION FLAMES` (µg vs 1-g, useful for R10), `PSI-26_Presentations_BASS_Overview of Recent ISS Results.pdf`. Download only these documents (small), not raw data. Note: FLEX, FLEX-2 and SAFFIRE-II returned no file lists in this pass; check again.

### R36 — Hypothesis → finding (High)
Example: BASS-II hypothesis (PSI): materials in microgravity "with adequate ventilation, burn as well if not better than the same material in normal gravity". Finding (Guide p. 31): Test 1 "is not conservative, and materials can burn at lower oxygen levels in microgravity". Show as "Hypothesis / What was found / Source".

### R37 — PSI related links
PSI links: BASS-II↔BASS, BASS→SPICE (shared flow duct), SAFFIRE-I↔II↔III, SAME↔SAME-R, DAFT→SAME (the instrument link the challenge mentions), CFI→FLEX, E-FIELD→s-Flame, SLICE→SPICE, modeling studies→parents. Use these instead of the hand-built `MODELING` list.

### R38 — Earth benefits per investigation
`researchImpacts` is labeled "Research Impacts/Earth Benefits" in PSI. Extract the Earth-side sentences (e.g. ACME Flame Design: "improving efficiency and reducing pollutant emissions in terrestrial combustion") into the Earth panel, linked to each investigation.
