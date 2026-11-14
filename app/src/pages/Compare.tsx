import type { ReactNode } from 'react'
import { useApp } from '../App'
import { AVAIL_LABEL, FUEL_LABEL, ROLE_LABEL, fmtRange } from '../lib/data'
import type { Investigation, RangeCond } from '../lib/types'
import { Cond } from './Explorer'
import Findings from '../components/Findings'

function overlap(cs: (RangeCond | null)[], unit: string): string {
  const known = cs.filter((c): c is RangeCond => !!c && c.max !== null)
  if (known.length < cs.length) return known.length === 0 ? 'Not recorded for any of these.' : 'Not recorded for all of these, so no overlap can be stated.'
  const lo = Math.max(...known.map((c) => c.min ?? (c.max as number)))
  const hi = Math.min(...known.map((c) => c.max as number))
  return lo <= hi ? `Tested ranges overlap at ${fmtRange({ min: lo, max: hi }, unit)}.` : 'Tested ranges do not overlap.'
}

export default function Compare() {
  const { data, compare, toggleCompare } = useApp()
  const invs = compare.map((id) => data.investigations.find((i) => i.psi_id === id)).filter((i): i is Investigation => !!i)
  const rows: [string, (i: Investigation) => ReactNode, ((i: Investigation) => string) | null, string?][] = [
    ['Summary', (i) => i.summary.text, null],
    ['Key findings', (i) => <Findings inv={i} compact />, null],
    ['Fire-safety role', (i) => ROLE_LABEL[i.fire_safety_role], (i) => i.fire_safety_role],
    ['Fuel type', (i) => FUEL_LABEL[i.fuel_class], (i) => i.fuel_class],
    ['Fuels', (i) => i.fuel_materials.join(', '), null],
    ['Sample or burner geometry', (i) => i.geometry ?? 'not recorded', null],
    ['Oxygen', (i) => <Cond c={i.conditions.o2_percent} unit="%" />, (i) => fmtRange(i.conditions.o2_percent), overlap(invs.map((i) => i.conditions.o2_percent), '%')],
    ['Pressure', (i) => <Cond c={i.conditions.pressure_kpa} unit="kPa" />, (i) => fmtRange(i.conditions.pressure_kpa), overlap(invs.map((i) => i.conditions.pressure_kpa), 'kPa')],
    ['Airflow', (i) => <Cond c={i.conditions.flow_cm_s} unit="cm/s" />, (i) => fmtRange(i.conditions.flow_cm_s), overlap(invs.map((i) => i.conditions.flow_cm_s), 'cm/s')],
    ['Diluents', (i) => i.diluents.join(', ') || 'none listed', (i) => i.diluents.join()],
    ['Variables that were varied', (i) => i.variables_varied.join(', '), null],
    ['Sensors and measurements', (i) => i.sensors.join(', '), null],
    ['Hardware', (i) => i.hardware ?? 'not recorded', (i) => i.hardware ?? ''],
    ['Platform', (i) => i.platform, (i) => i.platform ?? ''],
    ['Table rows', (i) => i.evidence.n_runs, null],
    ['Data available', (i) => AVAIL_LABEL[i.evidence.data_availability], (i) => i.evidence.data_availability],
    ['Publications listed', (i) => i.n_publications, null],
  ]
  return (
    <>
      <div className="hero">
        <h1>Compare investigations side by side</h1>
        <p>Pick two or three. Rows marked "differs" are where the investigations are not the same.</p>
      </div>
      <section className="panel">
        <div className="seg wrap" role="group" aria-label="Investigations to compare">
          {data.investigations.map((i) => (
            <button key={i.psi_id} className={compare.includes(i.psi_id) ? 'on' : ''} aria-pressed={compare.includes(i.psi_id)} onClick={() => toggleCompare(i.psi_id)}>{i.acronym}</button>
          ))}
        </div>
      </section>
      {invs.length < 2 ? (
        <p className="info">Select at least two investigations above, or use "Add to compare" on the Rank and Explorer pages.</p>
      ) : (
        <div className="table-wrap">
          <table className="grid cmp">
            <thead><tr><th>Attribute</th>{invs.map((i) => <th key={i.psi_id}>{i.acronym}<div className="dim">{i.psi_id}</div></th>)}</tr></thead>
            <tbody>
              {rows.map(([label, render, key, note]) => {
                const differs = key ? new Set(invs.map(key)).size > 1 : false
                return (
                  <tr key={label} className={differs ? 'diff' : ''}>
                    <th scope="row">{label}{differs && <span className="chip">differs</span>}{note && <div className="dim">{note}</div>}</th>
                    {invs.map((i) => <td key={i.psi_id}>{render(i)}</td>)}
                  </tr>
                )
              })}
              <tr><th scope="row">Source</th>{invs.map((i) => <td key={i.psi_id}><a href={i.url} target="_blank" rel="noreferrer">PSI record</a> · <a href={`https://doi.org/${i.doi}`} target="_blank" rel="noreferrer">DOI</a></td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
