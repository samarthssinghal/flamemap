# Project page draft (edit until every sentence is true of what the team did)

## High-level summary
FlameMap helps researchers, students and engineers find which NASA microgravity combustion experiments apply to a given crewed environment. You pick an environment (station cabin, lunar habitat, rover, Mars habitat, spacesuit or your own values) and a fire-safety task (prevention, detection or suppression). FlameMap ranks 19 flight investigations from NASA's Physical Sciences Informatics (PSI) database by how closely their tested oxygen, pressure, airflow and gravity match, shows the calculation for every score, links each value to its source, and flags conditions that have never been tested.

## Project details
- **What it does.** Rank page with per-factor breakdown; evidence map of 1,138 runs by oxygen and pressure with the chosen environment marked; explorer with search and filters; side-by-side comparison; CSV and JSON export.
- **How it works.** We read the PSI records and their experimental tables, converted units, and stored every condition with its source and a confidence label. The ranking is transparent arithmetic: distance from the environment to the tested range for each factor, combined with adjustable weights. Unknown values are skipped, never treated as zero.
- **What we found for a lunar habitat (30% O2, 70.3 kPa, 0.166 g).** The highest oxygen level in any solid-fuel data table is 22.2% (BASS-II). 83 runs reach 30% oxygen or more at 75 kPa or less, all with gas or liquid-droplet fuels. No solid-fuel table records pressure. None of the 19 investigations ran at partial gravity.
- **Limits.** It is a research-navigation aid. It does not predict fire behavior or certify safety.
- **Tools.** TypeScript, React, Vite, Recharts, Node.js, Vitest.

## How it addresses the challenge
| Challenge ask | Feature |
|---|---|
| Summarize investigations | Explorer and detail panels |
| Rank by relevance to crewed environments | Rank page |
| Interpret | Per-factor explanations and computed gap statements |
| Data for predictive modeling | CSV and JSON export of the table, ranking and run data |
| Research informing controls and equipment | Task selector and role filter (prevention, detection, suppression) |
| Compare attributes across investigations | Compare page |
| Earth applications | NASA spin-off links on the Method page |

## NASA data and resources
PSI Data Repository, combustion science (https://psi.nasa.gov): records PSI-10, 20, 21, 22, 23, 25, 26, 39, 47, 68, 69, 98, 99, 100, 101, 102, 106, 107, 159 (ranked) and PSI-60, 62, 115, 117, 142 (linked modeling studies). We used the record descriptions and the "Experimental table" files. DOIs are listed on the app's Method and sources page. Also linked: NASA spin-off pages and NASA history pages from the challenge Resources tab.

## Use of artificial intelligence
We used an AI assistant (Anthropic Claude) to help plan the project, write the code, read PSI record text to fill in descriptive fields, and draft the short summaries shown in the app. AI-drafted summaries are labeled in the app. The ranking uses arithmetic, not an AI model. [Edit: describe the team's own checks and decisions here, and only claim reviews that were actually done.]

## Links
Live app: [URL] · Code: [URL] · Demo: [URL] · Slides: [URL]
