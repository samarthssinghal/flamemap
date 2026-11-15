# Project page draft (edit until every sentence is true of what the team did)

## High-level summary
FlameMap helps researchers, students and engineers find which NASA microgravity combustion experiments apply to a given crewed environment. You pick an environment (station cabin, lunar habitat, rover, Mars habitat, spacesuit or your own values) and a fire-safety task (prevention, detection or suppression). FlameMap ranks 19 flight investigations from NASA's Physical Sciences Informatics (PSI) database by how closely their tested oxygen, pressure, airflow and gravity match, shows the calculation for every score, links each value to its source, flags conditions that have never been tested, and explains in plain language what the closest evidence found, with a citation on every sentence.

## Project details
- **What it does.** Rank page with per-factor breakdown and a "What the evidence says" brief for each environment and task (closest evidence, what it found, what was never tested, what to read next); evidence map of 875 runs by oxygen and pressure with the chosen environment marked; key findings on every study, each with its NASA source quote; "Ask the evidence", 16 researcher questions with cited answers; explorer with search, filters and "studies like this one"; side-by-side comparison; CSV and JSON export.
- **How it works.** We read the PSI records and their experimental tables, converted units, and stored every condition with its source and a confidence label. The ranking is transparent arithmetic: distance from the environment to the tested range for each factor, combined with adjustable weights. A condition a study did not record counts as untested, so missing data never raises a score; for experiments in station cabin air with no oxygen or pressure column, cabin air is assumed and labeled.
- **How the AI is kept honest.** AI writes the findings, briefs and answers at build time, from the PSI record text, NASA's Researcher's Guide and the computed rankings and gaps. A script fails the build if any quote is not word for word in its source, any number is not in what the sentence cites, any study is named without being cited, or any study called "closest evidence" is not in the computed top five. The app labels all AI text and says whether a person has reviewed it.
- **What we found for a lunar habitat (30% O2, 70.3 kPa, 0.166 g).** The highest oxygen level in any solid-fuel data table is 22.2% (BASS-II). 37 runs reach 30% oxygen or more at 75 kPa or less, all with gas or liquid-droplet fuels. No solid-fuel table records pressure. None of the 19 investigations ran at partial gravity. The one direct hint about higher oxygen comes from ACME BRE, whose record reports that emulated material flames kept burning without airflow in elevated-oxygen atmospheres but went out at 21% oxygen; NASA also states its 1-g materials test is not conservative in microgravity.
- **Limits.** It is a research-navigation aid. It does not predict fire behavior or certify safety.
- **Tools.** TypeScript, React, Vite, Recharts, Node.js, Vitest, Claude Code (AI assistant).

## How it addresses the challenge
| Challenge ask | Feature |
|---|---|
| Summarize investigations | Explorer and detail panels |
| Rank by relevance to crewed environments | Rank page |
| Interpret | "What the evidence says" briefs, key findings with NASA quotes, Ask the evidence, per-factor explanations and computed gap statements |
| Data for predictive modeling | CSV and JSON export of the table, ranking and run data |
| Research informing controls and equipment | Task selector and role filter (prevention, detection, suppression) |
| Compare attributes across investigations | Compare page; "Studies like this one" (PSI's own links, shared hardware and fuel) |
| Earth applications | NASA spin-off links on the Method page |

## NASA data and resources
PSI Data Repository, combustion science (https://psi.nasa.gov): records PSI-10, 20, 21, 22, 23, 25, 26, 39, 47, 68, 69, 98, 99, 100, 101, 102, 106, 107, 159 (ranked) and PSI-60, 62, 115, 117, 142 (linked modeling studies). We used the record descriptions and the "Experimental table" files, and NASA's "A Researcher's Guide to: ISS Combustion Science" (2015) for findings, cited by page. DOIs are listed on the app's Method and sources page. Also linked: NASA spin-off pages and NASA history pages from the challenge Resources tab.

## Use of artificial intelligence
We used an AI assistant (Anthropic Claude, through Claude Code) to help plan the project, write the code, read PSI record text to fill in descriptive fields, draft the short summaries, and write the key findings, the environment briefs, the Ask the evidence answers and the related-study reasons. All of this text is generated before the site is built, only from the PSI records, NASA's Researcher's Guide and the computed data, and a script checks every quote, number and citation against those sources. All AI text is labeled in the app. The ranking uses arithmetic, not an AI model. No AI-generated images or video are used. [Edit: describe the team's own checks and decisions here, and only claim reviews that were actually done.]

## Links
Live app: https://samarthssinghal.github.io/flamemap/ · Code: https://github.com/samarthssinghal/flamemap · Demo: [URL] · Slides: [URL]
