import { useApp } from '../App'
import { psi } from '../lib/data'

const STATUS: Record<string, string> = { verified: 'sourced', from_challenge_statement: 'from challenge statement', nominal_assumption: 'assumption', reference: 'reference value' }

export default function EnvPicker({ showTask = true }: { showTask?: boolean }) {
  const { data, envId, setEnvId, env, custom, setCustom, taskId, setTaskId } = useApp()
  const src = (f: string) => env.sources.find((s) => s.field === f)
  const chip = (f: string) => {
    const s = src(f)
    if (!s) return envId === 'custom' ? <span className="chip">your value</span> : null
    const label = <span className={`chip st-${s.status}`} title={s.note}>{STATUS[s.status]}</span>
    return s.url ? <a href={s.url} target="_blank" rel="noreferrer">{label}</a> : label
  }
  const slider = (label: string, key: 'o2_percent' | 'pressure_kpa' | 'gravity_g' | 'flow_cm_s', min: number, max: number, step: number, unit: string) => (
    <label className="slider">
      <span>{label}: <b>{custom[key] === null ? 'not set' : `${custom[key]} ${unit}`}</b></span>
      <input type="range" min={min} max={max} step={step} value={custom[key] ?? min} onChange={(e) => setCustom({ ...custom, [key]: Number(e.target.value) })} />
    </label>
  )
  return (
    <section className="panel picker" aria-label="Environment and task">
      <div className="pick-row">
        <div>
          <h2>1. Environment</h2>
          <div className="seg" role="group" aria-label="Environment">
            {[...data.env.environments, custom].map((e) => (
              <button key={e.id} aria-pressed={envId === e.id} className={envId === e.id ? 'on' : ''} onClick={() => setEnvId(e.id)}>
                {e.id === 'custom' ? 'Custom' : e.name}
              </button>
            ))}
          </div>
        </div>
        {showTask && (
          <div>
            <h2>2. Fire-safety task</h2>
            <div className="seg" role="group" aria-label="Fire-safety task">
              {data.env.tasks.map((t) => (
                <button key={t.id} aria-pressed={taskId === t.id} className={taskId === t.id ? 'on' : ''} onClick={() => setTaskId(t.id)}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {envId === 'custom' && (
        <div className="sliders">
          {slider('Oxygen', 'o2_percent', 10, 100, 1, '%')}
          {slider('Pressure', 'pressure_kpa', 20, 110, 0.5, 'kPa')}
          {slider('Gravity', 'gravity_g', 0, 1, 0.01, 'g')}
          {slider('Airflow', 'flow_cm_s', 0, 100, 1, 'cm/s')}
          {custom.flow_cm_s !== null && <button className="link" onClick={() => setCustom({ ...custom, flow_cm_s: null })}>Clear airflow</button>}
        </div>
      )}
      <dl className="conds">
        <div><dt>Oxygen</dt><dd>{env.o2_percent}% {chip('o2_percent')}</dd></div>
        <div><dt>Pressure</dt><dd>{env.pressure_kpa} kPa <span className="dim">({psi(env.pressure_kpa as number)} psi)</span> {chip('pressure_kpa')}</dd></div>
        <div><dt>Gravity</dt><dd>{env.gravity_g} g {chip('gravity_g')}</dd></div>
        <div><dt>Airflow</dt><dd>{env.flow_cm_s === null ? <span className="dim">not set (not scored)</span> : `${env.flow_cm_s} cm/s`}</dd></div>
      </dl>
      {env.note && <p className="note">{env.note}</p>}
    </section>
  )
}
