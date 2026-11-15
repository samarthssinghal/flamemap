import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../App'
import { AiNote, CitedText } from '../components/Cites'
import { checkedAnswers, keywordAnswers, type AnswerResult } from '../lib/answer'
import type { AppData } from '../lib/data'
import { loadSemantic, onSemanticState, semanticState, type SemanticState } from '../lib/semantic'

interface Turn { n: number; q: string; result: AnswerResult }

const METHOD: Record<SemanticState, string> = {
  idle: 'Your question is matched to the checked answers in your browser.',
  loading: 'Matching by key words for now. A small language model that matches by meaning is loading in your browser (about 30 MB, once).',
  ready: 'Matched by meaning, with a small language model running in your browser. It compares your question with the checked questions; it does not write text.',
  failed: 'Matched by key words (the in-browser language model could not load).',
}

/** Follow-up questions: checked questions that share topics with the answer just given, not yet asked. */
function followUps(data: AppData, r: AnswerResult, asked: Set<string>): { id: string; question: string }[] {
  const top = data.qa.find((x) => x.id === r.answers[0]?.id)
  const fresh = (id: string) => !asked.has(id) && !r.answers.some((a) => a.id === id)
  const out = r.nearby.filter((n) => fresh(n.id))
  if (top) {
    const tags = new Set(top.tags)
    data.qa
      .map((x) => ({ x, s: x.tags.filter((t) => tags.has(t)).length }))
      .filter(({ x, s }) => s > 0 && fresh(x.id) && !out.some((o) => o.id === x.id))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .forEach(({ x }) => out.push({ id: x.id, question: x.question }))
  }
  return out.slice(0, 3)
}

function TurnView({ t, last, onAsk, asked }: { t: Turn; last: boolean; onAsk: (q: string) => void; asked: Set<string> }) {
  const { data } = useApp()
  const r = t.result
  const next = last ? followUps(data, r, asked) : []
  return (
    <li className="turn">
      <p className="bubble">{t.q}</p>
      {r.answers.length === 0 ? (
        <div className="info">
          <p>No checked answer matches this question. FlameMap answers only what the PSI evidence covers and does not predict fire risk.</p>
          {r.nearby.length === 0 && <p>Try a question from the list below, or search the <Link to="/explorer">Explorer</Link>.</p>}
        </div>
      ) : (
        r.answers.map((a, k) => (
          <article key={a.id} className="panel answer">
            <h3>{k === 0 ? a.question : `Also: ${a.question}`} <span className="chip k-ai">AI, checked</span></h3>
            {a.sentences.map((s, j) => <p key={j}><CitedText s={s} /></p>)}
          </article>
        ))
      )}
      {r.findings.length > 0 && (
        <details className="panel related-findings">
          <summary>Related findings ({r.findings.length})</summary>
          <ul className="findings compact">
            {r.findings.map((f) => <li key={f.id}><CitedText s={{ text: f.text, cites: [...f.psi_ids, f.id] }} /></li>)}
          </ul>
        </details>
      )}
      {next.length > 0 && (
        <div className="followups" aria-label={r.answers.length ? 'Follow-up questions' : 'Closest checked questions'}>
          <span className="dim">{r.answers.length ? 'Ask next:' : 'Closest checked questions:'}</span>
          {next.map((n) => <button key={n.id} className="chip-btn" onClick={() => onAsk(n.question)}>{n.question}</button>)}
        </div>
      )}
    </li>
  )
}

/** "Ask the evidence" (R06c): checked answers written by AI at build time, matched to the question in the browser. No API key or server. */
export default function Ask() {
  const { data } = useApp()
  const [params] = useSearchParams()
  const [q, setQ] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const [sem, setSem] = useState<SemanticState>(semanticState())
  const counter = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)

  const ask = (text: string) => {
    const s = text.trim()
    if (!s) return
    const n = ++counter.current
    // Keyword matching is instant; the provider's result (by meaning, once the model is ready) replaces it.
    setTurns((ts) => [...ts, { n, q: s, result: keywordAnswers(s, data) }])
    setQ('')
    checkedAnswers.ask(s, data).then((result) => setTurns((ts) => ts.map((t) => (t.n === n ? { ...t, result } : t))))
  }

  useEffect(() => onSemanticState(setSem), [])
  useEffect(() => {
    const first = params.get('q')
    if (first && counter.current === 0) ask(first) // once, even when React runs effects twice in development
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { if (turns.length > 1) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [turns.length])

  const asked = new Set(turns.flatMap((t) => t.result.answers.map((a) => a.id)))
  const general = data.qa.filter((x) => !x.id.startsWith('inv-'))
  const perStudy = data.qa.filter((x) => x.id.startsWith('inv-'))
  return (
    <>
      <div className="hero">
        <h1>Ask the evidence</h1>
        <p>Ask about fire safety in a spacecraft or habitat. Answers come only from the PSI records, NASA&apos;s Researcher&apos;s Guide and the gaps FlameMap computes, and every sentence links to its source.</p>
      </div>
      {turns.length > 0 && (
        <div role="log" aria-live="polite" aria-label="Your questions and the checked answers">
          <ol className="thread">{turns.map((t, k) => <TurnView key={t.n} t={t} last={k === turns.length - 1} onAsk={ask} asked={asked} />)}</ol>
          <AiNote what="These answers were" />
        </div>
      )}
      <div ref={endRef} />
      <form className="panel ask" role="search" onSubmit={(e) => { e.preventDefault(); ask(q) }}>
        <label htmlFor="ask-q">{turns.length ? 'Ask another question' : 'Your question'}</label>
        <div className="ask-row">
          <input id="ask-q" type="search" value={q} onFocus={() => void loadSemantic()} onChange={(e) => setQ(e.target.value)} placeholder="e.g. If the fans are turned off, does a fire go out?" />
          <button type="submit">Ask</button>
        </div>
        <p className="dim">
          {data.qa.length} answers were written by AI ({data.ai.generated_with.split(',')[0]}) when the site was built, checked sentence by sentence against the data{data.ai.human_reviewed ? ' and reviewed by a person' : ''}. {METHOD[sem]} No AI service is called and no API key is needed. <Link to="/ai">How the AI works</Link>
        </p>
      </form>
      <section aria-label="Questions with checked answers">
        <h2>Questions with checked answers</h2>
        <ul className="qlist">
          {general.map((x) => <li key={x.id}><button className="link" onClick={() => ask(x.question)}>{x.question}</button></li>)}
        </ul>
        <h3>About each investigation</h3>
        <ul className="qlist">
          {perStudy.map((x) => <li key={x.id}><button className="link" onClick={() => ask(x.question)}>{x.question}</button></li>)}
        </ul>
      </section>
    </>
  )
}
