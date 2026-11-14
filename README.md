# FlameMap

Fire-safety evidence ranker for crewed space environments. NASA Space Apps 2026, challenge "Flame in Freefall".

Pick a crewed environment and a fire-safety task. FlameMap ranks NASA PSI microgravity combustion investigations by how closely their tested conditions match, shows the math per factor, and flags conditions that have never been tested.

## Run it
```
node pipeline/build_data.mjs      # writes app/public/data/*.json and validates it
cd app
npm install
npm run test                      # ranker unit tests
npm run dev                       # local site
npm run build                     # static site in app/dist
```
Deploy: push to `main` on a public GitHub repo with Pages set to "GitHub Actions" (`.github/workflows/deploy.yml`).

## Layout
- `pipeline/build_data.mjs`: PSI snapshot (2026-11-14), unit handling, provenance, computed gaps and insights, validation.
- `app/src/lib/ranker.ts`: the scoring arithmetic. `ranker.test.ts` has hand-computed cases.
- `app/src/pages`: Rank, Evidence map, Explorer, Compare, Method and sources.
- `docs/`: data cleaning log, decisions, verification log, demo script, slide outline, project page draft, QA checklist.
- `PLAN.md`: the full execution plan.

## Data
NASA Physical Sciences Informatics (PSI), https://psi.nasa.gov. Every investigation is cited by DOI on the "Method and sources" page.

FlameMap is a research-navigation aid. It does not predict fire behavior, assess risk or certify safety, and it is not NASA guidance.
