# FlameMap app

Vite + React + TypeScript single-page app, served as static files. It loads `public/data/*.json`, which is written by `pipeline/build_data.mjs` and `pipeline/ai_build.mjs` (see the top-level README).

```
npm install
npm run dev      # local site
npm run test     # ranker unit tests (Vitest)
npm run lint     # oxlint
npm run build    # type check + static build in dist/
```

- `src/lib/ranker.ts`: scoring arithmetic (also imported by `pipeline/ai_build.mjs`, so keep it free of runtime imports other than types).
- `src/pages/`: Rank, EvidenceMap, Explorer, Ask, Compare, About.
- `src/components/`: EnvPicker, Findings (checked key findings), Brief ("What the evidence says"), Cites (citation chips and the AI label).
- Routing uses `HashRouter`. The selection is kept in the address after `#`; `#/explorer?open=PSI-25` opens a study and `#/ask?q=...` opens with a question.
