import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { loadData, type AppData } from './lib/data'
import type { Environment, Task, Weights } from './lib/types'
import Briefing from './pages/Briefing'
import Rank from './pages/Rank'
import EvidenceMap from './pages/EvidenceMap'
import Explorer from './pages/Explorer'
import Compare from './pages/Compare'
import About from './pages/About'
import Ask from './pages/Ask'
import HowAI from './pages/HowAI'

interface Ctx {
  data: AppData
  envId: string
  setEnvId: (id: string) => void
  custom: Environment
  setCustom: (e: Environment) => void
  env: Environment
  taskId: string
  setTaskId: (id: string) => void
  task: Task
  weights: Weights
  setWeights: (w: Weights) => void
  compare: string[]
  toggleCompare: (id: string) => void
  setCompare: (ids: string[]) => void
}
const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => useContext(AppCtx) as Ctx

export const DISCLAIMER =
  'FlameMap is a student hackathon project and a research-navigation aid. It ranks how closely past NASA experiments match a chosen environment. It does not predict fire behavior, assess risk or certify safety, and it is not NASA guidance. Always consult the original PSI records and publications.'

const TITLES: Record<string, string> = { '/': 'Mission briefing', '/rank': 'Rank', '/map': 'Evidence map', '/explorer': 'Explorer', '/compare': 'Compare', '/ask': 'Ask the evidence', '/ai': 'How the AI works', '/about': 'Method and sources' }
const num = (s: string | undefined) => (s === undefined || s === '' || s === 'x' || isNaN(Number(s)) ? null : Number(s))

/** Keeps the selection in the address (after the #) so a view can be shared as a link. */
function UrlSync() {
  const { data, envId, setEnvId, taskId, setTaskId, weights, setWeights, custom, setCustom, compare, setCompare } = useApp()
  const [params, setParams] = useSearchParams()
  const loc = useLocation()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const e = params.get('env')
    if (e && (e === 'custom' || data.env.environments.some((x) => x.id === e))) setEnvId(e)
    const t = params.get('task')
    if (t && data.env.tasks.some((x) => x.id === t)) setTaskId(t)
    const w = params.get('w')?.split('_').map(Number)
    if (w && w.length === 5 && w.every((x) => !isNaN(x) && x >= 0 && x <= 1)) setWeights({ o2: w[0], pressure: w[1], flow: w[2], gravity: w[3], task: w[4] })
    const c = params.get('c')?.split('_')
    if (c && c.length === 4 && num(c[0]) !== null && num(c[1]) !== null && num(c[2]) !== null) setCustom({ ...custom, o2_percent: num(c[0]), pressure_kpa: num(c[1]), gravity_g: num(c[2]) as number, flow_cm_s: num(c[3]) })
    const cmp = params.get('cmp')?.split('_').map((n) => `PSI-${n}`).filter((id) => data.investigations.some((i) => i.psi_id === id)).slice(0, 3)
    if (cmp?.length) setCompare(cmp)
    // Links shared before the briefing became the home page pointed at the ranking; ones that carry ranking-only settings still open it.
    if (loc.pathname === '/' && (params.has('w') || params.has('cmp') || e === 'custom')) navigate(`/rank?${params.toString()}`, { replace: true })
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!ready) return
    const p = new URLSearchParams()
    p.set('env', envId)
    p.set('task', taskId)
    const d = data.env.default_weights
    if ((Object.keys(d) as (keyof typeof d)[]).some((k) => d[k] !== weights[k])) p.set('w', [weights.o2, weights.pressure, weights.flow, weights.gravity, weights.task].join('_'))
    if (envId === 'custom') p.set('c', [custom.o2_percent, custom.pressure_kpa, custom.gravity_g, custom.flow_cm_s ?? 'x'].join('_'))
    if (compare.length) p.set('cmp', compare.map((id) => id.replace('PSI-', '')).join('_'))
    if (p.toString() !== params.toString()) setParams(p, { replace: true })
    document.title = `${TITLES[loc.pathname] ?? 'FlameMap'} | FlameMap`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, envId, taskId, weights, custom, compare, loc.pathname, params.toString()])
  return null
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [envId, setEnvId] = useState('iss')
  const [taskId, setTaskId] = useState('prevent')
  const [weights, setWeights] = useState<Weights | null>(null)
  const [compare, setCompare] = useState<string[]>([])
  const [custom, setCustom] = useState<Environment>({ id: 'custom', name: 'Custom environment', o2_percent: 34, pressure_kpa: 56.5, gravity_g: 0.166, flow_cm_s: null, sources: [], note: 'Your own values.' })

  useEffect(() => {
    loadData().then(setData).catch((e) => setError(String(e.message ?? e)))
  }, [])

  const ctx = useMemo<Ctx | null>(() => {
    if (!data) return null
    const env = envId === 'custom' ? custom : (data.env.environments.find((e) => e.id === envId) ?? data.env.environments[0])
    const task = data.env.tasks.find((t) => t.id === taskId) ?? data.env.tasks[0]
    return {
      data, envId, setEnvId, custom, setCustom, env, taskId, setTaskId, task,
      weights: weights ?? data.env.default_weights, setWeights,
      compare, setCompare,
      toggleCompare: (id) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id])),
    }
  }, [data, envId, custom, taskId, weights, compare])

  if (error) return <div className="center"><h1>FlameMap</h1><p role="alert">The data files could not be loaded. {error}</p></div>
  if (!ctx) return <div className="center"><p>Loading NASA PSI data…</p></div>

  return (
    <AppCtx.Provider value={ctx}>
      <HashRouter>
        <UrlSync />
        <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>Skip to main content</a>
        <header className="top">
          <div className="brand">
            <span className="logo" aria-hidden="true" />
            <div>
              <strong>FlameMap</strong>
              <span className="tag">SI-powered fire-safety evidence briefings for crewed space missions</span>
            </div>
          </div>
          <nav aria-label="Main">
            <div className="navgroup ai" role="group" aria-label="AI">
              <span className="navlabel" aria-hidden="true">AI</span>
              <NavLink to="/" end>Briefing</NavLink>
              <NavLink to="/ask">Ask the evidence</NavLink>
              <NavLink to="/ai">How the AI works</NavLink>
            </div>
            <div className="navgroup" role="group" aria-label="Data">
              <span className="navlabel" aria-hidden="true">Data</span>
              <NavLink to="/rank">Rank</NavLink>
              <NavLink to="/map">Evidence map</NavLink>
              <NavLink to="/explorer">Explorer</NavLink>
              <NavLink to="/compare">Compare{compare.length ? ` (${compare.length})` : ''}</NavLink>
              <NavLink to="/about">Method and sources</NavLink>
            </div>
          </nav>
        </header>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Briefing />} />
            <Route path="/rank" element={<Rank />} />
            <Route path="/map" element={<EvidenceMap />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/ai" element={<HowAI />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer>
          <p>{DISCLAIMER}</p>
          <p>
            Data: NASA Physical Sciences Informatics (PSI), snapshot {data!.insights.snapshot_date}. <NavLink to="/about">Method, limits and sources</NavLink>
          </p>
        </footer>
      </HashRouter>
    </AppCtx.Provider>
  )
}
