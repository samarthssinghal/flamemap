# FlameMap

SI-powered fire-safety evidence briefings for crewed space missions. NASA Space Apps 2026, challenge "Flame in Freefall".

Live: https://samarthssinghal.github.io/flamemap/

Choose where your crew will live (station cabin, lunar habitat, Mars habitat, spacesuit, NASA's Exploration Atmosphere…) and what you are working on (prevention, detection, suppression). FlameMap's AI briefing explains what 19 NASA microgravity combustion investigations say about fire safety there and what has never been tested, with a citation on every sentence. Ask your own questions in plain words, or open the ranking to see the arithmetic behind every match score.

## The AI, and how it is kept honest
- **AI writes the interpretation.** Claude Opus 5.5 (through Claude Code) wrote the 18 briefings, 66 answers on "Ask the evidence" (with 198 paraphrases for matching), 42 "Studies like this one" reasons and 20 key findings, from `pipeline/ai/context.md` only: the computed rankings, gaps, investigation facts and checked findings.
- **A script checks every sentence.** `pipeline/ai_build.mjs` (rules in `app/src/lib/verify.ts`) fails the build on any number not found in what the sentence cites, any study named without being cited, any citation that does not resolve, or any "closest evidence" claim outside the computed top five. Current text: 295 sentences, 667 citations, 311 numbers, all passing. Findings must match their NASA quote or table cells word for word (`pipeline/build_data.mjs`).
- **A person reviews it.** `docs/AI_TEXT_REVIEW.md` lists every sentence with its sources expanded; the sign-off in `pipeline/ai/meta.json` is tied to a hash of the text, and the build fails if the text changes afterwards.
- **No keys, no server.** The text is written ahead of time and ships as static JSON. "Ask the evidence" matches a visitor's question to the checked answers by meaning, with a small sentence-embedding model (all-MiniLM-L6-v2) running in the browser from the site's own files; it compares questions and never generates text. Until the model loads, or if it cannot, keyword matching answers.
- **Arithmetic ranks, AI explains.** Match scores and gap statements are plain arithmetic on the PSI data, so every result can be checked by hand. The AI cannot change a ranking.
- **Built to extend.** Answers come through an `AnswerProvider` interface (`app/src/lib/answer.ts`). A live mode (a visitor's own Anthropic key, or a hosted proxy with rate limits and a spending cap) would plug in there and run its sentences through the same checks in the browser. It is designed, not enabled.
- Study summaries are AI-drafted from the PSI record text and labeled; their human review is still pending. The code was written with an AI coding assistant (Anthropic Claude).

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
