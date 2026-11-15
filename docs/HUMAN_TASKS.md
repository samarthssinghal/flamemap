# Human tasks (R05)

Things only a person can do. Work through them in parallel with the agent's code work. **Deadline: Sunday 15 Nov 2026, 11:59 p.m., local time of our Local Event.**

Tick each box when done and note anything odd under "Notes". When you finish a section, commit (or tell the agent).

## 1. Eligibility (H2), 10 min, do first
Nothing else matters if this fails. Details: `docs/SUBMISSION_REQUIREMENTS.md` → Eligibility.
- [ ] Every team member is registered for the 2026 NASA Space Apps Challenge.
- [ ] Every member, including the Team Owner, is **confirmed** (not waitlisted) for the **same** Local Event.
- [ ] Every member appears on the team page's Members tab (members can't be added after submission closes).
- [ ] The challenge "Flame in Freefall" is selected for the team.
- [ ] The project page's "Project" tab is visible and editable.

## 2. Field check against live PSI (H4), 20 min
Table with the 10 values: `docs/VERIFICATION_LOG.md` → "H4". A script already agrees with all of them; this is the independent check.
- [ ] For each row: open the PSI record, open its "Experimental table" CSV, find the min or max of the named column, apply the conversion, compare with the app value.
- [ ] Write your initials and date in the "Checked by / date" column of each row.
- [ ] In `pipeline/reviews.json`, add each checked investigation under `"fields"`:
  `"PSI-25": { "by": "SS", "date": "2026-11-15" }` (PSI-25, PSI-69, PSI-39, PSI-10, PSI-159).
- [ ] Run `node pipeline/build_data.mjs` (it must pass).

## 3. Read the AI summaries (H5), 20–30 min
Sheet: `docs/SUMMARY_REVIEW.md` (19 entries; each summary sits above its PSI record text).
- [ ] For each: is everything in the summary and "why it matters" supported by the record text? Anything misleading? Do the role (prevention / detection / suppression) and fuel class fit?
- [ ] If fine: tick its box and paste its approval line into `"summaries"` in `pipeline/reviews.json` with your initials and date. Drop the trailing comma on the last entry.
- [ ] If not fine: write the problem under "Notes" for that entry and leave it unapproved. The agent will fix it, and you review it again (the hash changes).
- [ ] Run `node pipeline/build_data.mjs` (it must pass; it stops if a hash doesn't match).

## 4. Hands-on checks of the live site, 20 min
Site: https://samarthssinghal.github.io/flamemap/
- [ ] **Phone:** open the site in a private or incognito window on a real phone. All five pages load, nothing is cut off, the details panel opens and closes.
- [ ] **Keyboard:** tab through every page without a mouse. The skip link appears first, focus is always visible, the details panel opens with Enter and closes with Esc, and the sliders work with the arrow keys.
- [ ] **Screen reader** (VoiceOver: Cmd+F5 on Mac): on the Rank page, headings and the top card's score and explanation are read in a sensible order; buttons have names.
- [ ] **Links:** click each external link on the About and Method & sources pages, plus one PSI and one DOI link on a card. Each opens the right page, not just any page.
- [ ] Tick the matching boxes in `docs/QA_CHECKLIST.md`.

## 5. Submission decisions and form, 30 min, before the deadline
Field list: `docs/SUBMISSION_REQUIREMENTS.md`.
- [ ] Decide the demo format: **7-slide deck or video of 30 s or less** (one is enough). Slides must show the team name, team members' names and the challenge.
- [ ] Upload the demo with a public link (no login) and test it in a private window.
- [ ] Any AI-generated image or video in the demo carries a visible watermark.
- [ ] Fill every project-page field from `docs/PROJECT_PAGE.md`. Replace the `[Edit: …]` note in the AI section with what the team actually checked (sections 2 and 3 above).
- [ ] Optional: request a FortiGuard Web Filter Classification for the site (Category: Education or Web-based Application; Company Name: N/A).
- [ ] Tick "Terms and Conditions" and "Confirm All Work is Original", then **Submit for Judging**. Confirm the success banner. (You can resubmit until the deadline.)

## Notes
-
