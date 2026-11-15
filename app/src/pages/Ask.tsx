import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../App'
import { AiNote, CitedText } from '../components/Cites'
import type { QA } from '../lib/types'

const STOP = new Set('a an and any are as at be by can could do does for from has have how i in is it its of on or than that the there this to was were what when where which who why will with would'.split(' '))
const SYN: Record<string, string> = { o2: 'oxygen', moon: 'lunar', fabric: 'cotton', extinguish: 'suppress', extinguishment: 'suppress', suppression: 'suppress', suppressant: 'suppress', suppressants: 'suppress', detector: 'detect', detectors: 'detect', detection: 'detect', smoke: 'smoke', ventilation: 'airflow', fan: 'airflow', flow: 'airflow', suit: 'spacesuit', eva: 'spacesuit', gravity: 'gravity', habitat: 'habitat', base: 'habitat' }
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9%.\s-]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map((w) => SYN[w] ?? SYN[w.replace(/s$/, '')] ?? w.replace(/s$/, ''))

/** Ranks curated questions by word overlap with the visitor's question (question and tags count more than answer text). */
function search(q: string, qa: QA[]): QA[] {
  const want = new Set(words(q))
  if (!want.size) return []
  return qa
    .map((x) => {
      const head = new Set(words(`${x.question} ${x.tags.join(' ')}`))
      const body = new Set(words(x.answer.map((a) => a.text).join(' ')))
      let score = 0
      for (const w of want) score += head.has(w) ? 2 : body.has(w) ? 1 : 0
      return { x, score: score / Math.sqrt(want.size) }
    })
    .filter((r) => r.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.x)
}

function Answer({ x }: { x: QA }) {
  return (
    <article className="panel answer">
      <h3>{x.question}</h3>
      {x.answer.map((s, k) => <p key={k}><CitedText s={s} /></p>)}
    </article>
  )
}

/** "Ask the evidence" (R06c): curated questions with cited answers. Static, so it needs no API key or server. */
export default function Ask() {
  const { data } = useApp()
  const [params] = useSearchParams()
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const [asked, setAsked] = useState(() => params.get('q') ?? '')
  const hits = useMemo(() => search(asked, data.qa), [asked, data.qa])
  const findingHits = useMemo(() => {
    const want = new Set(words(asked))
    if (!want.size) return []
    return data.findings.filter((f) => words(f.text).filter((w) => want.has(w)).length >= Math.min(2, want.size)).slice(0, 4)
  }, [asked, data.findings])
  const ask = (s: string) => { setQ(s); setAsked(s) }
  return (
    <>
      <div className="hero">
        <h1>Ask the evidence</h1>
        <p>Questions a mission designer might ask, answered only from the PSI records, NASA&apos;s Researcher&apos;s Guide and the gaps FlameMap computes. Every sentence links to its source.</p>
      </div>
      <form className="panel ask" role="search" onSubmit={(e) => { e.preventDefault(); setAsked(q) }}>
        <label htmlFor="ask-q">Your question</label>
        <div className="ask-row">
          <input id="ask-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Has any material been burned at high oxygen?" />
          <button type="submit">Search answers</button>
        </div>
        <p className="dim">This matches your question against {data.qa.length} answered questions. It does not generate new text, so an answer is always one that was checked when the site was built.</p>
      </form>
      <div role="status" aria-live="polite">
        {asked && hits.length === 0 && (
          <p className="info">No checked answer matches “{asked}”. FlameMap answers only what the PSI evidence covers and does not predict fire risk. Try one of the questions below, or search the <Link to="/explorer">Explorer</Link>.</p>
        )}
        {hits.map((x) => <Answer key={x.id} x={x} />)}
        {hits.length > 0 && <AiNote what="These answers were" />}
        {findingHits.length > 0 && (
          <section className="panel">
            <h3>Related findings</h3>
            <ul className="findings compact">
              {findingHits.map((f) => <li key={f.id}><CitedText s={{ text: f.text, cites: [...f.psi_ids, f.id] }} /></li>)}
            </ul>
          </section>
        )}
      </div>
      <section aria-label="Questions with checked answers">
        <h2>Questions with checked answers</h2>
        <ul className="qlist">
          {data.qa.map((x) => <li key={x.id}><button className="link" onClick={() => ask(x.question)}>{x.question}</button></li>)}
        </ul>
      </section>
    </>
  )
}
