import { Link } from 'react-router-dom'
import { useApp } from '../App'
import { Cites } from '../components/Cites'

const numbersIn = (s: string) => [...s.matchAll(/(?<![A-Za-z\d.])\d+(?:\.\d+)?/g)].map((m) => m[0])

/** "How the AI works": the build-time AI pipeline, what is checked, and why no runtime key is needed. */
export default function HowAI() {
  const { data } = useApp()
  const ai = data.ai
  const c = ai.checks
  const model = ai.generated_with.split(',')[0]
  const nRelated = Object.values(data.related).reduce((n, r) => n + r.length, 0)
  const nViews = new Set(data.briefs.flatMap((b) => b.env_ids.map((e) => `${e}/${b.task_id}`))).size

  // A real sentence from the app, with what the checker verified for it.
  const brief = data.briefs.find((b) => b.env_ids.includes('moon_base') && b.task_id === 'prevent')
  const example = brief?.points.find((p) => numbersIn(p.text).length >= 2) ?? brief?.points[0]
  const exNums = example ? numbersIn(example.text) : []
  const exNamed = example ? data.investigations.filter((i) => example.text.includes(i.acronym)).map((i) => i.acronym) : []

  return (
    <div className="prose">
      <div className="hero">
        <h1>How the AI works</h1>
        <p>
          The briefings, the answers on Ask the evidence and the &quot;Studies like this one&quot; reasons were written by AI ({model}) <b>before the site was built</b>, from the computed data only. A script checked every one of those sentences against that data, and a person reviewed them. Nothing is generated while you use the site, so it needs <b>no API keys, no AI server and no per-visit cost</b>.
        </p>
        <p className="dim">The key findings were also written with AI and are checked word for word against their NASA quote or table cells. The short study summaries are AI-drafted from the PSI record text and labeled as such; their human review is still pending.</p>
      </div>

      <section className="honesty" aria-label="What was checked">
        <h2>Checked at build time</h2>
        <ul className="six">
          <li><b>{c.sentences}</b><span>AI-written sentences</span></li>
          <li><b>{c.citations}</b><span>citations, each resolved to a PSI record, finding, gap or statistic</span></li>
          <li><b>{c.numbers}</b><span>numbers, each found in what its sentence cites</span></li>
          <li><b>{c.named_studies}</b><span>study names, each one cited by its sentence</span></li>
          <li><b>{c.related_bases}</b><span>&quot;related because…&quot; claims, each confirmed in the data</span></li>
          <li><b>{ai.human_reviewed ? ai.reviewed_date : 'Pending'}</b><span>{ai.human_reviewed ? `human sign-off (${ai.reviewed_by}), text hash ${ai.content_hash}` : 'human review not yet signed off'}</span></li>
        </ul>
      </section>

      <section className="panel">
        <h2>The pipeline</h2>
        <ol className="flow">
          <li><b>NASA data</b><span>{data.insights.n_investigations} PSI investigations, {data.insights.n_table_rows.toLocaleString()} experimental-table rows, NASA&apos;s Researcher&apos;s Guide to ISS Combustion Science.</span></li>
          <li><b>Arithmetic, no AI</b><span>Match scores for every environment and task, and the evidence gaps. Every number can be checked by hand.</span></li>
          <li><b>Writer&apos;s context</b><span>One {c.context_kb} KB file (<code title="pipeline/ai/context.md">context.md</code>) with the rankings for all {nViews} views, the gaps and the checked findings. The AI is given nothing else.</span></li>
          <li className="ai"><b>AI writes</b><span>{model} writes {data.briefs.length} briefs, {data.qa.length} answers, {nRelated} related-study reasons and {c.findings} key findings, each sentence with its citations.</span></li>
          <li><b>Machine check, no AI</b><span><code title="pipeline/ai_build.mjs">ai_build.mjs</code> rejects any sentence with an unsupported number, an uncited study name, a citation that does not resolve, or a &quot;closest&quot; claim outside the computed top 5. Findings must match their quote or table cells. One failure stops the build.</span></li>
          <li><b>Human review</b><span>A person reads every sentence against its sources (<code title="docs/AI_TEXT_REVIEW.md">AI_TEXT_REVIEW.md</code>) and signs off on a hash of the text. If the text changes, the sign-off no longer matches and the build fails.</span></li>
          <li><b>Static site</b><span>The checked text ships as JSON on GitHub Pages. Your browser matches your question to it. No AI call happens while you use the site.</span></li>
        </ol>
      </section>

      {example && (
        <section className="panel">
          <h2>One sentence, checked</h2>
          <p className="dim">From the lunar habitat briefing, as shown on the <Link to="/?env=moon_base&task=prevent">Briefing</Link> page:</p>
          <blockquote className="example">{example.text} <Cites cites={example.cites} envId="moon_base" /></blockquote>
          <ul className="checks">
            <li>✓ {example.cites.length} citation{example.cites.length === 1 ? '' : 's'}, all of which resolve</li>
            {exNums.length > 0 && <li>✓ Number{exNums.length === 1 ? '' : 's'} {exNums.join(', ')} found in the cited data</li>}
            {exNamed.length > 0 && <li>✓ Named stud{exNamed.length === 1 ? 'y' : 'ies'} {exNamed.join(', ')} cited by the sentence</li>}
            <li>✓ Reviewed by a person: does it say only what its sources say?</li>
          </ul>
        </section>
      )}

      <section className="panel">
        <h2>Sentences the build would reject</h2>
        <p className="dim">Made-up examples, to show what the checker catches.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Sentence</th><th>Cites</th><th>Rejected because</th></tr></thead>
            <tbody>
              <tr><td>The highest oxygen in any solid-fuel table is 25%.</td><td>BASS-II</td><td>25 does not appear in the BASS-II data (its highest is 22.2)</td></tr>
              <tr><td>FLEX showed droplet flames can keep burning as cool flames.</td><td>BASS-II</td><td>Names FLEX but does not cite it</td></tr>
              <tr><td>A lunar habitat at 30% oxygen is safe.</td><td>none</td><td>No citation. A person would also reject it: FlameMap does not assess risk</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Why write the AI text ahead of time?</h2>
        <ul>
          <li><b>Checked before anyone reads it.</b> A live chatbot can make up a number while you watch. Here every sentence has passed the checker and a human review before it is published.</li>
          <li><b>No keys, no server, no bill.</b> The site is static on GitHub Pages. You don&apos;t need an account, and nobody&apos;s API key is exposed.</li>
          <li><b>Reproducible.</b> The context, the AI text, the checker and the sign-off are all in the repository. Anyone can rerun <code>node pipeline/ai_build.mjs</code>.</li>
          <li><b>The AI explains, arithmetic ranks.</b> Match scores and gaps are computed, never generated, so the AI cannot change a ranking. It can only explain one, with citations.</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Extending to live answers</h2>
        <p>Ask the evidence answers from the {data.qa.length} checked answers. For questions outside that set, the design leaves room for a live mode, <b>not enabled in this build</b>:</p>
        <ul>
          <li><b>Bring your own key:</b> a visitor pastes their own Anthropic API key. It stays in their browser for that session only, and the browser sends the same writer&apos;s context and the question to Claude.</li>
          <li><b>Or a hosted proxy:</b> a small serverless function holds the team&apos;s key, with rate limits and a spending cap.</li>
          <li>Either way, live answers go through the same checks in the browser, and any sentence without support is flagged.</li>
        </ul>
      </section>

      <p className="dim">How the ranking is computed, the data limits and every source: <Link to="/about">Method and sources</Link>.</p>
    </div>
  )
}
