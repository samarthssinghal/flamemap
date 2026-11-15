import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../App'
import { AiNote, CitedText } from '../components/Cites'
import { checkedAnswers, keywordAnswers, type Answer, type AnswerResult } from '../lib/answer'
import { loadSemantic, onSemanticState, semanticState, type SemanticState } from '../lib/semantic'

function AnswerCard({ x }: { x: Answer }) {
  return (
    <article className="panel answer">
      <h3>{x.question}</h3>
      {x.sentences.map((s, k) => <p key={k}><CitedText s={s} /></p>)}
    </article>
  )
}

const METHOD: Record<SemanticState, string> = {
  idle: 'Your question is matched to the checked answers in your browser.',
  loading: 'Matching by key words for now. A small language model that matches by meaning is loading in your browser (about 37 MB, once).',
  ready: 'Matched by meaning, with a small language model running in your browser. It compares your question with the checked questions; it does not write text.',
  failed: 'Matched by key words (the in-browser language model could not load).',
}

/** "Ask the evidence" (R06c): checked answers written by AI at build time, matched to the question in the browser. No API key or server. */
export default function Ask() {
  const { data } = useApp()
  const [params] = useSearchParams()
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const [asked, setAsked] = useState(() => params.get('q') ?? '')
  const [sem, setSem] = useState<SemanticState>(semanticState())
  const [matched, setMatched] = useState<{ q: string; r: AnswerResult } | null>(null)
  // Keyword matching is instant; the provider's result (by meaning, once the model is ready) replaces it.
  const quick = useMemo(() => (asked.trim() ? keywordAnswers(asked, data) : null), [asked, data])
  const result = matched?.q === asked ? matched.r : quick

  useEffect(() => onSemanticState(setSem), [])
  useEffect(() => {
    if (!asked.trim()) return
    let live = true
    checkedAnswers.ask(asked, data).then((r) => { if (live) setMatched({ q: asked, r }) })
    return () => { live = false }
  }, [asked, data])

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
          <input id="ask-q" type="search" value={q} onFocus={() => void loadSemantic()} onChange={(e) => setQ(e.target.value)} placeholder="e.g. If the fans are turned off, does a fire go out?" />
          <button type="submit">Search answers</button>
        </div>
        <p className="dim">
          {data.qa.length} answers were written by AI ({data.ai.generated_with.split(',')[0]}) when the site was built, checked sentence by sentence against the data{data.ai.human_reviewed ? ' and reviewed by a person' : ''}. {METHOD[sem]} No AI service is called and no API key is needed. <Link to="/ai">How the AI works</Link>
        </p>
      </form>
      <div role="status" aria-live="polite">
        {asked && result && result.answers.length === 0 && (
          <div className="info">
            <p>No checked answer matches “{asked}”. FlameMap answers only what the PSI evidence covers and does not predict fire risk.</p>
            {result.nearby.length > 0 ? (
              <>Closest checked questions: <ul>{result.nearby.map((n) => <li key={n.id}><button className="link" onClick={() => ask(n.question)}>{n.question}</button></li>)}</ul></>
            ) : <p>Try one of the questions below, or search the <Link to="/explorer">Explorer</Link>.</p>}
          </div>
        )}
        {result?.answers.map((x) => <AnswerCard key={x.id} x={x} />)}
        {result && result.answers.length > 0 && <AiNote what="These answers were" />}
        {result && result.answers.length > 0 && result.nearby.length > 0 && (
          <p className="dim">Also close: {result.nearby.map((n, k) => <span key={n.id}>{k > 0 && ' · '}<button className="link" onClick={() => ask(n.question)}>{n.question}</button></span>)}</p>
        )}
        {result && result.findings.length > 0 && (
          <section className="panel">
            <h3>Related findings</h3>
            <ul className="findings compact">
              {result.findings.map((f) => <li key={f.id}><CitedText s={{ text: f.text, cites: [...f.psi_ids, f.id] }} /></li>)}
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
