# Slide deck — ready to paste into Slides/PowerPoint (7 slides)

The official hard limit is **7 slides, no more**. The ~30-words-per-slide rule below is our own
readability guideline from PLAN.md, not a NASA rule — treat it as a target, not a disqualifier.
All numbers below are pulled directly from `app/public/data/insights.json` and `gaps.json`
(snapshot date 2026-11-14) and were spot-checked against live PSI pages — see
`claude/build-status.md` and `docs/DATA_CLEANING_LOG.md`.

---

## Slide 1 — Title
**FlameMap — Fire-Safety Evidence Ranker for Crewed Space Environments**
NASA Space Apps Challenge 2026 · "Flame in Freefall"
{{your name}}
Live: https://samarthssinghal.github.io/flamemap/
Code: https://github.com/samarthssinghal/flamemap

*(Fill in {{your name}} — left blank deliberately rather than guessed.)*

---

## Slide 2 — Problem
- Future habitats: at least 30% O2 at or below 10.2 psi — far more flammable than cabin air.
- NASA's PSI database holds 19 microgravity combustion investigations, 1,993 experimental-table rows.
- Scattered across the archive and hard to compare.

*Visual: a simple O2-vs-pressure axis showing cabin air vs. the challenge-statement habitat point.*

---

## Slide 3 — Solution
- Pick a crewed environment and a fire-safety task.
- FlameMap ranks all 19 PSI investigations by how closely their tested conditions match — the math is shown for every score.

*Visual: screenshot of the Rank page.*

---

## Slide 4 — Data and method
- PSI records and tables → unit conversion → a source on every value → static JSON → ranker in the browser.
- Match = 100 × (1 − weighted distance to the tested range).
- AI extracts and summarizes; the arithmetic ranks.

*Visual: the 4-step pipeline diagram above, drawn simply.*

---

## Slide 5 — What we found (lunar habitat)
- No solid-fuel test in PSI has reached 30% oxygen — the highest is 22.2% (BASS-II).
- 83 of 1,138 run points reach 30% O2 or more at 75 kPa or less; none of them used solid fuel.
- 0 of 19 investigations ran at partial gravity — a real evidence gap, not just a low score.

*Visual: Evidence Map screenshot with the lunar-habitat marker sitting outside the tested cluster.*

---

## Slide 6 — Validity and limits
- 11 hand-computed unit tests pass.
- Every value traces to a PSI table, record text, or a cited NASA source — including NASA's own proposed Exploration Atmosphere preset (34% O2, 8.2 psia), added and sourced today.
- Labeled a screening aid, not a safety certification.

*Visual: a single data card showing its "source" chips.*

---

## Slide 7 — Impact and next steps
- Built for researchers, students and engineers — the audience the challenge names.
- Exports the ranked data for further modeling.
- Next: add partial-gravity data as LUCI and FM2 publish it; pull in NTRS publication text.

*Visual: none needed — end on the live URL and repo link again.*

---

### Small print (bottom of relevant slides)
Data: NASA Physical Sciences Informatics (PSI), psi.nasa.gov, snapshot 2026-11-14. Exploration
Atmosphere figures: NASA, NTRS 20220011152. AI assistance disclosed in `docs/PROJECT_PAGE.md`.
