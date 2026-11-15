# FlameMap

Fire-safety evidence ranker for crewed space environments. NASA Space Apps 2026, challenge "Flame in Freefall".

Live: https://samarthssinghal.github.io/flamemap/

Pick a crewed environment and a fire-safety task. FlameMap ranks NASA PSI microgravity combustion investigations by how closely their tested conditions match, shows the math per factor, flags conditions that have never been tested, and explains what the evidence says with citations on every sentence.

## Run it
```
node pipeline/fetch.mjs             # optional: download PSI records + tables into pipeline/raw/ (cached; already committed)
node pipeline/build_data.mjs        # parses pipeline/raw/, writes app/public/data/*.json, validates against pipeline/expected.json
node pipeline/ai_build.mjs          # checks the AI-written text against the computed data, writes briefs/qa/related JSON
                                    #   and docs/AI_TEXT_REVIEW.md (add --context to regenerate pipeline/ai/context.*)
cd app
npm install
npm run test                        # ranker unit tests (13)
npm run dev                         # local site
npm run build                       # static site in app/dist
```
Needs Node 24 (`ai_build.mjs` imports the app's `ranker.ts` directly, using Node's built-in TypeScript type stripping).

Deploy: push to `master`. GitHub Actions (`.github/workflows/deploy.yml`) runs both pipeline scripts, the tests and the build, then publishes to GitHub Pages.

## Layout
- `pipeline/fetch.mjs`: downloads the 24 PSI records (trimmed) and 22 experimental tables into `pipeline/raw/`, with sha256 in `raw/manifest.json`.
- `pipeline/tables.mjs`: parses the tables (unit conversions, cleaning rules) into ranges, run counts and run points with source file and row.
- `pipeline/build_data.mjs`: classification, provenance, computed gaps and insights, key findings (`pipeline/findings.json`, each checked against its quote, record text or table cells), human sign-offs (`pipeline/reviews.json`), validation; fails if any computed number differs from `pipeline/expected.json` (accept intended changes with `--accept`).
- `pipeline/ai_build.mjs` and `pipeline/ai/`: the AI layer. `context.md` is everything the AI writer is given (computed rankings for every preset and task, gaps, findings). `briefs.json`, `qa.json` and `related.json` are the AI-written text; `meta.json` says who wrote it and holds the human sign-off. The script fails on any sentence whose numbers, cited IDs or named studies are not backed by the computed data.
- `app/src/lib/ranker.ts`: the scoring arithmetic. `ranker.test.ts` has hand-computed cases.
- `app/src/pages`: Rank (with the "What the evidence says" brief), Evidence map, Explorer (with "Studies like this one"), Ask the evidence, Compare, Method and sources.
- `reference/`: the challenge statement, NASA resources list, and the text of NASA's Researcher's Guide to ISS Combustion Science (source of most findings).
- `docs/`: review issues tracker, AI plan, data cleaning log, decisions, verification log, human tasks, review sheets, demo script, slide outline, project page draft, QA checklist.
- `PLAN.md`: the original execution plan, updated where the build differs.

## How AI is used
- **Ranking: no AI.** Scores and gap statements are plain arithmetic on the PSI data, so every result can be checked by hand.
- **Summaries and findings:** AI-drafted from the PSI record text and NASA's Researcher's Guide. Every finding carries its exact quote or table cells, checked at build time.
- **Briefs, Ask the evidence, related studies:** written by AI (Claude Code, Claude Opus 5.5) at build time from the computed data only, and checked sentence by sentence by `pipeline/ai_build.mjs`. "Ask the evidence" matches questions to these checked answers in the browser; it does not generate text and needs no API key.
- All AI text is labeled in the app, including whether a person has reviewed it yet.
- The code was written with an AI coding assistant (Anthropic Claude).

## Data
NASA Physical Sciences Informatics (PSI), https://psi.nasa.gov. Every investigation is cited by DOI on the "Method and sources" page.

FlameMap is a research-navigation aid. It does not predict fire behavior, assess risk or certify safety, and it is not NASA guidance.
