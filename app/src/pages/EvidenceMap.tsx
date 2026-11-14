import { useMemo, useState } from 'react'
import { CartesianGrid, ReferenceDot, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { useApp } from '../App'
import EnvPicker from '../components/EnvPicker'
import { FUEL_LABEL, fmtRange } from '../lib/data'
import type { FuelClass, RunPoint } from '../lib/types'

const COLOR: Record<FuelClass, string> = { solid: '#ffb454', liquid_droplet: '#5aa9ff', gas: '#b48cff', aerosol: '#7bd88f' }
const SHAPE: Record<FuelClass, 'circle' | 'square' | 'triangle' | 'diamond'> = { solid: 'square', liquid_droplet: 'circle', gas: 'triangle', aerosol: 'diamond' }

function Tip({ active, payload }: { active?: boolean; payload?: { payload: RunPoint }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="tip">
      <b>{p.acronym}</b> ({p.psi_id})<br />
      {FUEL_LABEL[p.fuel_class]}<br />
      About {p.o2_percent}% O2, about {p.pressure_kpa} kPa{p.pressure_assumed ? ' (pressure assumed)' : ''}<br />
      {p.n} run{p.n === 1 ? '' : 's'} in this bin
    </div>
  )
}

export default function EvidenceMap() {
  const { data, env, envId } = useApp()
  const [hidden, setHidden] = useState<FuelClass[]>([])
  const classes = useMemo(() => [...new Set(data.runs.map((r) => r.fuel_class))] as FuelClass[], [data])
  const near = useMemo(() => {
    if (env.o2_percent === null || env.pressure_kpa === null) return null
    const hit = data.runs.filter((r) => r.o2_percent !== null && r.pressure_kpa !== null && Math.abs(r.o2_percent - (env.o2_percent as number)) <= 5 && Math.abs(r.pressure_kpa - (env.pressure_kpa as number)) <= 10)
    const by: Record<string, number> = {}
    hit.forEach((r) => (by[FUEL_LABEL[r.fuel_class]] = (by[FUEL_LABEL[r.fuel_class]] ?? 0) + r.n))
    return { total: hit.reduce((s, r) => s + r.n, 0), by, assumed: hit.filter((r) => r.pressure_assumed).reduce((s, r) => s + r.n, 0) }
  }, [data, env])
  const total = data.runs.reduce((s, r) => s + r.n, 0)
  const withO2 = data.investigations.filter((i) => i.conditions.o2_percent).sort((a, b) => (b.conditions.o2_percent!.max as number) - (a.conditions.o2_percent!.max as number))
  const ins = data.insights
  const tableRows = useMemo(() => {
    const by: Record<string, { acr: string; fuel: FuelClass; n: number; o: [number, number]; p: [number, number]; assumed: boolean }> = {}
    data.runs.forEach((r) => {
      const b = (by[r.psi_id] ??= { acr: r.acronym, fuel: r.fuel_class, n: 0, o: [Infinity, -Infinity], p: [Infinity, -Infinity], assumed: r.pressure_assumed })
      b.n += r.n
      b.o = [Math.min(b.o[0], r.o2_percent as number), Math.max(b.o[1], r.o2_percent as number)]
      b.p = [Math.min(b.p[0], r.pressure_kpa as number), Math.max(b.p[1], r.pressure_kpa as number)]
    })
    return Object.entries(by)
  }, [data])

  return (
    <>
      <div className="hero">
        <h1>Where has NASA actually tested, and where will crews live?</h1>
        <p>Each mark is a group of real experiment runs from PSI data tables, placed by oxygen level and pressure. The ring is the environment you picked.</p>
      </div>
      <EnvPicker showTask={false} />
      <section className="panel">
        <h2>Tested conditions: {total.toLocaleString()} runs with both oxygen and pressure</h2>
        <div className="legend" role="group" aria-label="Fuel types shown">
          {classes.map((c) => (
            <button key={c} className={hidden.includes(c) ? 'off' : ''} aria-pressed={!hidden.includes(c)} onClick={() => setHidden(hidden.includes(c) ? hidden.filter((x) => x !== c) : [...hidden, c])}>
              <span className="sw" style={{ background: COLOR[c] }} /> {FUEL_LABEL[c]} ({SHAPE[c]})
            </button>
          ))}
          <span className="dim">Faded marks: pressure assumed (cabin air), not recorded.</span>
        </div>
        <div className="chart" role="img" aria-label={`Scatter chart of tested oxygen and pressure. Selected environment: ${env.o2_percent}% oxygen at ${env.pressure_kpa} kPa.`}>
          <ResponsiveContainer width="100%" height={460}>
            <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 12 }}>
              <CartesianGrid stroke="#24304a" />
              <XAxis type="number" dataKey="o2_percent" domain={[10, 100]} ticks={[10, 21, 30, 40, 50, 60, 70, 85, 100]} stroke="#9fb0cc" label={{ value: 'Oxygen (% by volume)', position: 'bottom', fill: '#9fb0cc', offset: 12 }} />
              <YAxis type="number" dataKey="pressure_kpa" scale="log" domain={[25, 560]} allowDataOverflow ticks={[29.6, 50, 70.3, 101.3, 200, 300, 500]} stroke="#9fb0cc" label={{ value: 'Pressure (kPa, log scale)', angle: -90, position: 'insideLeft', fill: '#9fb0cc' }} />
              <ZAxis type="number" dataKey="n" range={[40, 420]} />
              <Tooltip content={<Tip />} cursor={{ strokeDasharray: '3 3' }} />
              {classes.filter((c) => !hidden.includes(c)).flatMap((c) => [
                <Scatter key={c} name={FUEL_LABEL[c]} data={data.runs.filter((r) => r.fuel_class === c && !r.pressure_assumed)} fill={COLOR[c]} fillOpacity={0.75} shape={SHAPE[c]} isAnimationActive={false} />,
                <Scatter key={c + 'a'} name={FUEL_LABEL[c] + ' (pressure assumed)'} data={data.runs.filter((r) => r.fuel_class === c && r.pressure_assumed)} fill={COLOR[c]} fillOpacity={0.3} stroke={COLOR[c]} shape={SHAPE[c]} isAnimationActive={false} />,
              ])}
              {data.env.environments.filter((e) => e.id !== envId && e.o2_percent !== null).map((e) => (
                <ReferenceDot key={e.id} x={e.o2_percent as number} y={e.pressure_kpa as number} r={5} fill="none" stroke="#6b7a96" strokeDasharray="2 2" />
              ))}
              {env.o2_percent !== null && env.pressure_kpa !== null && (
                <ReferenceDot x={env.o2_percent} y={env.pressure_kpa} r={13} fill="none" stroke="#ff5d73" strokeWidth={3} label={{ value: env.name, position: 'bottom', offset: 18, fill: '#ffd0d6', fontSize: 13, fontWeight: 600 }} />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="dim">Runs are grouped to the nearest 1% oxygen and 5 kPa for display; mark size shows the number of runs. Source: experimental tables of BASS-II, FLEX, CFI, ACME Flame Design and ACME CFI-G in NASA PSI. Dashed rings are the other preset environments.</p>
        <details className="alt">
          <summary>Chart data as a table</summary>
          <table className="grid">
            <thead><tr><th>Investigation</th><th>Fuel type</th><th>Runs on the chart</th><th>Oxygen (grouped), %</th><th>Pressure (grouped), kPa</th></tr></thead>
            <tbody>{tableRows.map(([id, b]) => <tr key={id}><td>{b.acr} ({id})</td><td>{FUEL_LABEL[b.fuel]}</td><td>{b.n}</td><td>{b.o[0]} to {b.o[1]}</td><td>{b.p[0] === b.p[1] ? b.p[0] : `${b.p[0]} to ${b.p[1]}`}{b.assumed ? ' (assumed)' : ''}</td></tr>)}</tbody>
          </table>
        </details>
        {near && (
          <p className="callout">
            <b>{near.total}</b> of {total.toLocaleString()} runs are within 5 oxygen points and 10 kPa of {env.name.toLowerCase()}
            {near.total > 0 && <> ({Object.entries(near.by).map(([k, v]) => `${k}: ${v}`).join(', ')}{near.assumed ? `; ${near.assumed} with assumed pressure` : ''})</>}. <span className="dim">Counted from the grouped marks.</span>
          </p>
        )}
      </section>
      <section className="stats">
        <div className="stat"><b>{ins.max_o2_solid.value}%</b><span>highest oxygen in any solid-fuel data table ({ins.max_o2_solid.acronym})</span></div>
        <div className="stat"><b>{ins.solid_investigations_with_recorded_pressure}</b><span>solid-fuel investigations whose table records pressure</span></div>
        <div className="stat"><b>{ins.runs_o2_ge_30_and_p_le_75.total}</b><span>runs at 30% oxygen or more and 75 kPa or less; {ins.runs_o2_ge_30_and_p_le_75.solid} of them with solid fuels</span></div>
        <div className="stat"><b>{data.investigations.filter((i) => i.conditions.gravity_g.values.some((v) => v > 0.05 && v < 0.95)).length}</b><span>investigations at partial gravity (Moon or Mars)</span></div>
      </section>
      <section className="panel">
        <h2>Oxygen range tested, by investigation</h2>
        <p className="dim">Bar = lowest to highest oxygen level in the data table. The line marks this environment ({env.o2_percent}%).</p>
        <div className="ranges">
          {withO2.map((i) => {
            const c = i.conditions.o2_percent!
            const lo = c.min as number, hi = c.max as number
            return (
              <div key={i.psi_id} className="range-row">
                <span className="rlabel">{i.acronym}</span>
                <span className="rtrack">
                  <span className="rbar" style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 0.8)}%`, background: COLOR[i.fuel_class] }} />
                  {env.o2_percent !== null && <span className="rline" style={{ left: `${env.o2_percent}%` }} />}
                </span>
                <span className="rval">{fmtRange(c, '%')}</span>
              </div>
            )
          })}
          <div className="range-row axis"><span className="rlabel" /><span className="rtrack"><span style={{ left: 0 }}>0%</span><span style={{ left: '50%' }}>50%</span><span style={{ left: '100%' }}>100%</span></span><span className="rval" /></div>
        </div>
      </section>
    </>
  )
}
