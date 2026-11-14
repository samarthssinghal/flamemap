# Review issues tracker

Source: code and data review, 2026-11-14. Ordered from highest to lowest impact on judging (validity, relevance to the challenge, presentation).
Status values: `todo` · `in progress` · `done` · `skipped`. Effort is a rough estimate for one person with an agent.

| ID | Impact | Effort | Status | Issue |
|---|---|---|---|---|
| R01 | Critical | 1–2 h | todo | Inverse-flame O2 (burner oxidizer stream) treated as ambient O2 |
| R02 | Critical | 1 h | todo | Missing data raises the score (renormalization rewards unknowns) |
| R03 | High | — | todo | No "findings": app ranks conditions, never interprets results (done via R06a) |
| R04 | High | 2–3 h | todo | Pipeline not reproducible: hand-copied constants, no raw data in repo |
| R05 | High | 1–2 h (human) | todo | Human verification steps not done (H1, H4, H5, links, phone) |
| R06 | Critical | see subtasks | todo | Add the super-intelligence (SI) layer the challenge title asks for (subtasks R06a–R06e) |
| R06a | Critical | 3–4 h | todo | SI: AI-extracted key findings per investigation, each with a quote and source (merges with R03) |
| R06b | Critical | 2–3 h | todo | SI: AI interpretation brief for each environment + task (what the evidence says, what's missing) |
| R06c | High | 3–4 h | todo | SI: "Ask the evidence" Q&A in the app, answers cited to PSI records only |
| R06d | High | 1 h | todo | SI guardrails: machine check that every number/quote in AI text exists in the source; label AI text |
| R06e | Medium | 1 h | todo | SI: AI-suggested related investigations ("studies like this one") with reasons |
| R07 | High | 30 min | todo | Same metric shows two numbers (387 vs 392); custom env has no gaps |
| R08 | Medium | 2–3 h | todo | Exports not useful for modeling: ranges and bins only, no per-run rows or outcomes |
| R09 | Medium | 1 h | todo | Gravity factor never discriminates; SAFFIRE-II 1-g data not used |
| R10 | Medium | 1–2 h | todo | Partial-gravity framing missing (E-FIELD analog, µg/1-g bounding) |
| R11 | Medium | 30 min | todo | Assumed (low-confidence) pressure scored at full weight |
| R12 | Medium | 30 min | todo | DAFT (no combustion) ties for #1 on every detection ranking |
| R13 | Medium | 2 h | todo | No controls/equipment view (detection, suppression, ventilation) |
| R14 | Medium | 1–2 h | todo | No hardware-family / similarity view (ACME-CIR, MDCA, MSG duct, SAME↔DAFT) |
| R15 | Medium | 15 min | todo | Slides and project page contain numbers affected by R01 |
| R16 | Low | 20 min | todo | Earth panel misses fine-water-mist extinguishers (named in challenge) |
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

---

## Details

### R01 — Inverse-flame O2 treated as ambient O2 (Critical)
In inverse flames the chamber holds fuel + N2 (`Xf before test`); `XO2` is the O2 fraction of the burner's oxidizer stream. Verified in `PSI-159_Experimental table_CFI-G_Inverse Flames.csv` (154 rows, 102 with XO2 ≥ 0.5). PSI-10 Flame Design inverse table very likely the same (verify).
- Where: `pipeline/build_data.mjs:96,102` (O2 ranges up to 85%), `BINS`, `RUN_STATS.o2_ge_30*`, `o2_any` gap.
- Effect: Evidence Map shows atmospheres to 85% O2; gap "highest O2 tested 85%"; Slide 5 "83 runs ≥30% O2 at ≤75 kPa"; spacesuit + suppression ranks Flame Design and CFI-G first only because of this.
- Fix: split normal vs. inverse; exclude inverse rows from ambient-O2 ranges and coverage counts (or plot them separately labeled "oxidizer stream"); recompute bins, insights, gaps.

### R02 — Missing data raises the score (Critical)
`ranker.ts:65-68` skips unknown factors and rescales weights. Spacesuit + prevention ranks BASS and SAFFIRE-III #1/#2 though neither recorded O2.
- Fix options: unknown factor → fixed distance (e.g. 0.5); or relevance × completeness; or sort by completeness band first. Update tests (spec test 6 changes) and the About page text.

### R03 — No findings / interpretation (High)
Challenge: "summarizes, ranks, and interprets those findings". Summaries say what was done, not what was learned. Tables have outcome columns (CFI-G hot ignition, burn time, self-extinction; SAFFIRE-II burn length; FLEX extinction).
- Fix: per-investigation "Key findings" (3–5 bullets) with a quote and source (PSI text, table column, or publication), shown on cards, Explorer and Compare. Start with the top ~8 fire-safety studies.

### R04 — Pipeline not reproducible (High)
Values were transcribed by hand into constants; `pipeline/raw/` is empty. PSI is reachable from this machine now.
- Fix: fetch script (PLAN P1.2, rate-limited, cached), commit trimmed record JSON + CSVs, parse ranges/bins/counts from them, keep current numbers as regression checks.

### R05 — Human verification outstanding (High, human)
H1 (`SUBMISSION_REQUIREMENTS.md` empty: demo/slide limits unconfirmed), H4 (10 fields vs live PSI), H5 (read 19 summaries; `human_reviewed` all false), external link check, phone check, keyboard/screen-reader check.

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
