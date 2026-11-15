import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import Brief from '../components/Brief'
import Gaps from '../components/Gaps'
import { FUEL_LABEL, ROLE_LABEL, psi } from '../lib/data'
import { rank } from '../lib/ranker'
import type { QA } from '../lib/types'

/** Q&A tags that fit each environment and task, used to suggest questions for the current view. */
const ENV_TAGS: Record<string, string[]> = {
  iss: ['materials', 'airflow', 'ventilation', 'standards'],
  moon_base: ['moon', 'habitat', 'gravity'],
  rover: ['moon', 'habitat', 'gravity'],
  mars_base: ['mars', 'habitat', 'gravity'],
  spacesuit: ['spacesuit', 'oxygen', 'pressure'],
  exploration_atm: ['artemis', 'habitat', 'oxygen', 'pressure'],
  exploration_10_2psi: ['artemis', 'habitat', 'oxygen', 'pressure'],
  earth: ['gravity', 'standards', 'materials'],
}
const TASK_TAGS: Record<string, string[]> = { prevent: ['prevention'], detect: ['detection', 'smoke', 'soot'], suppress: ['suppression'] }

function suggest(qa: QA[], envId: string, taskId: string, n = 5): QA[] {
  const want = new Set([...(ENV_TAGS[envId] ?? []), ...(TASK_TAGS[taskId] ?? [])])
  return qa
    .map((x, k) => ({ x, k, s: x.tags.filter((t) => want.has(t)).length }))
    .sort((a, b) => b.s - a.s || a.k - b.k)
    .slice(0, n)
    .map((r) => r.x)
}

/** Home page: the AI briefing for a chosen mission environment, with the computed gaps and the closest studies. */
export default function Briefing() {
  const { data, env, envId, setEnvId, task, taskId, setTaskId, weights } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const top = useMemo(() => rank(env, task, weights, data.investigations, data.env.reference_spans).slice(0, 3), [env, task, weights, data])
  const questions = useMemo(() => suggest(data.qa, envId, taskId), [data.qa, envId, taskId])
  const ask = (s: string) => navigate(`/ask?q=${encodeURIComponent(s)}`)

  return (
    <>
      <div className="hero">
        <h1>Ask NASA&apos;s fire experiments about your mission</h1>
        <p>
          Choose where your crew will live. FlameMap&apos;s AI briefing explains what {data.insights.n_investigations} microgravity combustion investigations from NASA&apos;s PSI database say about fire safety there, and what has never been tested. Every sentence cites its source and is checked against the data.
        </p>
        <form className="ask-row hero-ask" role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q.trim()) }}>
          <label htmlFor="brief-q" className="sr-only">Ask the evidence a question</label>
          <input id="brief-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a question, e.g. Does shutting off ventilation put a fire out?" />
          <button type="submit">Ask the evidence</button>
        </form>
      </div>

      <section className="panel" aria-label="Mission environment and task">
        <h2>1. Where is the crew?</h2>
        <div className="env-cards" role="group" aria-label="Environment">
          {data.env.environments.map((e) => (
            <button key={e.id} className="env-card" aria-pressed={envId === e.id} onClick={() => setEnvId(e.id)}>
              <b>{e.name}</b>
              <span className="dim">{e.o2_percent}% O₂ · {e.pressure_kpa} kPa ({psi(e.pressure_kpa as number)} psi) · {e.gravity_g} g</span>
            </button>
          ))}
        </div>
        <p className="dim">Need other values? <button className="link" onClick={() => { setEnvId('custom'); navigate('/rank') }}>Set a custom environment on the Rank page</button>.</p>
        <h2>2. What are you working on?</h2>
        <div className="seg" role="group" aria-label="Fire-safety task">
          {data.env.tasks.map((t) => (
            <button key={t.id} aria-pressed={taskId === t.id} onClick={() => setTaskId(t.id)}>{t.name}</button>
          ))}
        </div>
      </section>

      <Brief />

      <Gaps title="What has never been tested here" />

      <section className="panel" aria-label="Closest studies">
        <div className="list-head">
          <h2>Closest NASA studies</h2>
          <Link to="/rank">See the full ranking and the math →</Link>
        </div>
        <ol className="top3">
          {top.map((r, k) => (
            <li key={r.inv.psi_id}>
              <span className="rankno" aria-hidden="true">{k + 1}</span>
              <span>
                <Link to={`/explorer?open=${r.inv.psi_id}`}><b>{r.inv.acronym}</b></Link> <span className="dim">{r.inv.title}</span>
                <span className="chips">
                  <span className={`chip role-${r.inv.fire_safety_role}`}>{ROLE_LABEL[r.inv.fire_safety_role]}</span>
                  <span className="chip">{FUEL_LABEL[r.inv.fuel_class]}</span>
                </span>
              </span>
              <span className="score"><b>{r.relevance}</b><span className="dim">match / 100</span></span>
            </li>
          ))}
        </ol>
        <p className="dim">Match scores are plain arithmetic on the tested conditions, not AI. The AI explains them; it never sets them.</p>
      </section>

      <section className="panel" aria-label="Suggested questions">
        <h2>Questions to ask about {env.name.toLowerCase()}</h2>
        <ul className="qlist">
          {questions.map((x) => <li key={x.id}><button className="link" onClick={() => ask(x.question)}>{x.question}</button></li>)}
        </ul>
        <p className="dim"><Link to="/ask">All {data.qa.length} answered questions</Link></p>
      </section>

      <section className="honesty" aria-label="How this AI is kept honest">
        <h2>How this AI is kept honest</h2>
        <ul>
          <li><b>{data.ai.checks.sentences}</b><span>AI-written sentences, each checked at build time against the computed data</span></li>
          <li><b>0</b><span>unsupported numbers, studies or citations allowed: the build fails on any</span></li>
          <li><b>{data.ai.human_reviewed ? 'Yes' : 'Pending'}</b><span>{data.ai.human_reviewed ? `reviewed by a person (${data.ai.reviewed_date})` : 'human review not yet signed off'}</span></li>
          <li><b>0</b><span>API keys or AI servers needed at runtime: {data.ai.generated_with.split(',')[0]} wrote this text ahead of time</span></li>
        </ul>
        <p><Link to="/ai">How the AI works →</Link></p>
      </section>
    </>
  )
}
