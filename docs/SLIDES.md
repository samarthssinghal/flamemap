# Slide deck — ready to paste into Slides/PowerPoint (7 slides)

The official hard limit is **7 slides, no more**. The ~30-words-per-slide rule below is our own
readability guideline from PLAN.md, not a NASA rule — treat it as a target, not a disqualifier.
Data numbers come from `app/public/data/insights.json` and `gaps.json` (snapshot 2026-11-14), checked
against live PSI records (`docs/VERIFICATION_LOG.md`, `docs/DATA_CLEANING_LOG.md`). AI-check counts come
from the build (`app/public/data/briefs.json` → `checks`); re-read them if the AI text changes.

---

## Slide 1 — Title
**FlameMap — SI-powered fire-safety evidence briefings for crewed space missions**
NASA Space Apps Challenge 2026 · "Flame in Freefall"
{{your name}}
Live: https://samarthssinghal.github.io/flamemap/
Code: https://github.com/samarthssinghal/flamemap

*(Fill in {{your name}} — left blank deliberately rather than guessed.)*

---

## Slide 2 — Problem
- Moon and Mars habitats: at least 30% O2 at or below 10.2 psi — far more flammable than cabin air.
- NASA's PSI database: 19 microgravity combustion investigations, 1,993 experimental-table rows.
- Scattered, hard to compare, and silent about what was never tested.

*Visual: a simple O2-vs-pressure axis showing cabin air vs. the challenge-statement habitat point.*

---

## Slide 3 — Solution: an AI briefing for your mission
- Pick where the crew lives and the task: prevention, detection or suppression.
- The AI briefing says what the closest evidence found and what was never tested.
- Ask in your own words; follow every citation to its NASA source.

*Visual: screenshot of the Briefing page (lunar habitat): briefing, red "never tested" panel, closest studies.*

---

## Slide 4 — How the AI works
- Claude wrote 18 briefings, 66 answers and 42 related-study reasons, from computed data only.
- A checker rejects any unsupported number, uncited study or broken citation. A person signs off.
- In the browser, a small model matches questions by meaning. No API key, no server.

*Visual: the 7-step pipeline from the "How the AI works" page: NASA data → arithmetic → writer's context → AI writes → machine check → human review → static site.*

---

## Slide 5 — What we found (lunar habitat)
- No solid-fuel test in PSI has reached 30% oxygen — the highest is 22.2% (BASS-II).
- 37 of 875 run points reach 30% O2 or more at 75 kPa or less; none used solid fuel.
- 0 of 19 investigations ran at partial gravity — a real evidence gap.
- One hint: ACME BRE flames kept burning with no airflow at elevated oxygen, but went out at 21%.

*Visual: Evidence map screenshot with the lunar-habitat marker outside the tested cluster.*

---

## Slide 6 — Validity
- Checked at build time: 295 AI sentences, 667 citations, 311 numbers.
- Human sign-off tied to a hash of the text; any change fails the build until re-reviewed.
- Arithmetic ranks, AI explains: every score shows its math. 22 unit tests.
- A research-navigation aid, not a safety certification.

*Visual: the "Checked at build time" counts from the "How the AI works" page.*

---

## Slide 7 — Impact and next steps
- For researchers, students and engineers; exports the ranked data for modeling.
- Next: live answers for new questions (own key or hosted proxy), same checks in the browser.
- Next: findings from PSI final reports; partial-gravity data as it is published.

*Visual: none needed — end on the live URL and repo link again.*

---

### Small print (bottom of relevant slides)
Data: NASA Physical Sciences Informatics (PSI), psi.nasa.gov, snapshot 2026-11-14. Exploration
Atmosphere figures: NASA, NTRS 20220011152. Findings: NASA, A Researcher's Guide to ISS Combustion
Science (2015). AI use disclosed in `docs/PROJECT_PAGE.md` and on the app's "How the AI works" page.
