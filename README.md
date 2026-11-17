# FlameMap

SI-powered fire-safety evidence briefings for crewed space missions. NASA Space Apps 2026, challenge "Flame in Freefall".

Live: https://samarthssinghal.github.io/flamemap/

Choose where your crew will live (station cabin, lunar habitat, Mars habitat, spacesuit, NASA's Exploration Atmosphere…) and what you are working on (prevention, detection, suppression). FlameMap's AI briefing explains what 19 NASA microgravity combustion investigations say about fire safety there and what has never been tested, with a citation on every sentence. Ask your own questions in plain words, or open the ranking to see the arithmetic behind every match score.


## Run it
```
node pipeline/fetch.mjs             # optional: download PSI records + tables into pipeline/raw/ (cached; already committed)
node pipeline/build_data.mjs        # parses pipeline/raw/, writes app/public/data/*.json, validates against pipeline/expected.json
node pipeline/ai_build.mjs          # checks the AI-written text against the computed data, writes briefs/qa/related JSON
                                    #   and docs/AI_TEXT_REVIEW.md (add --context to regenerate pipeline/ai/context.*)
cd app
npm install
node ../pipeline/embed.mjs          # semantic search for Ask the evidence: embeds the checked questions, copies the
                                    #   embedding model and its runtime into app/public (optional: without it, Ask
                                    #   falls back to keyword matching)
npm run test                        # ranker, checker and matcher unit tests (22)
npm run dev                         # local site
npm run build                       # static site in app/dist
```
Needs Node 24 (`ai_build.mjs` imports the app's `ranker.ts` directly, using Node's built-in TypeScript type stripping).

Deploy: push to `master`. GitHub Actions (`.github/workflows/deploy.yml`) runs both pipeline scripts, the tests and the build, then publishes to GitHub Pages.

## Layout
- `pipeline/fetch.mjs`: downloads the 24 PSI records (trimmed) and 22 experimental tables into `pipeline/raw/`, with sha256 in `raw/manifest.json`.
- `pipeline/tables.mjs`: parses the tables (unit conversions, cleaning rules) into ranges, run counts and run points with source file and row.
- `pipeline/build_data.mjs`: classification, provenance, computed gaps and insights, key findings (`pipeline/findings.json`, each checked against its quote, record text or table cells), human sign-offs (`pipeline/reviews.json`), validation; fails if any computed number differs from `pipeline/expected.json` (accept intended changes with `--accept`).
- `pipeline/ai_build.mjs` and `pipeline/ai/`: the AI layer. `context.md` is everything the AI writer is given (computed rankings for every preset and task, gaps, findings, investigation facts, statistics). `briefs.json`, `qa.json` and `related.json` are the AI-written text; `meta.json` says who wrote it and holds the human sign-off. The script fails on any sentence whose numbers, cited IDs or named studies are not backed by the computed data, and publishes counts of what it checked.
- `pipeline/embed.mjs`: embeds the checked questions, paraphrases and findings for semantic search (`app/public/data/qa_vectors.json`) and copies the embedding model and its WebAssembly runtime into the site.
- `app/src/lib/ranker.ts`: the scoring arithmetic. `ranker.test.ts` has hand-computed cases.
- `app/src/lib/verify.ts` (sentence checks shared by the build and the browser), `match.ts` (scoring questions by meaning and keywords), `semantic.ts` (loads the in-browser model), `answer.ts` (answer providers). `verify.test.ts` covers the checker and the matcher.
- `app/src/pages`: Briefing (home: the AI briefing, gaps, closest studies, suggested questions), Ask the evidence (a conversation over the checked answers), How the AI works, Rank (the math), Evidence map, Explorer (each study opens with its checked AI answer and "Studies like this one"), Compare, Method and sources.
- `reference/`: the challenge statement, NASA resources list, and the text of NASA's Researcher's Guide to ISS Combustion Science (source of most findings).
- `docs/`: review issues tracker, AI plan and AI-first restructure plan (`AI_FIRST_PLAN.md`), AI text review sheet, data cleaning log, decisions, verification log, human tasks, review sheets, demo script, slide outline, project page draft, QA checklist.
- `PLAN.md`: the original execution plan, updated where the build differs.

## Data
NASA Physical Sciences Informatics (PSI), https://psi.nasa.gov. Every investigation is cited by DOI on the "Method and sources" page.

FlameMap is a research-navigation aid. It does not predict fire behavior, assess risk or certify safety, and it is not NASA guidance.
