# Decisions

- Single-person execution; static site (Vite + React + TypeScript), no backend. Ranker runs in the browser.
- The pipeline is one Node script (`pipeline/build_data.mjs`) instead of the Python scripts in PLAN.md, because PSI was reachable only from a browser. See DATA_CLEANING_LOG.md.
- PSI record text is not copied into the app. The app shows short summaries and links to the PSI record. Publication lists are shown as counts with a link.
- Fire-safety roles follow the challenge statement grouping. Secondary role "suppression" is given to BASS and BASS-II (extinguishing-agent objective and title) and FLEX-2 (flame extinction objective). SPICE and SAFFIRE-I have no secondary role.
- ACME BRE is classed as prevention with fuel class gas: it emulates solid and liquid burning with a gas burner.
- Environment presets: lunar habitat, rover and spacesuit values come from the challenge statement. The Mars habitat atmosphere is our assumption. Station values cite the PSI-20 objectives text.
- Tailwind was not used; one plain CSS file.
- Earth applications and history links are a section of the "Method and sources" page instead of a separate page.
- Shareable links: the selection is stored after the # in the address (env, task, w, c, cmp). The address always follows the on-screen state, so editing it in an open tab has no effect; open the link in a new tab.
- Accessibility: skip link, labeled button groups, status text next to every icon, live announcement when the ranking changes, details panel as a dialog with focus handling, and a data-table alternative to the chart.
