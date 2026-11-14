# Slide outline (7 slides maximum; confirm the limit in the live guide)

1. **FlameMap.** Fire-safety evidence ranker for crewed space environments. Team, challenge "Flame in Freefall", live URL, repo URL.
2. **Problem.** Future habitats plan more oxygen at lower pressure (challenge statement: at least 30% O2 at or below 10.2 psi). PSI holds 19 flight combustion investigations, 1,993 experimental-table rows and 325 listed publications, but they are hard to compare.
3. **Solution.** Screenshot of the Rank page. Choose an environment and a task; get ranked evidence with visible math.
4. **Data and method.** PSI records and tables -> unit conversion -> a source on every value -> static JSON -> ranker in the browser. One line: match = 100 x (1 - weighted distance to the tested range). AI extracts and summarizes; arithmetic ranks.
5. **What we found (lunar habitat).** Evidence map screenshot. (a) Highest oxygen in any solid-fuel table: 22.2%; the habitat needs 30%. (b) 83 runs at 30% oxygen or more and 75 kPa or less, none with solid fuels. (c) 0 of 19 investigations at partial gravity.
6. **Validity and limits.** Hand-computed unit tests; ranges cross-checked; cleaning log; "assumed" labels; not a risk predictor.
7. **Impact and next steps.** For researchers, students and engineers; export for modeling; add partial-gravity data (LUCI, FM2) when released; add publication data from NTRS.

Rules: at most 30 words per slide besides labels; one visual per slide; sources in small print.
