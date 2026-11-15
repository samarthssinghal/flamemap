# Plan: adding AI ("super intelligence") without a backend

> **Status (2026-11-14):** built as planned for R06a, R06b, R06d, R06e and R06c option 3, with the content written by Claude Code in a development session (option 1 under "Who generates"). Not built yet: the free-form "bring your own key" mode, the re-runnable generator script with an API key (option 2), and findings from PSI reports (R35). Differences from the plan below:
> - Findings: 20 for 11 of 19 studies, from the Guide, PSI record text and PSI tables (`pipeline/findings.json`, checked by `build_data.mjs`). PSI record text states few results, so 8 studies still have none.
> - Briefs: 18 files cover all 24 preset × task views (Moon, rover and Mars share a brief per task). No brief for a custom environment, since it cannot be checked ahead of time; a note shows when weights differ from the defaults.
> - Q&A: 16 curated questions; the "Ask the evidence" page matches typed questions to them by keywords. No live model call anywhere in the site.
> - Related: 42 links. All PSI `related_glds` links are required; every claimed basis (PSI link, hardware family, fuel, role, shared finding) is checked against the data.
> - Verifier: `pipeline/ai_build.mjs` (it imports the app's `ranker.ts`, so it checks against exactly what the app shows). Human review: `docs/AI_TEXT_REVIEW.md`, signed off with a content hash in `pipeline/ai/meta.json`. Details in REVIEW_ISSUES R06.

The idea is to split the AI work into two parts. The heavy AI work runs ahead of time and is saved as static JSON files, which GitHub Pages can serve. An optional live mode runs entirely in the visitor's browser with their own API key. Nothing needs a server, and the site costs nothing to run.

```
BUILD TIME (AI runs once, before deploy)          RUNTIME (static site, GitHub Pages)
────────────────────────────────────────          ────────────────────────────────────
PSI record text (R34)  ┐                          Rank / Explorer / Compare
PSI reports & docs (R35)├─► AI extraction ─► findings.json   ─► "Key findings" with quotes
Researcher's Guide (R33)┤      + verifier ─► briefs.json     ─► "What the evidence says" per environment
Computed ranking & gaps ┘   (fails build    ─► qa.json         ─► "Ask the evidence" (no key: curated answers)
                             on bad quotes) ─► related.json    ─► "Studies like this one"
                                                                  │
                                                       optional: visitor pastes own key
                                                                  ▼
                                                browser ──► Claude API (direct, streamed)
                                                answers from retrieved findings, with citations
```

## 1. Build time: AI turns NASA documents into checked, cited data

| Output | What the AI does | Tracker |
|---|---|---|
| `findings.json` | Reads each record's objective, approach, hypothesis and research impacts, PSI's final reports and the Researcher's Guide. Writes 3–5 findings per investigation, each with an exact quote, its source and a page number. | R06a, R27, R35 |
| `briefs.json` | For each environment preset × task (8 × 3 = 24 briefs): what the most relevant evidence shows, how far it is from the environment, what has never been tested, and what to read next. Every sentence cites a PSI ID or a computed gap. | R06b |
| `qa.json` | About 20 curated questions a researcher would ask, such as "Has any solid fuel been tested above 30% O2?", "Does shutting off ventilation put a fire out in microgravity?" and "Which data supports a lunar habitat at 34% O2?" Each has a cited answer. | R06c, option 3 |
| `related.json` | 2–3 related studies per investigation, with a reason that has been checked against the data. | R06e |

**Guardrail (R06d):** a verifier script runs before every build. Every quote must appear word for word in its source text, and every number must appear in the source or the computed data. If either check fails, the build fails. All AI text is labeled "AI-extracted, check the source", and the team reviews it before submission.

The arithmetic ranking stays as it is. AI reads and interprets the evidence; it never sets a score.

## 2. Runtime: "Ask the evidence", no backend

- **Without a key (default; what judges see):** a question box searches the curated questions and findings in the browser and shows the matching answer with citations. It costs nothing and always works.
- **With a key (free-form questions):**
  - The visitor pastes their own Anthropic API key. It stays in their browser (session-only by default) and is sent only to `api.anthropic.com`.
  - The browser picks the relevant findings, investigations, gaps and current ranking (about 10–20k tokens) and calls the Claude API directly through the official TypeScript SDK in browser mode (to be confirmed against the installed SDK when built).
  - Answers stream in. The instructions require Claude to answer only from the material provided, cite PSI IDs, and decline risk predictions. The app turns each citation into a link and flags any sentence without one.
  - The fixed reference material is cached, so follow-up questions are cheap. The model defaults to Claude Opus 5.5, and visitors can pick Haiku 5.5 to spend less of their own credit.
  - The same key also powers an "Explain this ranking" button for the current view.

## Who generates the build-time content

1. **Claude Code writes it in a session, with no API spend.** It runs through the same verifier and is disclosed as "generated with Claude Code".
2. **A generator script in `pipeline/ai/` with the team's key.** It's re-runnable, which helps the validity score. It's a one-time cost of very roughly $2–5 at Opus 5.5 rates with caching.

Recommended: both. Claude Code writes the content now so nothing is blocked, and the script is committed so anyone can regenerate the content.

## Order and effort (about 10–12 hours)

1. **R33, R34, R35:** save the source texts (Guide, record text, a handful of PSI reports). About 2 h.
2. **R27/R06a:** findings and the verifier (R06d). About 3–4 h.
3. **R06b:** briefs. About 2 h.
4. **R06c:** curated Q&A and the optional key-based free-form mode. About 3 h.
5. **R06e:** related studies. About 1 h.

R01 and R02 should come first, since the briefs would otherwise repeat their wrong numbers.

## Decision (resolved)

Claude Code wrote the content first (done 2026-11-14, after R01 and R02). The generator script for later is still open.
