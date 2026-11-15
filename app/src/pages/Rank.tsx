import { useMemo, useState } from 'react'
import { useApp } from '../App'
import { BriefLine } from '../components/Brief'
import EnvPicker from '../components/EnvPicker'
import Gaps from '../components/Gaps'
import Findings from '../components/Findings'
import { AVAIL_LABEL, FUEL_LABEL, ROLE_LABEL, SRC_LABEL, fmtRange } from '../lib/data'
import { flatRank, saveCsv, saveJson } from '../lib/export'
import { explain, rank } from '../lib/ranker'
import type { Factor, RankedItem, Weights } from '../lib/types'

const STATUS_TEXT: Record<string, string> = { inside: 'inside tested range', outside: 'outside tested range', unknown: 'not recorded (counted as untested)', not_set: 'not set for this environment', match: 'match', partial: 'partial match', mismatch: 'no match' }
const ICON: Record<string, string> = { inside: '✓', match: '✓', outside: '!', partial: '~', mismatch: '✕', unknown: '?', not_set: '–' }

function FactorBar({ f }: { f: Factor }) {
  const pct = f.distance === null ? 0 : Math.round((1 - f.distance) * 100)
  return (
    <div className={`fbar s-${f.status}`} title={`${f.label}: ${STATUS_TEXT[f.status]}`}>
      <span className="flabel">{f.label}</span>
      <span className="track" aria-hidden="true">{f.distance !== null && <span className="fill" style={{ width: `${Math.max(pct, 3)}%` }} />}</span>
      <span className="fval"><span aria-hidden="true">{ICON[f.status]} </span>{f.distance === null ? 'not set' : f.status === 'unknown' ? `${pct}%, not recorded` : `${pct}%`}{f.distance !== null && <span className="sr-only">, {STATUS_TEXT[f.status]}</span>}</span>
    </div>
  )
}

