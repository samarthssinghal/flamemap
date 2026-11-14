import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../App'
import { AVAIL_LABEL, FUEL_LABEL, ROLE_LABEL, SRC_LABEL, fmtRange } from '../lib/data'
import { flatInv, saveCsv, saveJson } from '../lib/export'
import type { Investigation, RangeCond } from '../lib/types'

export function Cond({ c, unit }: { c: RangeCond | null; unit: string }) {
  if (!c) return <span className="dim">not recorded</span>
  return <>{fmtRange(c, unit)} <span className={`chip c-${c.confidence}`} title={c.source.ref}>{SRC_LABEL[c.source.type]}</span></>
}

function Detail({ i, close }: { i: Investigation; close: () => void }) {
  const { compare, toggleCompare } = useApp()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i.psi_id, close])
  return (
    <div className="drawer" role="dialog" aria-labelledby="drawer-title">
      <button ref={closeRef} className="close" onClick={close} aria-label="Close details">×</button>
      <h2 id="drawer-title">{i.acronym}</h2>
      <p className="dim">{i.title} · {i.psi_id}</p>
      <p className="chips"><span className={`chip role-${i.fire_safety_role}`}>{ROLE_LABEL[i.fire_safety_role]}</span>{i.secondary_roles.map((r) => <span key={r} className="chip">also {ROLE_LABEL[r].toLowerCase()}</span>)}<span className="chip">{FUEL_LABEL[i.fuel_class]}</span></p>
      <p>{i.summary.text}</p>
      <p><b>Why it matters:</b> {i.summary.why_it_matters}</p>
      <p className="ai-note">AI-drafted summary, based only on the PSI record text. Check the PSI record before relying on it.</p>
      <h3>Tested conditions</h3>
      <dl className="kv">
        <dt>Oxygen</dt><dd><Cond c={i.conditions.o2_percent} unit="%" />{i.conditions.o2_percent && <div className="dim src">{i.conditions.o2_percent.source.ref}</div>}</dd>
        <dt>Pressure</dt><dd><Cond c={i.conditions.pressure_kpa} unit="kPa" />{i.conditions.pressure_kpa && <div className="dim src">{i.conditions.pressure_kpa.source.ref}</div>}</dd>
        <dt>Airflow</dt><dd><Cond c={i.conditions.flow_cm_s} unit="cm/s" />{i.conditions.flow_cm_s && <div className="dim src">{i.conditions.flow_cm_s.source.ref}</div>}</dd>
        <dt>Gravity</dt><dd>{i.conditions.gravity_g.values.join(', ')} g (microgravity)</dd>
        <dt>Diluents</dt><dd>{i.diluents.join(', ') || <span className="dim">none listed</span>}</dd>
      </dl>
      <h3>Study design</h3>
      <dl className="kv">
        <dt>Fuels</dt><dd>{i.fuel_materials.join(', ')}</dd>
        <dt>Geometry</dt><dd>{i.geometry ?? <span className="dim">not recorded</span>}</dd>
        <dt>Varied</dt><dd>{i.variables_varied.join(', ')}</dd>
        <dt>Sensors</dt><dd>{i.sensors.join(', ')}</dd>
        <dt>Hardware</dt><dd>{i.hardware ?? <span className="dim">not recorded</span>}</dd>
        <dt>Platform</dt><dd>{i.platform}</dd>
        <dt>Dates</dt><dd>{i.start_date ?? '?'} to {i.end_date ?? '?'}</dd>
        <dt>Data</dt><dd>{AVAIL_LABEL[i.evidence.data_availability]}; {i.evidence.n_runs} table rows; {i.evidence.raw_data_gb} GB of files on PSI</dd>
        <dt>License</dt><dd>{i.license}</dd>
      </dl>
      {i.publications.length > 0 && (
        <details className="pubs">
          <summary>Publications ({i.publications.length} listed on the PSI record)</summary>
          <ul>
            {i.publications.map((p, idx) => (
              <li key={idx}>
                {p.doi ? <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer">{p.title}</a> : <span>{p.title} <span className="dim">(no DOI on record)</span></span>}
              </li>
            ))}
          </ul>
        </details>
      )}
      {i.related_modeling.length > 0 && (<><h3>Related modeling studies in PSI</h3><ul>{i.related_modeling.map((m) => <li key={m.psi_id}><a href={m.url} target="_blank" rel="noreferrer">{m.psi_id}: {m.title}</a></li>)}</ul></>)}
      <p className="links">
        <a href={i.url} target="_blank" rel="noreferrer">Open the PSI record</a>
        <a href={`https://doi.org/${i.doi}`} target="_blank" rel="noreferrer">DOI {i.doi}</a>
        <button className="link" onClick={() => toggleCompare(i.psi_id)}>{compare.includes(i.psi_id) ? 'Remove from compare' : 'Add to compare'}</button>
      </p>
    </div>
  )
}

