import { Link } from 'react-router-dom'
import { useApp } from '../App'
import { AiNote, Cites } from './Cites'

/** One-line version of the brief for the Rank page, linking to the full briefing. */
export function BriefLine() {
  const { data, envId, task } = useApp()
  const head = data.briefs.find((x) => x.env_ids.includes(envId) && x.task_id === task.id)?.points.find((p) => p.kind === 'headline')
  if (!head) return null
  return (
    <p className="info brief-line">
      <span className="chip k-ai">AI briefing</span> {head.text} <Cites cites={head.cites} envId={envId} /> <Link to="/">Read the full briefing →</Link>
    </p>
  )
}

const KIND: Record<string, string> = { closest: 'Closest evidence', found: 'What it found', untested: 'Not tested', next: 'Read next' }

/** "What the evidence says": the AI interpretation brief for the selected preset and task (R06b). */
export default function Brief() {
  const { data, envId, task, env, weights } = useApp()
  const d = data.env.default_weights
  const custom = (Object.keys(d) as (keyof typeof d)[]).some((k) => d[k] !== weights[k])
  if (envId === 'custom') {
    return (
      <section className="brief panel" aria-label="What the evidence says">
        <h2>What the evidence says</h2>
        <p className="dim">Interpretation briefs are written for the preset environments only, because each one is checked against that preset&apos;s computed ranking. For your custom values, read the per-factor results on each card below.</p>
      </section>
    )
  }
  const b = data.briefs.find((x) => x.env_ids.includes(envId) && x.task_id === task.id)
  if (!b) return null
  const head = b.points.find((p) => p.kind === 'headline')
  return (
    <section className="brief panel" aria-label="What the evidence says">
      <h2>What the evidence says <span className="chip k-ai">AI interpretation</span></h2>
      <p className="dim">{env.name} · {task.name}{b.env_ids.length > 1 ? ` (same brief for ${b.env_ids.map((e) => data.env.environments.find((x) => x.id === e)?.name).join(', ')}: same atmosphere and the same top studies)` : ''}</p>
      {head && <p className="lead">{head.text} <Cites cites={head.cites} envId={envId} /></p>}
      <dl className="brief-points">
        {b.points.filter((p) => p.kind !== 'headline').map((p, k) => (
          <div key={k}>
            <dt>{KIND[p.kind]}</dt>
            <dd>{p.text} <Cites cites={p.cites} envId={envId} /></dd>
          </div>
        ))}
      </dl>
      {custom && <p className="info">This brief describes the ranking with the default weights. Your weights change the order of the cards below.</p>}
      <AiNote what="This brief was" />
    </section>
  )
}