function Card({ item, idx }: { item: RankedItem; idx: number }) {
  const { compare, toggleCompare } = useApp()
  const [open, setOpen] = useState(idx === 0)
  const i = item.inv
  return (
    <li className="card">
      <button className="card-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="rankno"><span className="sr-only">Rank </span>{idx + 1}</span>
        <span className="card-title">
          <b>{i.acronym}</b>
          <span className="dim">{i.title}</span>
          <span className="chips">
            <span className={`chip role-${i.fire_safety_role}`}>{ROLE_LABEL[i.fire_safety_role]}</span>
            <span className="chip">{FUEL_LABEL[i.fuel_class]}</span>
            <span className="chip">{AVAIL_LABEL[i.evidence.data_availability]}</span>
          </span>
        </span>
        <span className="score">
          <b>{item.relevance}</b>
          <span className="dim">match / 100</span>
          <span className="dim">{item.n_known} of {item.n_scored} factors recorded</span>
        </span>
      </button>
      <div className="fbars">{item.breakdown.map((f) => <FactorBar key={f.factor} f={f} />)}</div>
      {item.flags.length > 0 && <ul className="flags">{item.flags.map((f) => <li key={f}>{f}</li>)}</ul>}
      {open && (
        <div className="card-body">
          <p>{i.summary.text}</p>
          <p className="ai-note">AI-drafted summary, based only on the PSI record text. Check the PSI record before relying on it.</p>
          <h3>Key findings</h3>
          <Findings inv={i} />
          <h3>How this score was computed</h3>
          <ul>{explain(item).map((s) => <li key={s}>{s}</li>)}</ul>
          <table className="mini">
            <thead><tr><th>Factor</th><th>Tested</th><th>This environment</th><th>Distance</th><th>Weight</th><th>Where the value comes from</th></tr></thead>
            <tbody>
              {item.breakdown.map((f) => (
                <tr key={f.factor}>
                  <td>{f.label}</td>
                  <td>{f.factor === 'task' ? `${ROLE_LABEL[i.fire_safety_role]}, ${FUEL_LABEL[i.fuel_class]}` : f.factor === 'gravity' ? `${i.conditions.gravity_g.values.join(', ')} g` : fmtRange({ min: f.tested_min, max: f.tested_max }, f.unit)}</td>
                  <td>{f.env_value === null ? 'not set' : `${f.env_value}${f.factor === 'task' ? '' : ' ' + f.unit}`}</td>
                  <td>{f.distance === null ? 'not scored' : f.status === 'unknown' ? `${f.distance.toFixed(3)} (not recorded)` : f.distance.toFixed(3)}</td>
                  <td>{f.weight.toFixed(2)}</td>
                  <td>{f.source ? <><span className={`chip c-${f.confidence}`}>{SRC_LABEL[f.source.type]}</span> <span className="dim src">{f.source.ref}</span></> : f.factor === 'task' ? <span className="dim">role and fuel classification</span> : <span className="dim">not recorded</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="links">
            <a href={i.url} target="_blank" rel="noreferrer">Open the PSI record</a>
            <a href={`https://doi.org/${i.doi}`} target="_blank" rel="noreferrer">DOI {i.doi}</a>
            <button className="link" onClick={() => toggleCompare(i.psi_id)}>{compare.includes(i.psi_id) ? 'Remove from compare' : 'Add to compare'}</button>
          </p>
        </div>
      )}
    </li>
  )
}

export default function Rank() {
  const { data, env, task, weights, setWeights } = useApp()
  const [showW, setShowW] = useState(false)
  const [copied, setCopied] = useState('')
  const copyLink = () => {
    const done = (ok: boolean) => { setCopied(ok ? 'Link copied' : 'Copy the address from the browser bar'); setTimeout(() => setCopied(''), 4000) }
    try { navigator.clipboard.writeText(window.location.href).then(() => done(true), () => done(false)) } catch { done(false) }
  }
  const ranked = useMemo(() => rank(env, task, weights, data.investigations, data.env.reference_spans), [env, task, weights, data])
  const wkeys: [keyof Weights, string][] = [['o2', 'Oxygen'], ['pressure', 'Pressure'], ['flow', 'Airflow'], ['gravity', 'Gravity'], ['task', 'Task fit']]
  const exportMeta = { environment: env, task, weights, snapshot: data.insights.snapshot_date }
  return (
    <>
      <div className="hero">
        <h1>Which NASA fire experiments apply to your spacecraft?</h1>
        <p>
          Pick a crewed environment and a task. FlameMap ranks {data.insights.n_investigations} microgravity combustion investigations from NASA's PSI database by how closely their tested conditions match, shows the math, and flags what has never been tested.
        </p>
      </div>
      <EnvPicker />
      <BriefLine />
      <Gaps />
      <section>
        <div className="list-head">
          <h2>Ranked investigations</h2>
          <div className="actions">
            <button onClick={() => setShowW(!showW)} aria-expanded={showW}>{showW ? 'Hide weights' : 'Adjust weights'}</button>
            <button onClick={copyLink}>Copy link to this view</button>
            <button onClick={() => saveCsv('flamemap_ranking.csv', ranked.map(flatRank))}>Export CSV</button>
            <button onClick={() => saveJson('flamemap_ranking.json', { ...exportMeta, ranking: ranked.map(flatRank) })}>Export JSON</button>
          </div>
        </div>
        {showW && (
          <div className="panel sliders">
            {wkeys.map(([k, label]) => (
              <label key={k} className="slider">
                <span>{label}: <b>{weights[k].toFixed(2)}</b></span>
                <input type="range" min={0} max={1} step={0.05} value={weights[k]} onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })} />
              </label>
            ))}
            <button className="link" onClick={() => setWeights(data.env.default_weights)}>Reset to defaults</button>
            <p className="note">Weights are a judgment call. A factor the investigation did not record counts as untested (distance 1, the maximum). A factor the environment does not set is skipped for every investigation, and the remaining weights are rescaled.</p>
          </div>
        )}
        <p className="sr-only" role="status" aria-live="polite">{copied || `Ranking updated for ${env.name}, ${task.name}. Top match: ${ranked[0].inv.acronym}, ${ranked[0].relevance} out of 100.`}</p>
        {copied && <p className="info" aria-hidden="true">{copied}</p>}
        <p className="dim">Match = 100 × (1 − weighted distance). A distance of 0 means the environment value lies inside the range that was tested.</p>
        <ol className="cards">{ranked.map((r, idx) => <Card key={r.inv.psi_id} item={r} idx={idx} />)}</ol>
      </section>
    </>
  )
}