export default function Explorer() {
  const { data } = useApp()
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [fuel, setFuel] = useState('')
  const [avail, setAvail] = useState('')
  const [sel, setSel] = useState<string | null>(null)
  const lastBtn = useRef<HTMLElement | null>(null)
  const closeDetail = useMemo(() => () => { setSel(null); lastBtn.current?.focus() }, [])
  const rows = useMemo(() => data.investigations.filter((i) => {
    const hay = [i.acronym, i.title, i.psi_id, i.fuel_materials.join(' '), i.summary.text, i.sensors.join(' '), i.variables_varied.join(' '), i.hardware ?? ''].join(' ').toLowerCase()
    return (!q || hay.includes(q.toLowerCase())) && (!role || i.fire_safety_role === role || i.secondary_roles.includes(role as never)) && (!fuel || i.fuel_class === fuel) && (!avail || i.evidence.data_availability === avail)
  }), [data, q, role, fuel, avail])
  const selInv = data.investigations.find((i) => i.psi_id === sel)
  const opt = (m: Record<string, string>) => Object.entries(m).map(([k, v]) => <option key={k} value={k}>{v}</option>)
  return (
    <>
      <div className="hero">
        <h1>Explore the investigations</h1>
        <p>{data.insights.n_investigations} flight investigations, {data.insights.n_table_rows.toLocaleString()} experimental-table rows and {data.insights.n_publications_listed} listed publications. Every condition shows where it came from.</p>
      </div>
      <section className="panel filters">
        <label>Search<input type="search" aria-label="Search investigations" value={q} onChange={(e) => setQ(e.target.value)} placeholder="fuel, sensor, acronym…" /></label>
        <label>Fire-safety role<select value={role} onChange={(e) => setRole(e.target.value)}><option value="">All</option>{opt(ROLE_LABEL)}</select></label>
        <label>Fuel type<select value={fuel} onChange={(e) => setFuel(e.target.value)}><option value="">All</option>{opt(FUEL_LABEL)}</select></label>
        <label>Data available<select value={avail} onChange={(e) => setAvail(e.target.value)}><option value="">All</option>{opt(AVAIL_LABEL)}</select></label>
        <div className="actions">
          <button onClick={() => saveCsv('flamemap_investigations.csv', rows.map(flatInv))}>Export table (CSV)</button>
          <button onClick={() => saveJson('flamemap_investigations.json', rows)}>Export table (JSON)</button>
          <button onClick={() => saveCsv('flamemap_run_bins.csv', data.runs as never)}>Export run data (CSV)</button>
        </div>
      </section>
      <p className="dim">{rows.length} of {data.investigations.length} shown. Select a row for details.</p>
      <div className="table-wrap">
        <table className="grid">
          <thead><tr><th>Investigation</th><th>Role</th><th>Fuel</th><th>Oxygen</th><th>Pressure</th><th>Airflow</th><th>Rows</th><th>Data</th></tr></thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.psi_id} className={sel === i.psi_id ? 'sel' : ''} onClick={() => setSel(i.psi_id)}>
                <td><button className="link rowbtn" aria-label={`${i.acronym}, show details`} onClick={(e) => { lastBtn.current = e.currentTarget; setSel(i.psi_id) }}>{i.acronym}</button><div className="dim">{i.psi_id}</div></td>
                <td>{ROLE_LABEL[i.fire_safety_role]}</td>
                <td>{FUEL_LABEL[i.fuel_class]}</td>
                <td><Cond c={i.conditions.o2_percent} unit="%" /></td>
                <td><Cond c={i.conditions.pressure_kpa} unit="kPa" /></td>
                <td><Cond c={i.conditions.flow_cm_s} unit="cm/s" /></td>
                <td>{i.evidence.n_runs}</td>
                <td>{AVAIL_LABEL[i.evidence.data_availability]}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8}>No investigations match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      {selInv && <Detail i={selInv} close={closeDetail} />}
    </>
  )
}
