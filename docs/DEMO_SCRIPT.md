# Demo script (30 seconds maximum; see SUBMISSION_REQUIREMENTS.md: a 7-slide deck or a video of 30 s or less)

About 80 spoken words. Record at 1080p, browser zoom 100%, captions on, hard cut at 29 s. The story: the AI is the front door, every claim is checked, and the math is one click away.

| Time | Screen | Voice-over |
|---|---|---|
| 0-6 s | Briefing (home), "Lunar surface habitat" selected; the AI briefing fills the screen | "Which NASA fire experiments apply to a Moon base? FlameMap's AI briefing answers from decades of space-station data." |
| 6-12 s | Hover a citation chip in the briefing, then the "AI interpretation" label | "Claude wrote every sentence ahead of time. A checker verified each number and citation against NASA's data, and a person reviewed it." |
| 12-17 s | Scroll to "What has never been tested here" | "It shows what is missing: no solid fuel above 22.2% oxygen, nothing at lunar gravity." |
| 17-24 s | Ask the evidence: type "if I turn off the fans will the fire stop"; the ventilation answer appears; click a follow-up | "Ask in your own words. A small model in your browser matches your question by meaning. No API key, no server." |
| 24-29 s | How the AI works: the "Checked at build time" counts; end on the site address | "Arithmetic ranks, AI explains, every claim checked. Built on NASA's PSI database." |

Numbers used: 22.2% is the highest oxygen level in any solid-fuel data table (BASS-II, `insights.json`); 0 investigations ran at partial gravity (`gaps.json`). The counts on "How the AI works" come from the build (`briefs.json` → `checks`).

Direct links for recording:
- Briefing: `#/?env=moon_base&task=prevent`
- Ask (empty, to type live): `#/ask`. Focus the question box a few seconds before typing so the in-browser model (about 30 MB, once) has loaded; the status line under the box then reads "Matched by meaning".
- How the AI works: `#/ai`
- If time allows a cut to the math: `#/rank?env=moon_base&task=prevent`

If a video is AI-generated or AI-edited in any way, it needs a visible watermark (SUBMISSION_REQUIREMENTS.md). A plain screen recording with a human voice-over does not.
